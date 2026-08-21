/**
 * 字体子集构建。
 *
 * Fontsource 的 Noto Sans SC 中文分片是整块 1.1MB，不做 unicode-range 切片，
 * 直接引用会撑爆预算。这里按仓库里真正会上线的文本扫描语料，重新切一次。
 *
 *   npm run fonts:subset
 *
 * 产物写入 src/assets/fonts/，配套生成 src/styles/fonts.css（含 unicode-range）。
 * 两者都要提交进仓库，否则拉下来的人跑 build 会缺字。
 *
 * 语料按作用域切成两份：
 *   ui   —— 首屏与常驻界面文本，随页面一起加载
 *   docs —— 仅 /docs 长文独有的字，靠 unicode-range 让浏览器按需下载
 * docs 分片的 range 是「docs 语料减去 ui 语料」的差集，首屏不会碰它。
 */
import { readFile, writeFile, mkdir, readdir, stat, rm } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const FONTSOURCE = join(ROOT, 'node_modules/@fontsource/noto-sans-sc/files')
const OUT_DIR = join(ROOT, 'src/assets/fonts')
const CSS_OUT = join(ROOT, 'src/styles/fonts.css')

/**
 * 正文与标题只产 400 与 700 两档中文字重。
 *
 * 900 不进这张表：全站唯一需要 display 级重量的是首屏「云飞扬」三个字，
 * 单独切一份三字微分片（见 WORDMARK），不背整份 900 中文分片。
 */
const WEIGHTS = [400, 700] as const

/**
 * 字标微分片的语料。只有这三个字用 900，别处一律 400 / 700。
 * 改字标先改这里，再改 src/components/hero/wordmark.tsx，两边必须一致。
 */
const WORDMARK = '云飞扬'

/**
 * 首屏字体预算，单位 KB。超了直接失败。
 * 依据与实测过程见 docs/design-spec.md 第 7 节。
 */
const BUDGET_KB = 160

/** 拉丁分片始终包含：ASCII 可打印 + 站内排版符号。 */
const LATIN_BASE = (() => {
  let s = ''
  for (let c = 0x20; c <= 0x7e; c += 1) s += String.fromCharCode(c)
  return `${s}—–‘’“”…·↗×→←↑↓™€°±≤≥≠§¶`
})()

/**
 * 上线文本的来源。内部规格文档（docs/design-spec.md 等）不在其中，它们不上线。
 *
 * 三个作用域，产出三组分片，unicode-range 互不重叠：
 *   ui   首屏与常驻界面，随页面一起加载
 *   lab  只有 ?lab=1 的 M2 验收页会渲染的字，按需
 *   docs 只有 /docs 长文会渲染的字，按需
 * 后两组靠 unicode-range 让浏览器在首屏根本不去下载。
 */
const SCOPES = {
  ui: ['src', 'index.html'],
  lab: ['src/mascot-lab.tsx', 'src/components/mascot/expressions.ts', 'src/components/mascot/hair.ts'],
  docs: ['docs/content-docs.md'],
} as const

/**
 * 这些文件的中文不在首屏渲染，扫 ui 时要跳过。
 *
 * expressions.ts 的 `intent` 与 hair.ts 的 `silhouette` 是给验收页看的说明串，
 * 它们跟着 mascot 模块进了 JS 包，但只有 ?lab=1 会把它们画到屏幕上。
 * 算进 ui 分片等于为一个内部工具页在首屏多背 99 个字。
 */
const LAB_OWNED = SCOPES.lab

/** 这些文件属于 docs 作用域，扫 ui 时要跳过，否则长文语料会漏进首屏分片。 */
const DOCS_OWNED = ['src/data/docs.ts']

/**
 * 只在正文出现的字段。700 的语料把它们剔掉。
 *
 * 为什么要分：400 与 700 共用一份语料时，每个新字收两遍钱。
 * 而能力关键词、项目简介、副标题这些字段全部走 400，从未用粗体渲染。
 *
 * 剔的只是「此字只在正文出现」的那部分：同一个字只要在任何标题字段里也出现过，
 * 就仍然留在 700 语料里。真漏了会显示成豆腐块，看得见。
 *
 * 新增正文字段就往这里加一行，不要抬 BUDGET_KB。
 */
const BODY_ONLY_FIELDS: Record<string, readonly string[]> = {
  'index.html': ['content'],
  'src/App.tsx': ['note'],
  'src/data/tracks.ts': ['keys', 'tagline'],
  'src/data/projects.ts': ['brief'],
}

const SCAN_EXT = new Set(['.ts', '.tsx', '.md', '.html'])

const isCjk = (cp: number) =>
  (cp >= 0x2e80 && cp <= 0x2eff) ||
  (cp >= 0x3000 && cp <= 0x303f) ||
  (cp >= 0x31c0 && cp <= 0x31ef) ||
  (cp >= 0x3400 && cp <= 0x4dbf) ||
  (cp >= 0x4e00 && cp <= 0x9fff) ||
  (cp >= 0xf900 && cp <= 0xfaff) ||
  (cp >= 0xfe30 && cp <= 0xfe4f) ||
  (cp >= 0xff00 && cp <= 0xffef)

