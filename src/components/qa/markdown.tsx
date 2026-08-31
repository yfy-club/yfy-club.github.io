import { useState, type ReactNode } from 'react'

/**
 * 轻量级、流式安全、零依赖的 Markdown 渲染器。
 *
 * 支持：
 * - 代码块（```lang ... ```）+ 语言角标 + 一键复制代码
 * - 行内代码（`code`）
 * - 标题（# ~ ####）
 * - 粗体（**text**）、斜体（*text*）、删除线（~~text~~）
 * - 无序列表（- / *）与有序列表（1. / 2.）
 * - 引用块（> quote）
 * - 表格（| a | b |）
 * - 链接（[text](url)）
 * - 段落与换行
 */

interface MarkdownProps {
  content: string
}

function cleanMarkdownContent(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/<\|?tool_call[\s\S]*?(?:<\/tool_call>|<\|?tool_call\|?>|<tool_call\|>)/gi, '')
    .replace(/call:web_search\{[\s\S]*?\}/gi, '')
    .replace(/<\|(?:im_end|endoftext|im_start)[^>]*>/gi, '')
    .trim()
}

export function MarkdownRenderer({ content }: MarkdownProps) {
  const cleaned = cleanMarkdownContent(content)
  if (!cleaned) return null
  const blocks = parseMarkdownBlocks(cleaned)

  return (
    <div className="qa-markdown">
      {blocks.map((block, idx) => (
        <BlockView key={idx} block={block} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- AST 类型 */

type MarkdownBlock =
  | { type: 'code'; lang: string; code: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'quote'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' }
  | { type: 'p'; text: string }

/* ----------------------------------------------------------- 块级解析器 */

function parseMarkdownBlocks(raw: string): MarkdownBlock[] {
  const lines = raw.split(/\r?\n/)
  const blocks: MarkdownBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    // 1. 分割线 --- / *** / ___
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      // 连续多条分割线只渲染一条
      if (blocks.length === 0 || blocks[blocks.length - 1]?.type !== 'hr') {
        blocks.push({ type: 'hr' })
      }
      i += 1
      continue
    }

    // 2. 代码块 ```lang
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines: string[] = []
      i += 1
      while (i < lines.length) {
        if (lines[i]!.trim().startsWith('```')) {
          i += 1
          break
        }
        codeLines.push(lines[i]!)
        i += 1
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    // 3. 表格 | a | b |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i]!.trim().startsWith('|') && lines[i]!.trim().endsWith('|')) {
        tableLines.push(lines[i]!.trim())
        i += 1
      }
      const table = parseTable(tableLines)
      if (table) {
        blocks.push(table)
        continue
      }
      // 若不是合规表格，按常规段落回退
    }

    // 4. 标题 # ~ ####
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1]!.length,
        text: headingMatch[2]!.trim(),
      })
      i += 1
      continue
    }

    // 5. 引用块 > quote
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i]!.trim().startsWith('>')) {
        quoteLines.push(lines[i]!.replace(/^\s*>\s?/, ''))
        i += 1
      }
      blocks.push({ type: 'quote', lines: quoteLines })
      continue
    }

    // 6. 无序列表 - item 或 * item
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*[-*+]\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // 7. 有序列表 1. item
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // 8. 空行
    if (!line.trim()) {
      i += 1
      continue
    }

    // 9. 普通段落（收集连续文本行）
    const pLines: string[] = []
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[i]!) &&
      !lines[i]!.trim().startsWith('```') &&
      !lines[i]!.match(/^#{1,4}\s+/) &&
      !lines[i]!.trim().startsWith('>') &&
      !/^\s*[-*+]\s+/.test(lines[i]!) &&
      !/^\s*\d+\.\s+/.test(lines[i]!) &&
      !(lines[i]!.trim().startsWith('|') && lines[i]!.trim().endsWith('|'))
    ) {
      pLines.push(lines[i]!)
      i += 1
    }
    if (pLines.length > 0) {
      blocks.push({ type: 'p', text: pLines.join('\n') })
    }
  }

  return blocks
}

function parseTable(lines: string[]): MarkdownBlock | null {
  if (lines.length < 2) return null
  const cleanCells = (row: string) =>
    row
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim())

  const headers = cleanCells(lines[0]!)
  const isSep = /^[\s|:-]+$/.test(lines[1]!)
  if (!isSep) return null

  const rows: string[][] = []
  for (let r = 2; r < lines.length; r++) {
    rows.push(cleanCells(lines[r]!))
  }
  return { type: 'table', headers, rows }
}

/* ----------------------------------------------------------- 行内解析器 */

function renderInline(text: string): ReactNode {
  if (!text) return null

  // 正则解析：`code`, **bold**, *italic*, ~~del~~, [link](url)
  const tokens: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // 1. 行内代码 `code`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      tokens.push(<code key={key++} className="qa-inline-code">{codeMatch[1]}</code>)
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // 2. 粗体 **bold** 或 __bold__
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/)
    if (boldMatch) {
      tokens.push(<strong key={key++} className="qa-bold">{renderInline(boldMatch[2]!)}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // 3. 斜体 *italic* 或 _italic_
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/)
    if (italicMatch) {
      tokens.push(<em key={key++} className="qa-italic">{renderInline(italicMatch[2]!)}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // 4. 删除线 ~~del~~
    const delMatch = remaining.match(/^~~(.+?)~~/)
    if (delMatch) {
      tokens.push(<del key={key++} className="qa-del">{renderInline(delMatch[1]!)}</del>)
      remaining = remaining.slice(delMatch[0].length)
      continue
    }

    // 5. 链接 [title](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      tokens.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="qa-inline-link"
        >
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // 6. 普通文本字符（遇到特殊标记前截取）
    const nextSpecial = remaining.search(/[`*_~\[]/)
    if (nextSpecial === -1) {
      tokens.push(remaining)
      break
    } else if (nextSpecial === 0) {
      tokens.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      tokens.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return tokens
}

/* ----------------------------------------------------------- 块级渲染视图 */

function BlockView({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />

    case 'heading': {
      const Tag = (`h${Math.min(4, Math.max(1, block.level))}`) as 'h1' | 'h2' | 'h3' | 'h4'
      return <Tag className={`qa-heading qa-h${block.level}`}>{renderInline(block.text)}</Tag>
    }

    case 'quote':
      return (
        <blockquote className="qa-quote">
          {block.lines.map((l, i) => (
            <p key={i}>{renderInline(l)}</p>
          ))}
        </blockquote>
      )

    case 'ul':
      return (
        <ul className="qa-list qa-ul">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol className="qa-list qa-ol">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      )

    case 'table':
      return (
        <div className="qa-table-wrap">
          <table className="qa-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'hr':
      return <hr className="qa-hr" />

    case 'p':
    default:
      return <p className="qa-p">{renderInline(block.text)}</p>
  }
}

/* ------------------------------------------------------------- 代码块组件 */

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 降级支持
    }
  }

  return (
    <div className="qa-code-block" data-lang={lang || 'text'}>
      <div className="qa-code-header">
        <span className="qa-code-lang" aria-hidden="true">
          {lang ? lang.toUpperCase() : 'CODE'}
        </span>
        <button
          type="button"
          className="qa-code-copy"
          onClick={handleCopy}
          aria-label={copied ? '已复制' : '复制代码'}
        >
          {copied ? '已复制 ✓' : '复制'}
        </button>
      </div>
      <pre className="qa-code-pre">
        <code className="qa-code-content">{code}</code>
      </pre>
    </div>
  )
}
