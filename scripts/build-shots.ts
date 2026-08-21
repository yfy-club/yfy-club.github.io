/**
 * 项目截图流水线。规格 4.3.1。
 *
 *   npm run shots:build                       从默认源目录取图
 *   npm run shots:build -- --src=D:/other     换个源目录
 *
 * 源图在主站仓库 yfy/public/images/works/，统一 1920×1079~1086、25–191 KB。
 * 本工程不依赖那个仓库存在：脚本只在本地跑一次，产物提交进 git，
 * 构建期不碰这个脚本，源目录缺失时脚本失败但 npm run build 照跑。
 *
 * 产出两样东西：
 *   public/images/stage/<id>-{1600,960}.webp   实图，主图两档，副图只出 960
 *   src/data/shots.generated.ts                尺寸清单 + 内联 LQIP data URI
 *
 * LQIP 不用 blurhash：那玩意要在运行时用 canvas 解码，为占位图多背 2 KB JS。
 * 构建期出 20px 宽的 WebP 内联成 data URI 是同样的 300–600 字节，零运行时。
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = join(ROOT, 'public/images/stage')
const MANIFEST = join(ROOT, 'src/data/shots.generated.ts')

/** 源目录。主站仓库的 works 图库，可用 --src= 覆盖。 */
const DEFAULT_SRC = 'G:/Code/Other/yfy/public/images/works'

/** 主图两档宽度。960 给 <2x 的窄屏，1600 给宽屏与高 DPR。 */
const HERO_WIDTHS = [1600, 960] as const

/** 副图只在展开的档案面板里出现，用不着 1600。 */
const SIDE_WIDTHS = [960] as const

/** LQIP 宽度。20px 足够给出色调与版式块，再宽只是白白涨字节。 */
const LQIP_WIDTH = 20

/** WebP 质量。源图本来就是 WebP，再压一遍要留够余量避免二次伪影。 */
const QUALITY = 78

interface ShotSpec {
  /** 产物文件名前缀，也是清单里的键。 */
  id: string
  /** 相对源目录的路径。 */
  from: string
  /** 主图出两档，副图出一档。 */
  hero: boolean
}

/**
 * 选片见规格 4.3.1。
 * 不选 zgyc-light.webp：那张截图处于设备全离线状态（在线率 0%、离线 408），
 * 当门面会被读成系统不可用。
 */
const SHOTS: readonly ShotSpec[] = [
  { id: 'zgyc-map', from: 'zgyc-smart-light/zgyc-feature-map.webp', hero: true },
  { id: 'zgyc-realtime', from: 'zgyc-smart-light/zgyc-monitor-realtime.webp', hero: false },
  { id: 'zgyc-policy', from: 'zgyc-smart-light/zgyc-lighting-policy.webp', hero: false },
  { id: 'zgyc-alarm', from: 'zgyc-smart-light/zgyc-alarm-center.webp', hero: false },
  { id: 'zhixueban-knowledge', from: 'zhixueban/zhixueban-knowledge.webp', hero: true },
  { id: 'zhixueban-chat', from: 'zhixueban/zhixueban-ai-chat.webp', hero: false },
  { id: 'zhixueban-roadmap', from: 'zhixueban/zhixueban-roadmap.webp', hero: false },
  { id: 'matrix-main', from: 'matrix-calculator/matrix-light.webp', hero: true },
  { id: 'matrix-trace', from: 'matrix-calculator/matrix-trace-light.webp', hero: false },
]

function argValue(name: string) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))
  return hit?.slice(name.length + 3)
}

async function main() {
  const src = argValue('src') ?? DEFAULT_SRC
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const rows: string[] = []
  let bytes = 0

  for (const spec of SHOTS) {
    const buf = await readFile(join(src, spec.from))
    const meta = await sharp(buf).metadata()
    const widths = spec.hero ? HERO_WIDTHS : SIDE_WIDTHS
    const out: string[] = []

    for (const w of widths) {
      const file = `${spec.id}-${w}.webp`
      const data = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
      await writeFile(join(OUT_DIR, file), data)
      bytes += data.byteLength
      out.push(`${w}w ${(data.byteLength / 1024).toFixed(0)}KB`)
    }

    const lqip = await sharp(buf)
      .resize({ width: LQIP_WIDTH })
      .webp({ quality: 40, alphaQuality: 40 })
      .toBuffer()

    rows.push(
      [
        `  '${spec.id}': {`,
        `    width: ${meta.width},`,
        `    height: ${meta.height},`,
        `    widths: [${widths.join(', ')}],`,
        `    lqip: 'data:image/webp;base64,${lqip.toString('base64')}',`,
        '  },',
      ].join('\n'),
    )

    console.log(`  ${spec.id.padEnd(20)} ${out.join('  ')}   lqip ${lqip.byteLength}B`)
  }

  await writeFile(MANIFEST, render(rows), 'utf8')

  console.log(`\n实图合计 ${(bytes / 1024).toFixed(0)} KB → ${relative(ROOT, OUT_DIR)}`)
  console.log(`清单 → ${relative(ROOT, MANIFEST)}`)
}

function render(rows: string[]) {
  return `/* 由 scripts/build-shots.ts 生成，不要手改。选片与档位见 docs/design-spec.md 4.3.1。 */

export interface ShotAsset {
  /** 源图像素宽高，用来锁 aspect-ratio，防止图片加载前抖版。 */
  width: number
  height: number
  /** 已产出的档位，降序。第一个是最大档。 */
  widths: readonly number[]
  /** 20px 宽的内联占位图。零运行时解码，直接当 background-image。 */
  lqip: string
}

export const SHOTS = {
${rows.join('\n')}
} as const

export type ShotId = keyof typeof SHOTS

const BASE = '/images/stage'

/** srcset 用的候选列表。 */
export function shotSrcSet(id: ShotId) {
  return SHOTS[id].widths.map((w) => \`\${BASE}/\${id}-\${w}.webp \${w}w\`).join(', ')
}

/** src 兜底取最小档，避免不支持 srcset 的环境直接拉大图。 */
export function shotSrc(id: ShotId) {
  const widths = SHOTS[id].widths
  return \`\${BASE}/\${id}-\${widths[widths.length - 1]}.webp\`
}
`
}

await main()
