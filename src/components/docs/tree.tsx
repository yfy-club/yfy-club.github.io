/**
 * 左栏目录树。规格 4.4：当前项高亮为切角实心块 + 左侧 3px 粉色标记。
 *
 * 三层：分类 → 篇目 → 当前篇的三级标题。第三层只在当前篇下展开，
 * 这样「树」是真的树，也顺带把本页大纲装进去了，不必再开第三栏。
 */
import { Link } from 'react-router'
import { Reticle } from '@/components/hud'
import { DOC_CATEGORIES, DOCS } from '@/data/docs'

interface TreeProps {
  /** 当前篇的 slug。在 /docs 索引页传 null。 */
  current: string | null
  /** 当前篇里滚到了哪一节，高亮用。索引页传 null。 */
  section?: string | null
}

export function DocTree({ current, section = null }: TreeProps) {
  return (
    <nav className="doc-tree" aria-label="档案库目录">
      <div className="doc-tree-head">
        <Reticle size={18} />
        <span className="doc-tree-hud">ARCHIVE</span>
      </div>

      {DOC_CATEGORIES.map((cat) => (
        <section key={cat.id} className="doc-tree-group">
          <h2 className="doc-tree-label">
            <span className="doc-tree-code">{cat.code}</span>
            {cat.label}
          </h2>

          <ul className="doc-tree-list">
            {DOCS.filter((d) => d.category === cat.id).map((doc) => {
              const active = doc.slug === current
              return (
                <li key={doc.slug}>
                  <Link
                    className="doc-tree-item"
                    to={`/docs/${doc.slug}`}
                    data-current={active}
                    {...(active ? { 'aria-current': 'page' as const } : {})}
                  >
                    <span className="doc-tree-index">{doc.index}</span>
                    <span className="doc-tree-title">{doc.title}</span>
                  </Link>

                  {active && doc.headings.length > 0 && (
                    <ul className="doc-tree-sub">
                      {doc.headings.map((h) => (
                        <li key={h.id}>
                          <a href={`#${h.id}`} data-current={h.id === section}>
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </nav>
  )
}