/**
 * 去掉注释再取字。注释里的中文不会上线，算进语料会白白多背几十 KB。
 * 代价是字符串里出现 `//` 的极端情况会误删——真漏了字会显示成豆腐块，看得见。
 */
function stripComments(source: string, ext: string) {
  if (ext === '.md' || ext === '.html') return source
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ')
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (SCAN_EXT.has(extname(entry.name))) yield full
  }
}

/** 把一段文本里的汉字撑成集合。 */
function cjkOf(text: string) {
  const out = new Set<string>()
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    if (cp !== undefined && isCjk(cp)) out.add(ch)
  }
  return out
}

/**
 * 正文字段的匹配。开头的 \b 防止 `note` 误匹 `footnote`。
 * 只接单引号与反引号的单行字面量——本工程的文案全是这两种写法。
 */
const fieldPattern = (name: string) => new RegExp(`\\b${name}\\s*[:=]\\s*['\`]([^'\`]*)['\`]`, 'g')

interface Corpus {
  /** 该作用域的全部汉字。400 用这份。 */
  chars: Set<string>
  /** 只在正文字段里出现、从未在其他地方出现的字。700 不装这份。 */
  bodyOnly: Set<string>
  fileCount: number
}

async function collect(roots: readonly string[], skip: readonly string[] = []): Promise<Corpus> {
  const skipAbs = new Set(skip.map((p) => join(ROOT, p)))
  const chars = new Set<string>()
  /** 正文字段里的字。 */
  const body = new Set<string>()
  /** 正文字段以外的字。两边都出现的字不算正文独有。 */
  const rest = new Set<string>()
  let fileCount = 0

  const files: string[] = []
  for (const root of roots) {
    const abs = join(ROOT, root)
    try {
      const info = await stat(abs)
      if (info.isDirectory()) {
        for await (const file of walk(abs)) files.push(file)
      } else {
        files.push(abs)
      }
    } catch {
      // 目录还不存在（早期里程碑），跳过
    }
  }

  for (const file of files) {
    if (skipAbs.has(file)) continue
    fileCount += 1
    const text = stripComments(await readFile(file, 'utf8'), extname(file))
    for (const ch of cjkOf(text)) chars.add(ch)

    const fields = BODY_ONLY_FIELDS[relative(ROOT, file).split('\\').join('/')]
    if (!fields) {
      for (const ch of cjkOf(text)) rest.add(ch)
      continue
    }

    // 正文字段敲下来单独统计，剔掉后剩下的那部分算非正文
    let residue = text
    for (const name of fields) {
      for (const m of text.matchAll(fieldPattern(name))) {
        for (const ch of cjkOf(m[1] ?? '')) body.add(ch)
        residue = residue.split(m[0]).join(' ')
      }
    }
    for (const ch of cjkOf(residue)) rest.add(ch)
  }

  const bodyOnly = new Set([...body].filter((c) => !rest.has(c)))
  return { chars, bodyOnly, fileCount }
}

/** 把码点集合压成 CSS unicode-range，连续段合并，否则这行会有几千个字符。 */
function toUnicodeRange(chars: Set<string>) {
  const points = [...chars]
    .map((c) => c.codePointAt(0)!)
    .sort((a, b) => a - b)

  const hex = (n: number) => `U+${n.toString(16).toUpperCase()}`
  const parts: string[] = []
  let start = points[0]
  let prev = points[0]

  for (const cp of points.slice(1)) {
    if (cp === prev + 1) {
      prev = cp
      continue
    }
    parts.push(start === prev ? hex(start) : `${hex(start)}-${prev.toString(16).toUpperCase()}`)
    start = cp
    prev = cp
  }
  parts.push(start === prev ? hex(start) : `${hex(start)}-${prev.toString(16).toUpperCase()}`)

  return parts.join(', ')
}

async function subsetOne(srcFile: string, outFile: string, text: string) {
  const result = await subsetFont(await readFile(srcFile), text, { targetFormat: 'woff2' })
  await writeFile(outFile, result)
  return result.byteLength / 1024
}

const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, ' +
  'U+2000-206F, U+2074, U+20AC, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD'

