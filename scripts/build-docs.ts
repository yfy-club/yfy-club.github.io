/**
 * 档案库内容流水线。
 *
 *   npm run docs:build
 *
 * 把 docs/articles/*.md 解析成结构化数据，代码块在构建期用 Shiki 高亮，
 * 产物写进 src/data/docs.ts 提交进仓库。运行时零成本，shiki 只在 devDependencies，不进包。
 * 与 scripts/build-shots.ts、scripts/subset-fonts.ts 同一套路：产物是仓内文件，不是构建期副作用。
 *
 * 高亮不用 Shiki 自带主题——它自带的全是深色系或 GitHub 浅色系，跟晴空令牌不是一套色。
 * 这里只认四个角色，token 落到 class 上，颜色留在 docs.css 里引令牌，产物 HTML 中没有一个 #hex：
 *
 *   （无 class）  普通正文    --ink-900   13.21:1
 *   tk-k         关键字/命令  --ink-900 700
 *   tk-s         字符串/数字  --sky-700    5.17:1
 *   tk-c         注释        --ink-600    6.16:1  斜体
 *
 * 注释原定 --ink-400，实测对 --bg-sunk 只有 3.13:1，低于 AA，已改。见 spec 4.4 的 M5 修正记录二。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHighlighter, type ThemeRegistrationRaw } from 'shiki'

const ARTICLES_DIR = fileURLToPath(new URL('../docs/articles', import.meta.url))
const CATS_FILE = fileURLToPath(new URL('../docs/categories.json', import.meta.url))
const OUT = fileURLToPath(new URL('../src/data/docs.ts', import.meta.url))

/**
 * 问答索引。规格 3.6（M9）。
 *
 * 只有**篇名与节标题**，不含正文。整份 17 篇 × 约 90 节，
 * 一次请求就能全部塞进 prompt——不需要分块、不需要向量库。
 *
 * 为什么与 docs.ts 同一个脚本产：两份东西必须永远同源。
 * 分两个脚本就会有一天改了成稿只跑了一个，然后 AI 指向一个已经不存在的锥点。
 */
const QA_INDEX_OUT = fileURLToPath(new URL('../worker/src/qa-index.json', import.meta.url))

/**
 * 高亮语言。成稿里出现的才打进来，多的不加载。
 * 档案库重构后成稿覆盖 C/C++、Java、数据库与工程配置，语言面相应扩开。
 */
const LANGS = ['bash', 'ts', 'css', 'sql', 'json', 'java', 'c', 'cpp', 'html'] as const

/**
 * 哨兵主题。
 *
 * 不给真实颜色，只给四个可辨认的哨兵值，出来后按值映射到 class。
 * 好处是 scope 规则仍然写在主题里（TextMate 主题本来就是干这个的），
 * 而颜色留在 CSS 里引令牌，改色不用重跑这个脚本。
 */
const SENTINEL = {
  '#000001': 'tk-k',
  '#000002': 'tk-s',
  '#000003': 'tk-c',
} as const

const THEME: ThemeRegistrationRaw = {
  name: 'yfy-sentinel',
  type: 'light',
  colors: { 'editor.foreground': '#000000', 'editor.background': '#000000' },
  settings: [
    { settings: { foreground: '#000000' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#000003' } },
    {
      scope: [
        'string.quoted',
        'punctuation.definition.string',
        'constant.numeric',
        'constant.language',
        'constant.character.escape',
        'support.constant',
        'variable.other.constant',
      ],
      settings: { foreground: '#000002' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'entity.name.function',
        'entity.name.type',
        'entity.name.tag',
        'entity.name.command',
        'support.function',
        'support.type',
        'support.class',
        'variable.language',
        'entity.other.attribute-name',
      ],
      settings: { foreground: '#000001' },
    },
    /*
     * 标点性的 token 拉回正文色。
     * 类型注解的冒号、箭头、展开号都挂在 keyword / storage 下，
     * 不排掉的话 `code: number` 会有三分之二加粗，读起来全是重音。
     */
    {
      scope: ['keyword.operator', 'storage.type.function.arrow', 'punctuation'],
      settings: { foreground: '#000000' },
    },
  ],
}

/* ====================================================================== */

interface Inline {
  t: 'text' | 'code' | 'strong' | 'link'
  v: string
  href?: string
}

type Block =
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'h4'; text: string }
  | { kind: 'para'; lines: Inline[][] }
  | { kind: 'code'; lang: string; html: string; raw?: string }
  | { kind: 'table'; head: Inline[][]; rows: Inline[][][] }
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'video'; provider: 'youtube' | 'bilibili'; id: string; title: string; bvid?: string }
  | { kind: 'details'; title: string; blocks: Block[] }

