/**
 * 开发者档案库。规格 4.4：左栏目录树 + 右栏长文。
 *
 * 两条路由都在构建期预渲染成静态页（spec 第 8 节 M5 修正记录），
 * 所以这里的首屏渲染不能依赖任何浏览器 API——window 只在 effect 里碰。
 */
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Nav } from '@/components/site/nav'
import { Footer } from '@/components/site/footer'
import { MascotDock } from '@/components/site/dock'
import { Rail, Reticle, Tag } from '@/components/hud'
import { usePrefersReducedMotion } from '@/components/mascot/mascot'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { DOC_CATEGORIES, DOCS, docBySlug, type Doc } from '@/data/docs'
import { DocBlocks } from './article'
import { DocTree } from './tree'
import { useFocusScroll } from './use-focus-scroll'
import './docs.css'

const categoryOf = (id: string) => DOC_CATEGORIES.find((c) => c.id === id)

/* ---------------------------------------------------------------- 索引页 */

export function DocsIndex() {
  return (
    <ArchiveLayout current={null} section={null}>
      <header className="doc-head">
        <div className="doc-head-badges">
          <Tag tone="solid">SECTOR 03</Tag>
        </div>
        <h1 className="doc-title">开发者档案库</h1>
        <p className="doc-summary">
          涵盖阶段学习路线、开发工具链配置与团队工程约定，助力成员快速上手。
        </p>
        <Rail />
      </header>

      {DOC_CATEGORIES.map((cat) => (
        <section key={cat.id} className="doc-index-group">
          <h2 className="doc-index-label">
            <span className="doc-index-code">{cat.code}</span>
            {cat.label}
          </h2>

          <ul className="doc-index-list">
            {DOCS.filter((d) => d.category === cat.id).map((doc) => (
              <li key={doc.slug}>
                <Link className="doc-card" to={`/docs/${doc.slug}`}>
                  <span className="doc-card-index">{doc.index}</span>
                  <span className="doc-card-body">
                    <span className="doc-card-title">{doc.title}</span>
                    <span className="doc-card-summary">{doc.summary}</span>
                  </span>
                  <span className="doc-card-min">{doc.minutes} MIN</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </ArchiveLayout>
  )
}

/* ---------------------------------------------------------------- 单篇 */

export function DocPage() {
  const { slug } = useParams()
  const doc = slug ? docBySlug(slug) : undefined

  // 未知 slug 回索引页。静态托管上这种地址走不到这里（服务器先给 404），
  // 但站内导航跳错时不能留一屏空白。
  if (!doc) return <Navigate to="/docs" replace />

  return <Article doc={doc} />
}

function Article({ doc }: { doc: Doc }) {
  const reduced = usePrefersReducedMotion()
  const body = useRef<HTMLDivElement>(null)

  useFocusScroll(body, !reduced, doc.slug)
  const section = useCurrentHeading(doc)

  const at = DOCS.findIndex((d) => d.slug === doc.slug)
  const prev = at > 0 ? DOCS[at - 1] : undefined
  const next = DOCS[at + 1]
  const cat = categoryOf(doc.category)

  return (
    <ArchiveLayout current={doc.slug} section={section}>
      <header className="doc-head">
        <div className="doc-head-badges">
          <Tag tone="solid">{doc.index}</Tag>
          {cat && <Tag tone="ink">{cat.code}</Tag>}
          <Tag>{doc.minutes} MIN</Tag>
        </div>
        <h1 className="doc-title">{doc.title}</h1>
        <p className="doc-summary">{doc.summary}</p>
        <Rail />
      </header>

      <div className="doc-body" ref={body}>
        <DocBlocks blocks={doc.blocks} />
      </div>

      <nav className="doc-turn" aria-label="翻页">
        {prev && (
          <Link className="doc-turn-item" to={`/docs/${prev.slug}`} data-dir="prev">
            <span className="doc-turn-hud">← PREV</span>
            <span className="doc-turn-title">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link className="doc-turn-item" to={`/docs/${next.slug}`} data-dir="next">
            <span className="doc-turn-hud">NEXT →</span>
            <span className="doc-turn-title">{next.title}</span>
          </Link>
        )}
      </nav>
    </ArchiveLayout>
  )
}

/**
 * 滚到了哪一节，给目录树的三级标题高亮用。
 *
 * 判据与聚焦滚动同一条：视口中线上方最后一个标题。
 * 先按「标题顶越过导航条」写过一版，实测目录高亮会落后正文两节——
 * 标题滚过顶栏时人早就在读它下面的段落了。
 *
 * 只在跨节时 setState，不是每帧：每帧 setState 会把整棵树重渲一遍。
 */
function useCurrentHeading(doc: Doc) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    setId(null)
    const ids = doc.headings.map((h) => h.id)
    if (ids.length === 0) return

    let frame = 0
    const pick = () => {
      frame = 0
      const mid = window.innerHeight / 2
      let hit: string | null = null
      for (const candidate of ids) {
        const el = document.getElementById(candidate)
        if (el && el.getBoundingClientRect().top <= mid) hit = candidate
      }
      setId(hit)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }

    pick()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [doc])

  return id
}

/* ---------------------------------------------------------------- 壳 */

interface LayoutProps {
  current: string | null
  section: string | null
  children: React.ReactNode
}

function ArchiveLayout({ current, section, children }: LayoutProps) {
  // 惯性挂在壳上而不是单篇上：索引页也是档案库的一部分，两处的滚动手感要一样
  useSmoothScroll(!usePrefersReducedMotion())

  return (
    <div className="page grain">
      <Nav />
      <main className="docs">
        <div className="docs-inner shell">
          <aside className="docs-side">
            <Link className="docs-back" to="/">
              <Reticle size={16} />
              <span>返回传送门</span>
            </Link>
            <DocTree current={current} section={section} />
          </aside>

          <div className="docs-main">{children}</div>
        </div>
      </main>
      <Footer />

      {/* 规格 3.3：文档库 THINK。挂件是 3.4 的唯一观看位，全站常驻。 */}
      <MascotDock state="THINK" fx={null} visible />
    </div>
  )
}