async function main() {
  const ui = await collect(SCOPES.ui, [...DOCS_OWNED, ...LAB_OWNED])
  const lab = await collect(SCOPES.lab)
  const docs = await collect(SCOPES.docs)

  // 后两组只保留 ui 没有的字，且互不重叠——unicode-range 交叠会让浏览器拉两份。
  const labOnly = new Set([...lab.chars].filter((c) => !ui.chars.has(c)))
  const docsOnly = new Set(
    [...docs.chars].filter((c) => !ui.chars.has(c) && !labOnly.has(c)),
  )

  /**
   * 700 的语料。ui 全量减掉只在正文出现的字。
   *
   * 被剔掉的字在 700 没有对应的 face，浏览器会拿 400 那份上——
   * 这些字本来就不会用粗体渲染，看不出差别。真漏了会变假粗体，看得见。
   */
  const uiBold = new Set([...ui.chars].filter((c) => !ui.bodyOnly.has(c)))

  // 先清空产物目录。字重或作用域调整后会留下孤儿文件，留着会被误当成还在用。
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  console.log(`ui   语料：${ui.fileCount} 个文件，${ui.chars.size} 字，700 只装 ${uiBold.size} 字（剔掉 ${ui.bodyOnly.size} 个正文独有字）`)
  console.log(`lab  语料：${lab.fileCount} 个文件，${lab.chars.size} 字，其中 ${labOnly.size} 字为 lab 独有`)
  console.log(`docs 语料：${docs.fileCount} 个文件，${docs.chars.size} 字，其中 ${docsOnly.size} 字为 docs 独有\n`)

  const faces: string[] = []
  const critical: { file: string; kb: number }[] = []
  const deferred: { file: string; kb: number }[] = []

  for (const weight of WEIGHTS) {
    const latin = `noto-sans-sc-latin-${weight}.woff2`
    const latinKb = await subsetOne(
      join(FONTSOURCE, `noto-sans-sc-latin-${weight}-normal.woff2`),
      join(OUT_DIR, latin),
      LATIN_BASE,
    )
    critical.push({ file: latin, kb: latinKb })
    faces.push(face(latin, weight, LATIN_RANGE))

    const cjkSrc = join(FONTSOURCE, `noto-sans-sc-chinese-simplified-${weight}-normal.woff2`)

    const uiSet = weight === 700 ? uiBold : ui.chars
    const cjkUi = `noto-sans-sc-cjk-${weight}-ui.woff2`
    const cjkUiKb = await subsetOne(cjkSrc, join(OUT_DIR, cjkUi), [...uiSet].sort().join(''))
    critical.push({ file: cjkUi, kb: cjkUiKb })
    faces.push(face(cjkUi, weight, toUnicodeRange(uiSet)))

    for (const [name, set] of [
      ['lab', labOnly],
      ['docs', docsOnly],
    ] as const) {
      if (set.size === 0) continue
      const file = `noto-sans-sc-cjk-${weight}-${name}.woff2`
      const kb = await subsetOne(cjkSrc, join(OUT_DIR, file), [...set].sort().join(''))
      deferred.push({ file, kb })
      faces.push(face(file, weight, toUnicodeRange(set)))
    }
  }

  // 字标微分片。三个字，unicode-range 也只开这三个码点，别处碰不到 900。
  const wordmarkFile = 'noto-sans-sc-wordmark-900.woff2'
  const wordmarkKb = await subsetOne(
    join(FONTSOURCE, 'noto-sans-sc-chinese-simplified-900-normal.woff2'),
    join(OUT_DIR, wordmarkFile),
    WORDMARK,
  )
  critical.push({ file: wordmarkFile, kb: wordmarkKb })
  faces.push(face(wordmarkFile, 900, toUnicodeRange(new Set([...WORDMARK]))))

  for (const [path, label, weight] of [
    ['chakra-petch/files/chakra-petch-latin-500-normal.woff2', 'Chakra Petch 500', 500],
    ['chakra-petch/files/chakra-petch-latin-600-normal.woff2', 'Chakra Petch 600', 600],
  ] as const) {
    const info = await stat(join(ROOT, 'node_modules/@fontsource', path))
    critical.push({ file: `${label}（fontsource 原样）`, kb: info.size / 1024 })
    void weight
  }

  await writeFile(CSS_OUT, renderCss(faces), 'utf8')

  const width = Math.max(...[...critical, ...deferred].map((r) => r.file.length))
  const line = (r: { file: string; kb: number }) =>
    console.log(`  ${r.file.padEnd(width)}  ${r.kb.toFixed(1).padStart(7)} KB`)

  console.log('首屏（随页面加载）')
  critical.forEach(line)
  const total = critical.reduce((s, r) => s + r.kb, 0)
  console.log(`  ${'合计'.padEnd(width)}  ${total.toFixed(1).padStart(7)} KB  / 预算 ${BUDGET_KB} KB\n`)

  if (deferred.length) {
    console.log('/docs 追加（unicode-range 按需下载，不计入首屏）')
    deferred.forEach(line)
    console.log(`  ${'合计'.padEnd(width)}  ${deferred.reduce((s, r) => s + r.kb, 0).toFixed(1).padStart(7)} KB\n`)
  }

  console.log(`产物 ${relative(ROOT, OUT_DIR)}，样式 ${relative(ROOT, CSS_OUT)}`)

  if (total > BUDGET_KB) {
    console.error(`\n字体预算超标：${total.toFixed(1)} KB > ${BUDGET_KB} KB。先砍字重或砍语料，不要抬预算。`)
    process.exit(1)
  }
}

function face(file: string, weight: number, range: string) {
  return `@font-face {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('../assets/fonts/${file}') format('woff2');
  unicode-range: ${range};
}`
}

function renderCss(faces: string[]) {
  return `/* 由 scripts/subset-fonts.ts 生成，不要手改。改语料后跑 npm run fonts:subset。 */

@import '@fontsource/chakra-petch/latin-500.css';
@import '@fontsource/chakra-petch/latin-600.css';

${faces.join('\n\n')}
`
}

await main()
