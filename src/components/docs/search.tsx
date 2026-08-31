import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { DOCS, DOC_CATEGORIES } from '@/data/docs'

interface SearchItem {
  id: string
  slug: string
  anchor?: string
  category: string
  docIndex: string
  title: string
  sectionTitle?: string
  snippet: string
  score: number
}

const catMap = new Map(DOC_CATEGORIES.map((c) => [c.id, c]))

export function DocSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // 提取全文并打分匹配
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const list: SearchItem[] = []

    for (const doc of DOCS) {
      const cat = catMap.get(doc.category)
      const catCode = cat?.code ?? doc.category.toUpperCase()

      // 1. 匹配主标题
      if (doc.title.toLowerCase().includes(q)) {
        list.push({
          id: `${doc.slug}-title`,
          slug: doc.slug,
          category: catCode,
          docIndex: doc.index,
          title: doc.title,
          snippet: doc.summary,
          score: 100,
        })
      }

      // 2. 匹配摘要
      if (doc.summary.toLowerCase().includes(q) && !doc.title.toLowerCase().includes(q)) {
        list.push({
          id: `${doc.slug}-summary`,
          slug: doc.slug,
          category: catCode,
          docIndex: doc.index,
          title: doc.title,
          snippet: doc.summary,
          score: 80,
        })
      }

      // 3. 匹配三级标题小节
      for (const h of doc.headings) {
        if (h.text.toLowerCase().includes(q)) {
          list.push({
            id: `${doc.slug}-${h.id}`,
            slug: doc.slug,
            anchor: h.id,
            category: catCode,
            docIndex: doc.index,
            title: doc.title,
            sectionTitle: h.text,
            snippet: `${doc.title} > ${h.text}`,
            score: 70,
          })
        }
      }

      // 4. 匹配段落正文文本
      for (const block of doc.blocks) {
        if (block.kind === 'para') {
          const text = block.lines
            .map((line) => line.map((seg) => seg.v).join(''))
            .join(' ')
          if (text.toLowerCase().includes(q)) {
            const idx = text.toLowerCase().indexOf(q)
            const start = Math.max(0, idx - 20)
            const end = Math.min(text.length, idx + q.length + 35)
            const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')

            list.push({
              id: `${doc.slug}-para-${list.length}`,
              slug: doc.slug,
              category: catCode,
              docIndex: doc.index,
              title: doc.title,
              snippet,
              score: 50,
            })
            break
          }
        }
      }
    }

    return list.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelect = (item: SearchItem) => {
    onClose()
    const targetUrl = item.anchor ? `/docs/${item.slug}#${item.anchor}` : `/docs/${item.slug}`
    navigate(targetUrl)

    if (item.anchor) {
      setTimeout(() => {
        const el = document.getElementById(item.anchor!)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="doc-search-backdrop" onClick={onClose}>
      <div className="doc-search-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="doc-search-bar">
          <svg className="doc-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="doc-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文档篇目、小节或技术关键词..."
            aria-label="搜索文档"
          />
          <kbd className="doc-search-kbd">ESC</kbd>
        </div>

        <div className="doc-search-body">
          {query.trim().length === 0 ? (
            <div className="doc-search-empty">
              <span className="doc-search-empty-tip">支持搜索 15 篇阶段学习路线、工程规范与实战约定</span>
              <span className="doc-search-empty-hud">快捷键: ↑ ↓ 导航 / Enter 直达 / Esc 关闭</span>
            </div>
          ) : results.length === 0 ? (
            <div className="doc-search-empty">
              <span className="doc-search-empty-tip">未找到与 “{query}” 相关的文档内容</span>
            </div>
          ) : (
            <ul className="doc-search-list">
              {results.map((item, idx) => (
                <li
                  key={item.id}
                  className={`doc-search-item ${idx === selectedIndex ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="doc-search-item-meta">
                    <span className="doc-search-item-index">{item.docIndex}</span>
                    <span className="doc-search-item-cat">{item.category}</span>
                  </div>
                  <div className="doc-search-item-content">
                    <div className="doc-search-item-title">
                      {item.title}
                      {item.sectionTitle && (
                        <span className="doc-search-item-section"> &gt; {item.sectionTitle}</span>
                      )}
                    </div>
                    <div className="doc-search-item-snippet">{item.snippet}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