type Highlighter = Awaited<ReturnType<typeof createHighlighter>>

interface Article {
  slug: string
  index: string
  category: string
  title: string
  summary: string
  minutes: number
  headings: { id: string; text: string }[]
  blocks: Block[]
}

function parseStrongAndText(segment: string, out: Inline[]) {
  for (const seg of segment.split(/(\*\*[^*]+\*\*)/g)) {
    if (!seg) continue
    if (seg.startsWith('**') && seg.endsWith('**')) {
      out.push({ t: 'strong', v: seg.slice(2, -2) })
    } else {
      out.push({ t: 'text', v: seg })
    }
  }
}

/**
 * 行内标记。先切 `code`，再切 [link](url)，再在剩下的文本里切 **strong**。
 */
function inline(text: string): Inline[] {
  const out: Inline[] = []
  for (const piece of text.split(/(`[^`]+`)/g)) {
    if (!piece) continue
    if (piece.startsWith('`') && piece.endsWith('`')) {
      out.push({ t: 'code', v: piece.slice(1, -1) })
      continue
    }
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = linkRegex.exec(piece)) !== null) {
      if (match.index > lastIndex) {
        parseStrongAndText(piece.slice(lastIndex, match.index), out)
      }
      out.push({ t: 'link', v: match[1]!, href: match[2]! })
      lastIndex = linkRegex.lastIndex
    }
    if (lastIndex < piece.length) {
      parseStrongAndText(piece.slice(lastIndex), out)
    }
  }
  return out
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 表格行切成单元格。首尾的竖线是分隔符不是内容。 */
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => inline(c.trim()))

/**
 * 围栏后的代码块。主循环与折叠区嵌套循环共用。
 * 返回 next：闭合围栏所在行（没有闭合围栏时为末行之后）。
 */
function readCode(lines: string[], start: number, lang: string, hl: Highlighter) {
  const body: string[] = []
  let i = start
  while (i < lines.length && !/^```\s*$/.test(lines[i]!.trim())) {
    body.push(lines[i]!)
    i += 1
  }
  const code = body.join('\n')
  const known = LANGS.find((l) => l === lang)
  const block: Block = {
    kind: 'code',
    lang: known ?? '',
    raw: code,
    html: known ? highlight(hl, code, known) : escapeHtml(code),
  }
  return { block, next: i }
}

/**
 * 表头行开始的表格。主循环与折叠区嵌套循环共用。
 * 返回 next：表格最后一行（调用方循环自增后正好从表后一行继续）。
 */
function readTable(lines: string[], start: number) {
  const head = cells(lines[start]!)
  const rows: Inline[][][] = []
  let i = start + 1
  if (/^\|\s*-/.test(lines[i]?.trim() ?? '')) i += 1 // 分隔行
  while (i < lines.length && /^\|/.test(lines[i]!.trim())) {
    rows.push(cells(lines[i]!))
    i += 1
  }
  const block: Block = { kind: 'table', head, rows }
  return { block, next: i - 1 }
}

/**
 * 折叠区块内部的嵌套块。支持段落、代码块与表格。
 * 不收节标题：折叠里的标题对外层目录树与锚点都没有意义。
 */
function parseInnerBlocks(lines: string[], hl: Highlighter): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  const flush = () => {
    if (paragraph.length === 0) return
    blocks.push({ kind: 'para', lines: paragraph.map(inline) })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (trimmed === '') {
      flush()
      continue
    }

    const fence = trimmed.match(/^```(\w*)\s*$/)
    if (fence) {
      flush()
      const r = readCode(lines, i + 1, fence[1] ?? '', hl)
      blocks.push(r.block)
      i = r.next
      continue
    }

    if (/^\|/.test(trimmed)) {
      flush()
      const r = readTable(lines, i)
      blocks.push(r.block)
      i = r.next
      continue
    }

    paragraph.push(trimmed)
  }
  flush()
  return blocks
}

async function main() {
  const highlighter = await createHighlighter({ themes: [THEME], langs: [...LANGS] })

  const catsJson = await readFile(CATS_FILE, 'utf8')
  const categories: { id: string; label: string }[] = JSON.parse(catsJson)

  const entries = await readdir(ARTICLES_DIR)
  const mdFiles = entries.filter((e) => e.endsWith('.md')).sort()

  const articles: Article[] = []

  for (let idx = 0; idx < mdFiles.length; idx += 1) {
    const fileName = mdFiles[idx]!
    const filePath = join(ARTICLES_DIR, fileName)
    const text = await readFile(filePath, 'utf8')
    const lines = text.split(/\r?\n/)

    let category = ''
    let slug = ''
    let title = ''
    let summary = ''
    let minutes = 3

    let lineIndex = 0

    // 解析 Frontmatter (--- ... ---)
    if (lines[0]?.trim() === '---') {
      lineIndex = 1
      while (lineIndex < lines.length && lines[lineIndex]?.trim() !== '---') {
        const line = lines[lineIndex]!.trim()
        const match = line.match(/^(\w+):\s*(.+)$/)
        if (match) {
          const [, key, rawVal] = match
          const val = rawVal!.trim().replace(/^['"]|['"]$/g, '')
          if (key === 'category') category = val
          else if (key === 'slug') slug = val
          else if (key === 'title') title = val
          else if (key === 'summary') summary = val
          else if (key === 'minutes') minutes = Number(val) || 3
        }
        lineIndex += 1
      }
      lineIndex += 1 // 跳过闭合的 ---
    }

    const current: Article = {
      slug,
      index: String(idx + 1).padStart(2, '0'),
      category,
      title,
      summary,
      minutes,
      headings: [],
      blocks: [],
    }

    let paragraph: string[] = []
    const flushParagraph = () => {
      if (paragraph.length === 0) return
      current.blocks.push({ kind: 'para', lines: paragraph.map(inline) })
      paragraph = []
    }

    for (let i = lineIndex; i < lines.length; i += 1) {
      const line = lines[i]!
      const trimmed = line.trim()

      if (trimmed === '') {
        flushParagraph()
        continue
      }

      if (trimmed === '---') {
        flushParagraph()
        continue
      }

      // 四级子标题：不进目录树、不做锚点，只是二级标题下的推演子单元分界。
      // 必须先于 h3 判断——`#### ` 同样以 `###` 开头。
      if (/^#### /.test(trimmed)) {
        flushParagraph()
        current.blocks.push({ kind: 'h4', text: trimmed.slice(5).trim() })
        continue
      }

      if (/^### /.test(trimmed)) {
        flushParagraph()
        const id = `sec-${current.headings.length + 1}`
        const heading = trimmed.slice(4).trim()
        current.headings.push({ id, text: heading })
        current.blocks.push({ kind: 'h3', id, text: heading })
        continue
      }

      // 视频播放器嵌入组件
      const videoCustomMatch = trimmed.match(/^<video-preview\s+provider="(youtube|bilibili)"\s+id="([^"]+)"(?:\s+title="([^"]*)")?(?:\s+bvid="([^"]*)")?\s*><\/video-preview>$/i)
      if (videoCustomMatch) {
        flushParagraph()
        const provider = videoCustomMatch[1] as 'youtube' | 'bilibili'
        const id = videoCustomMatch[2]!
        const title = videoCustomMatch[3] || '视频教程'
        const bvid = videoCustomMatch[4]
        current.blocks.push({ kind: 'video', provider, id, title, ...(bvid ? { bvid } : {}) })
        continue
      }

      // YouTube iframe 自动升级为可交互视频预览播放器
      const ytIframeMatch = trimmed.match(/src="https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)[^"]*"/i)
      if (ytIframeMatch) {
        flushParagraph()
        const id = ytIframeMatch[1]!
        const titleMatch = trimmed.match(/title="([^"]*)"/i)
        const title = titleMatch ? titleMatch[1]! : 'Harvard CS50x 导论'
        current.blocks.push({ kind: 'video', provider: 'youtube', id, title, bvid: 'BV1Ls6BYkEGk' })
        continue
      }

      // 通用 iframe 视频嵌入
      const iframeMatch = trimmed.match(/^<iframe\s+.*?src="([^"]+)".*?>\s*<\/iframe>$/i)
      if (iframeMatch) {
        flushParagraph()
        const src = iframeMatch[1]!
        const titleMatch = trimmed.match(/title="([^"]*)"/i)
        const title = titleMatch ? titleMatch[1]! : ''
        current.blocks.push({ kind: 'iframe', src, title })
        continue
      }

      // 折叠详情块 <details><summary>标题</summary>内容</details>
      // 内部允许嵌套段落、代码块与表格：超过 25 行的配置与完整类定义收在这里。
      const detailsMatch = trimmed.match(/^<details>\s*<summary>(.*?)<\/summary>([\s\S]*?)<\/details>$/i)
      if (detailsMatch) {
        flushParagraph()
        const title = detailsMatch[1]!.trim()
        const innerLines = detailsMatch[2]!.split(/\r?\n/)
        current.blocks.push({
          kind: 'details',
          title,
          blocks: parseInnerBlocks(innerLines, highlighter),
        })
        continue
      }

      if (/^<details>/i.test(trimmed)) {
        flushParagraph()
        let summaryTitle = '点击查看详情'
        const inlineSum = trimmed.match(/<summary>(.*?)<\/summary>/i)
        if (inlineSum) summaryTitle = inlineSum[1]!.trim()
        const innerLines: string[] = []
        i += 1
        while (i < lines.length && !/<\/details>/i.test(lines[i]!.trim())) {
          const l = lines[i]!
          const sumMatch = l.trim().match(/<summary>(.*?)<\/summary>/i)
          if (sumMatch) {
            summaryTitle = sumMatch[1]!.trim()
          } else {
            innerLines.push(l)
          }
          i += 1
        }
        current.blocks.push({
          kind: 'details',
          title: summaryTitle,
          blocks: parseInnerBlocks(innerLines, highlighter),
        })
        continue
      }

      // 代码块
      const fence = trimmed.match(/^```(\w*)\s*$/)
      if (fence) {
        flushParagraph()
        const r = readCode(lines, i + 1, fence[1] ?? '', highlighter)
        current.blocks.push(r.block)
        i = r.next
        continue
      }

      // 表格
      if (/^\|/.test(trimmed)) {
        flushParagraph()
        const r = readTable(lines, i)
        current.blocks.push(r.block)
        i = r.next
        continue
      }

      paragraph.push(trimmed)
    }
    flushParagraph()
    articles.push(current)
  }

  verify(categories, articles)
  await writeFile(OUT, render(categories, articles), 'utf8')
  await writeFile(QA_INDEX_OUT, renderQaIndex(categories, articles), 'utf8')

  const codeBlocks = articles.flatMap((a) => a.blocks.filter((b) => b.kind === 'code'))
  const byLang = new Map<string, number>()
  for (const b of codeBlocks) {
    const key = b.kind === 'code' ? b.lang || '(纯文本)' : ''
    byLang.set(key, (byLang.get(key) ?? 0) + 1)
  }

  console.log(`分类 ${categories.length}：${categories.map((c) => `${c.id} ${c.label}`).join(' / ')}`)
  console.log(`篇目 ${articles.length}`)
  for (const a of articles) {
    console.log(
      `  ${a.index} ${a.slug.padEnd(25)} ${a.category.padEnd(11)} ${String(a.minutes)} 分钟  ` +
        `${a.headings.length} 节  ${a.blocks.length} 块  ${a.title}`,
    )
  }
  console.log(
    `代码块 ${codeBlocks.length}：${[...byLang].map(([k, v]) => `${v} ${k}`).join(' / ')}`,
  )
  console.log(`产物 src/data/docs.ts  ${(await readFile(OUT)).byteLength} 字节`)

  const qaBytes = (await readFile(QA_INDEX_OUT)).byteLength
  const secCount = articles.reduce((s, a) => s + a.headings.length, 0)
  console.log(
    `产物 worker/src/qa-index.json  ${qaBytes} 字节` +
      `（${articles.length} 篇 / ${secCount} 节，只有标题，不含正文）`,
  )
}

/**
 * 问答索引的产物。
 *
 * 字段名全部压到最短：这份 JSON 每次请求都要拼进 prompt，
 * 字段名写长一点就是每一问多烧几十个 token。
 *   c 分类代号（SETUP / CONVENTION / QUALITY）
 *   s slug、i 序号、t 篇名
 *   h 节标题，[锚点, 文本] 两元组
 */
function renderQaIndex(categories: { id: string; label: string }[], articles: Article[]) {
  const catOf = (id: string) => categories.find((c) => c.id === id)

  const payload = {
    /** 成稿指纹。代理端拿它做缓存 key 的一部分，改稿自动失效。 */
    version: fingerprint(articles),
    cats: categories.map((c) => ({ id: c.id, label: c.label })),
    docs: articles.map((a) => ({
      s: a.slug,
      i: a.index,
      c: catOf(a.category)?.id ?? a.category,
      t: a.title,
      // 摘要也给——它是成稿自带的一句话概括，对“这篇讲什么”这类问题比节标题有用
      d: a.summary,
      h: a.headings.map((h) => [h.id, h.text] as const),
    })),
  }

  return `${JSON.stringify(payload)}\n`
}

/** 标题与摘要的指纹。不算正文：索引里没有正文，正文改了也不影响检索结果。 */
function fingerprint(articles: Article[]) {
  const text = articles
    .map((a) => `${a.slug}|${a.title}|${a.summary}|${a.headings.map((h) => h.text).join('~')}`)
    .join('\n')
  // FNV-1a。不需要密码学强度，只要改稿就变
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(0x01000193, h) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Shiki 出 token，按哨兵色落到 class，产物里不带任何颜色值。 */
function highlight(
  highlighter: Awaited<ReturnType<typeof createHighlighter>>,
  code: string,
  lang: (typeof LANGS)[number],
) {
  const { tokens } = highlighter.codeToTokens(code, { lang, theme: 'yfy-sentinel' })
  return tokens
    .map((line) =>
      line
        .map((token) => {
          const cls = SENTINEL[token.color as keyof typeof SENTINEL]
          const body = escapeHtml(token.content)
          return cls ? `<span class="${cls}">${body}</span>` : body
        })
        .join(''),
    )
    .join('\n')
}

/** 解析结果的自查。成稿改了结构而解析没跟上时，这里直接失败，不要产出半份数据。 */
function verify(categories: { id: string }[], articles: Article[]) {
  const problems: string[] = []
  if (categories.length === 0) problems.push(`分类不可为空`)
  if (articles.length === 0) problems.push(`篇目不可为空`)
  const ids = new Set(categories.map((c) => c.id))
  for (const a of articles) {
    if (!a.summary) problems.push(`${a.slug} 缺摘要`)
    if (!a.minutes) problems.push(`${a.slug} 缺阅读时长`)
    if (!ids.has(a.category)) problems.push(`${a.slug} 的分类 ${a.category || '(空)'} 不在分类表里`)
    if (a.blocks.length === 0) problems.push(`${a.slug} 没有正文`)
  }
  if (problems.length === 0) return
  console.error('解析失败：')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

/* ====================================================================== */

const j = (v: unknown) => JSON.stringify(v)

function renderInline(runs: Inline[]) {
  return `[${runs
    .map((r) => {
      if (r.t === 'link') {
        return `{ t: 'link', v: ${j(r.v)}, href: ${j(r.href)} }`
      }
      return `{ t: '${r.t}', v: ${j(r.v)} }`
    })
    .join(', ')}]`
}

function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'h3':
      return `    { kind: 'h3', id: '${b.id}', text: ${j(b.text)} },`
    case 'h4':
      return `    { kind: 'h4', text: ${j(b.text)} },`
    case 'para':
      return `    { kind: 'para', lines: [\n${b.lines.map((l) => `      ${renderInline(l)},`).join('\n')}\n    ] },`
    case 'code':
      return `    { kind: 'code', lang: '${b.lang}', html: ${j(b.html)}, raw: ${j(b.raw || '')} },`
    case 'table':
      return (
        `    { kind: 'table',\n      head: [${b.head.map(renderInline).join(', ')}],\n` +
        `      rows: [\n${b.rows.map((r) => `        [${r.map(renderInline).join(', ')}],`).join('\n')}\n      ] },`
      )
    case 'iframe':
      return `    { kind: 'iframe', src: ${j(b.src)}, title: ${j(b.title)} },`
    case 'video':
      return `    { kind: 'video', provider: '${b.provider}', id: ${j(b.id)}, title: ${j(b.title)}${b.bvid ? `, bvid: ${j(b.bvid)}` : ''} },`
    case 'details':
      return `    { kind: 'details', title: ${j(b.title)}, blocks: [\n${b.blocks.map(renderBlock).join('\n')}\n    ] },`
  }
}

function render(categories: { id: string; label: string }[], articles: Article[]) {
  const cats = categories
    .map((c) => `  { id: '${c.id}', label: ${j(c.label)}, code: '${c.id.toUpperCase()}' },`)
    .join('\n')

  const docs = articles
    .map(
      (a) => `  {
    slug: '${a.slug}',
    index: '${a.index}',
    category: '${a.category}',
    title: ${j(a.title)},
    summary: ${j(a.summary)},
    minutes: ${a.minutes},
    headings: [
${a.headings.map((h) => `      { id: '${h.id}', text: ${j(h.text)} },`).join('\n')}
    ],
    blocks: [
${a.blocks.map(renderBlock).join('\n')}
    ],
  },`,
    )
    .join('\n')

  return `/* 由 scripts/build-docs.ts 生成，不要手改。改内容改 docs/articles/*.md，再跑 npm run docs:build。 */

/** 行内片段。code 走等宽，strong 走 700，link 走超链接。 */
export interface DocInline {
  t: 'text' | 'code' | 'strong' | 'link'
  v: string
  href?: string
}

/**
 * 正文块。
 *
 * para 的 lines 是「一段里的多个自然行」，不是多段：成稿里三条禁令写成三行却属于同一段，
 * 拆成三段会让聚焦滚动一行一闪。整段是一个聚焦单元。
 *
 * code 的 html 只含 tk-k / tk-s / tk-c 三个 class，颜色在 docs.css 里引令牌。
 * lang 为空串的是纯文本清单（分支命名、目录树、分层），不高亮，不给语言角标。
 */
export type DocBlock =
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'h4'; text: string }
  | { kind: 'para'; lines: readonly (readonly DocInline[])[] }
  | { kind: 'code'; lang: string; html: string; raw?: string }
  | {
      kind: 'table'
      head: readonly (readonly DocInline[])[]
      rows: readonly (readonly (readonly DocInline[])[])[]
    }
  | { kind: 'iframe'; src: string; title: string }
  | {
      kind: 'video'
      provider: 'youtube' | 'bilibili'
      id: string
      title: string
      bvid?: string
    }
  | {
      kind: 'details'
      title: string
      blocks: readonly DocBlock[]
    }

export interface DocCategory {
  id: string
  label: string
  /** hud 字体的分类代号。 */
  code: string
}

export interface Doc {
  slug: string
  /** 两位序号，走 hud 字体。 */
  index: string
  category: string
  title: string
  summary: string
  /** 阅读时长，分钟。取自成稿，本站不另算。 */
  minutes: number
  /** 三级标题，目录树展开当前篇时用。 */
  headings: readonly { id: string; text: string }[]
  blocks: readonly DocBlock[]
}

export const DOC_CATEGORIES: readonly DocCategory[] = [
${cats}
]

export const DOCS: readonly Doc[] = [
${docs}
]

export const docBySlug = (slug: string): Doc | undefined => DOCS.find((d) => d.slug === slug)

export const docsByCategory = (id: string): readonly Doc[] => DOCS.filter((d) => d.category === id)
`
}

await main()
