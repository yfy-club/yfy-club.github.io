/**
 * 首页的档案库入口。规格 4.4 的档案库本体是 /docs 独立路由，这里只放入口。
 *
 * 刻意不列篇目标题与摘要：那些字只在 docs 字体分片里（spec 7.2），
 * 在首页渲染它们会把 71 KB 的按需分片拽进首屏。首页只出壳层文案与计数。
 */
import { Link } from 'react-router'
import { Diamond, Rail, Reticle, Tag } from '@/components/hud'
import { DOC_CATEGORIES, docsByCategory } from '@/data/docs'
import './docs.css'

export function ArchiveEntry() {
  return (
    <section className="entry" id="docs">
      <Rail />
      <div className="shell">
        <header className="sector-head">
          <div className="sector-badges">
            <Reticle size={22} />
            <Tag tone="solid">SECTOR 03</Tag>
          </div>
          <h2 className="sector-title">开发者档案库</h2>
          <p className="sector-note">
            涵盖阶段学习路线、开发工具链配置与团队工程约定，助力成员快速上手。
          </p>
        </header>

        <div className="entry-row">
          {/* 分类代号与篇数。全拉丁，不吃中文字体预算，数也是从数据上数出来的 */}
          <ul className="entry-meta">
            {DOC_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Diamond tone="sky" />
                <span className="entry-meta-code">{cat.code}</span>
                <span className="entry-meta-count">
                  {String(docsByCategory(cat.id).length).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>

          <Link className="entry-go" to="/docs">
            <Diamond tone="pink" />
            <span className="entry-go-zh">进入档案库</span>
            <span className="entry-go-hud">ARCHIVE →</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
