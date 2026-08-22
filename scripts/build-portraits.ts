/**
 * 角色立绘流水线。规格 3.1（M8 修正后）。
 *
 *   npm run portraits:build                    从 assets-src/characters 取图
 *   npm run portraits:build -- --src=D:/other  换个源目录
 *
 * 源图是 NovelAI 产出的透明 PNG，约 830×1210，四边全部出血（没有留白）。
 * 源图不进 public/：那是 4.7 MB 无损原稿，进 public 就会被原样部署。
 * 只在本地跑一次，产物提交进 git，构建期不碰这个脚本。
 *
 * 产出两样东西：
 *   public/images/characters/<id>-{800,512,256}.webp
 *   src/data/portraits.generated.ts            尺寸 + 头部锚点 + 内联 LQIP
 *
 * 「头部锚点」是这个脚本存在的真正理由。halo 与道具原先按老矢量头写死在
 * geometry.ts 里（cx240 cy88 rx78），换成栅格立绘后环比脑袋还窄。
 * 现在改成从 alpha 通道实测每个人的发顶、颅宽、头中线，运行时按这三个数
 * 把 halo 摆上去——六人各画各的，但摆位不再是拍脑袋的常量。
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = join(ROOT, 'public/images/characters')
const MANIFEST = join(ROOT, 'src/data/portraits.generated.ts')

const DEFAULT_SRC = join(ROOT, 'assets-src/characters')

/**
 * 三档宽度。实测各展示位的 CSS 宽度：
 *   dock 挂件 104px、小卡约 240px、大卡约 360px、Hero 最大 clamp() 到 700px。
 * 配 2× DPR 就是 208 / 480 / 720 / 1400。源图只有 ~830 宽，800 就是天花板。
 */
const WIDTHS = [800, 512, 256] as const

/** LQIP 宽度。照抄 build-shots.ts：20px 够给出色调块，零运行时解码。 */
const LQIP_WIDTH = 20

/** 源图是无损 PNG，不存在二次压缩伪影，可以压得比展台图狠一档。 */
const QUALITY = 74
const ALPHA_QUALITY = 90

/** 判定「这个像素属于角色」的 alpha 阈值。WebP 的 alpha 边缘会有噪点。 */
const ALPHA_ON = 128

/** 一行至少这么多个不透明像素才算有内容，滤掉抠图残留的孤立点。 */
const MIN_RUN = 8

/** 发顶判据：第一条宽度达到画幅这么多比例的扫描线。低于它的是呆毛，不算发顶。 */
const HAIR_TOP_RATIO = 0.18

/** 颅宽取样带，相对内容高度。发顶往下 6%~26% 这一段是颅侧，还没散到鬓发与马尾。 */
const SKULL_BAND: readonly [number, number] = [0.06, 0.26]

export interface PortraitMetrics {
  width: number
  height: number
  /** 发顶。呆毛不算。归一化到画幅高。 */
  hairTop: number
  /** 内容最高点（含呆毛）。归一化到画幅高。halo 要留出它的空间。 */
  crownTop: number
  /** 颅宽。归一化到画幅宽。 */
  skullWidth: number
  /** 头中线。归一化到画幅宽。六张图并不都居中。 */
  headCenterX: number
}

function measure(data: Buffer, W: number, H: number): PortraitMetrics {
  const spans: (readonly [number, number] | null)[] = new Array(H).fill(null)
  let top = H
  let bottom = 0

  for (let y = 0; y < H; y++) {
    let l = -1
    let r = -1
    let n = 0
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3]! > ALPHA_ON) {
        n++
        if (l < 0) l = x
        r = x
      }
    }
    if (n >= MIN_RUN) {
      spans[y] = [l, r]
      if (y < top) top = y
      bottom = y
    }
  }

  const contentH = bottom - top + 1

  let hairTop = top
  for (let y = top; y <= bottom; y++) {
    const s = spans[y]
    if (s && s[1] - s[0] + 1 >= W * HAIR_TOP_RATIO) {
      hairTop = y
      break
    }
  }

  // 取样带内逐行的宽度与中心，各取中位数。用中位数不用均值：
  // 鬓发从某一行突然张开时均值会被那几行拽偏，中位数不会。
  const band: { w: number; c: number }[] = []
  for (
    let y = Math.round(hairTop + contentH * SKULL_BAND[0]);
    y <= Math.round(hairTop + contentH * SKULL_BAND[1]);
    y++
  ) {
    const s = spans[y]
    if (s) band.push({ w: s[1] - s[0] + 1, c: (s[0] + s[1]) / 2 })
  }
  const mid = <K extends 'w' | 'c'>(key: K) => {
    const sorted = band.map((b) => b[key]).sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)] ?? 0
  }

  return {
    width: W,
    height: H,
    hairTop: hairTop / H,
    crownTop: top / H,
    skullWidth: mid('w') / W,
    headCenterX: mid('c') / W,
  }
}

