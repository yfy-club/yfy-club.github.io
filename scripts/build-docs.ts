/**
 * 档案库内容流水线。
 *
 *   npm run docs:build
 *
 * 把成稿 docs/content-docs.md 解析成结构化数据，代码块在构建期用 Shiki 高亮，
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
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createHighlighter, type ThemeRegistrationRaw } from 'shiki'

const SRC = fileURLToPath(new URL('../docs/content-docs.md', import.meta.url))
const OUT = fileURLToPath(new URL('../src/data/docs.ts', import.meta.url))

/** 高亮语言。成稿里只有这三种，多的不打进来。 */
const LANGS = ['bash', 'ts', 'css'] as const

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
  t: 'text' | 'code' | 'strong'
  v: string
}

type Block =
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'para'; lines: Inline[][] }
  | { kind: 'code'; lang: string; html: string }
  | { kind: 'table'; head: Inline[][]; rows: Inline[][][] }

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

/**
 * 行内标记。先切 `code`，再在剩下的文本里切 **strong**——
 * 反过来会把 `138****1234` 里的星号当成加粗。
 */
function inline(text: string): Inline[] {
  const out: Inline[] = []
  for (const piece of text.split(/(`[^`]+`)/g)) {
    if (!piece) continue
    if (piece.startsWith('`') && piece.endsWith('`')) {
      out.push({ t: 'code', v: piece.slice(1, -1) })
      continue
    }
    for (const seg of piece.split(/(\*\*[^*]+\*\*)/g)) {
      if (!seg) continue
      if (seg.startsWith('**') && seg.endsWith('**')) out.push({ t: 'strong', v: seg.slice(2, -2) })
      else out.push({ t: 'text', v: seg })
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

async function main() {
  const text = await readFile(SRC, 'utf8')
  const lines = text.split(/\r?\n/)

  const highlighter = await createHighlighter({ themes: [THEME], langs: [...LANGS] })

  /** 分类表：id 与中文标签。 */
  const categories: { id: string; label: string }[] = []
  const labelToId = new Map<string, string>()

  const articles: Article[] = []
  let current: Article | null = null
  let category = ''
  /** 连续非空行攒成一段，空行断开。成稿里「不 force push…」那种三行禁令是一段，不是三段。 */
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (!current || paragraph.length === 0) return
    current.blocks.push({ kind: 'para', lines: paragraph.map(inline) })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!
    const trimmed = line.trim()

    // 分类表。只有文件头那一张，落在任何文章开始之前。
    if (!current && /^\|/.test(trimmed) && !trimmed.startsWith('| id') && !/^\|\s*-/.test(trimmed)) {
      const [id, label] = trimmed.split('|').map((c) => c.trim()).filter(Boolean)
      if (id && label) {
        const clean = id.replace(/`/g, '')
        categories.push({ id: clean, label })
        labelToId.set(label, clean)
      }
      continue
    }

    // 一级标题就是分类分隔，本身不进内容
    if (/^# /.test(trimmed)) {
      flushParagraph()
      const label = trimmed.slice(2).trim()
      if (labelToId.has(label)) category = labelToId.get(label)!
      current = null
      continue
    }

    // 篇目头：## 3. 分支与提交 · `git-flow`
    const head = trimmed.match(/^## (\d+)\.\s*(.+?)\s*·\s*`([\w-]+)`\s*$/)
    if (head) {
      flushParagraph()
      current = {
        slug: head[3]!,
        index: head[1]!.padStart(2, '0'),
        category,
        title: head[2]!,
        summary: '',
        minutes: 0,
        headings: [],
        blocks: [],
      }
      articles.push(current)
      continue
    }

    if (!current) continue

    if (trimmed === '' ) {
      flushParagraph()
      continue
    }

    if (trimmed === '---') {
      flushParagraph()
      current = null
      continue
    }

    const summary = trimmed.match(/^\*\*摘要\*\*：(.+)$/)
    if (summary) {
      flushParagraph()
      current.summary = summary[1]!.trim()
      continue
    }

    const minutes = trimmed.match(/^\*\*阅读\*\*：(\d+)\s*分钟$/)
    if (minutes) {
      flushParagraph()
      current.minutes = Number(minutes[1])
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

    // 代码块。栅栏语言缺省的是纯文本清单（分支命名、目录树、分层），不高亮也不给角标。
    const fence = trimmed.match(/^```(\w*)\s*$/)
    if (fence) {
      flushParagraph()
      const lang = fence[1] ?? ''
      const body: string[] = []
      i += 1
      while (i < lines.length && !/^```\s*$/.test(lines[i]!.trim())) {
        body.push(lines[i]!)
        i += 1
      }
      const code = body.join('\n')
      const known = LANGS.find((l) => l === lang)
      current.blocks.push({
        kind: 'code',
        lang: known ?? '',
        html: known ? highlight(highlighter, code, known) : escapeHtml(code),
      })
      continue
    }

    if (/^\|/.test(trimmed)) {
      flushParagraph()
      const head = cells(trimmed)
      const rows: Inline[][][] = []
      i += 1
      if (/^\|\s*-/.test(lines[i]?.trim() ?? '')) i += 1 // 分隔行
      while (i < lines.length && /^\|/.test(lines[i]!.trim())) {
        rows.push(cells(lines[i]!))
        i += 1
      }
      i -= 1
      current.blocks.push({ kind: 'table', head, rows })
      continue
    }

    paragraph.push(trimmed)
  }
  flushParagraph()

  verify(categories, articles)
  await writeFile(OUT, render(categories, articles), 'utf8')

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
      `  ${a.index} ${a.slug.padEnd(13)} ${a.category.padEnd(11)} ${String(a.minutes)} 分钟  ` +
        `${a.headings.length} 节  ${a.blocks.length} 块  ${a.title}`,
    )
  }
  console.log(
    `代码块 ${codeBlocks.length}：${[...byLang].map(([k, v]) => `${v} ${k}`).join(' / ')}`,
  )
  console.log(`产物 src/data/docs.ts  ${(await readFile(OUT)).byteLength} 字节`)
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
  if (categories.length !== 3) problems.push(`分类应为 3 个，解析出 ${categories.length}`)
  if (articles.length !== 8) problems.push(`篇目应为 8 篇，解析出 ${articles.length}`)
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
  return `[${runs.map((r) => `{ t: '${r.t}', v: ${j(r.v)} }`).join(', ')}]`
}

function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'h3':
      return `    { kind: 'h3', id: '${b.id}', text: ${j(b.text)} },`
    case 'para':
      return `    { kind: 'para', lines: [\n${b.lines.map((l) => `      ${renderInline(l)},`).join('\n')}\n    ] },`
    case 'code':
      return `    { kind: 'code', lang: '${b.lang}', html: ${j(b.html)} },`
    case 'table':
      return (
        `    { kind: 'table',\n      head: [${b.head.map(renderInline).join(', ')}],\n` +
        `      rows: [\n${b.rows.map((r) => `        [${r.map(renderInline).join(', ')}],`).join('\n')}\n      ] },`
      )
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

  return `/* 由 scripts/build-docs.ts 生成，不要手改。改内容改 docs/content-docs.md，再跑 npm run docs:build。 */

/** 行内片段。code 走等宽，strong 走 700。 */
export interface DocInline {
  t: 'text' | 'code' | 'strong'
  v: string
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
  | { kind: 'para'; lines: readonly (readonly DocInline[])[] }
  | { kind: 'code'; lang: string; html: string }
  | {
      kind: 'table'
      head: readonly (readonly DocInline[])[]
      rows: readonly (readonly (readonly DocInline[])[])[]
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