function argValue(name: string) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))
  return hit?.slice(name.length + 3)
}

async function main() {
  const src = argValue('src') ?? DEFAULT_SRC
  const files = (await readdir(src)).filter((f) => f.endsWith('.png')).sort()
  if (files.length === 0) throw new Error(`源目录没有 PNG：${src}`)

  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const rows: string[] = []
  let bytes = 0

  for (const file of files) {
    const id = file.replace(/\.png$/, '')
    const buf = await readFile(join(src, file))
    const raw = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const m = measure(raw.data, raw.info.width, raw.info.height)

    const out: string[] = []
    for (const w of WIDTHS) {
      const data = await sharp(buf)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, alphaQuality: ALPHA_QUALITY })
        .toBuffer()
      await writeFile(join(OUT_DIR, `${id}-${w}.webp`), data)
      bytes += data.byteLength
      out.push(`${w}w ${(data.byteLength / 1024).toFixed(0)}KB`)
    }

    const lqip = await sharp(buf)
      .resize({ width: LQIP_WIDTH })
      .webp({ quality: 40, alphaQuality: 40 })
      .toBuffer()

    rows.push(
      [
        `  ${id}: {`,
        `    width: ${m.width},`,
        `    height: ${m.height},`,
        `    hairTop: ${m.hairTop.toFixed(4)},`,
        `    crownTop: ${m.crownTop.toFixed(4)},`,
        `    skullWidth: ${m.skullWidth.toFixed(4)},`,
        `    headCenterX: ${m.headCenterX.toFixed(4)},`,
        `    lqip: 'data:image/webp;base64,${lqip.toString('base64')}',`,
        '  },',
      ].join('\n'),
    )

    console.log(
      `  ${id.padEnd(8)} ${out.join('  ')}   发顶 ${(m.hairTop * 100).toFixed(1)}%  ` +
        `呆毛顶 ${(m.crownTop * 100).toFixed(1)}%  颅宽 ${(m.skullWidth * 100).toFixed(1)}%  ` +
        `头中线 ${(m.headCenterX * 100).toFixed(1)}%`,
    )
  }

  await writeFile(MANIFEST, render(rows), 'utf8')

  console.log(`\n立绘合计 ${(bytes / 1024).toFixed(0)} KB / ${files.length * WIDTHS.length} 个文件`)
  console.log(`清单 → ${relative(ROOT, MANIFEST)}`)
}

function render(rows: string[]) {
  return `/* 由 scripts/build-portraits.ts 生成，不要手改。测量口径见该脚本头注释。 */

export interface PortraitAsset {
  /** 源图像素宽高。锁 aspect-ratio 用，防止图片加载前抖版。 */
  width: number
  height: number
  /** 发顶（不含呆毛），归一化到画幅高。halo 摆位的纵向基准。 */
  hairTop: number
  /** 内容最高点（含呆毛），归一化到画幅高。 */
  crownTop: number
  /** 颅宽，归一化到画幅宽。halo 定宽的基准。 */
  skullWidth: number
  /** 头中线，归一化到画幅宽。六张图并不都居中。 */
  headCenterX: number
  /** 20px 宽的内联占位图。零运行时解码。 */
  lqip: string
}

export const PORTRAITS = {
${rows.join('\n')}
} as const

export type PortraitId = keyof typeof PORTRAITS

const BASE = '/images/characters'

/** 已产出的档位，降序。 */
export const PORTRAIT_WIDTHS = [${WIDTHS.join(', ')}] as const

export function portraitSrcSet(id: PortraitId) {
  return PORTRAIT_WIDTHS.map((w) => \`\${BASE}/\${id}-\${w}.webp \${w}w\`).join(', ')
}

/** src 兜底取最小档，不支持 srcset 的环境不至于直接拉大图。 */
export function portraitSrc(id: PortraitId) {
  return \`\${BASE}/\${id}-\${PORTRAIT_WIDTHS[PORTRAIT_WIDTHS.length - 1]}.webp\`
}

/** Hero 的 NAVI 是 LCP 元素，预载取最大档。 */
export function portraitSrcLarge(id: PortraitId) {
  return \`\${BASE}/\${id}-\${PORTRAIT_WIDTHS[0]}.webp\`
}
`
}

await main()
