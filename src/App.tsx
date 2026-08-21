import { Hero } from './components/hero/hero'
import { Nav } from './components/site/nav'
import { Footer } from './components/site/footer'
import { Rail, Reticle, Tag } from './components/hud'
import { MascotLab } from './mascot-lab'
import './app.css'

/**
 * 单页纵向叙事。规格第 4 节。
 *
 * Hero 已落地（M3）。方向卡、项目展台、档案库入口是 M4 / M5 的活，
 * 这里先立锚点与分区骨架，让滚动叙事的节奏能整屏看出来，不摆假内容。
 *
 * 立绘验收页搬到 ?lab=1，不再挂在首页。M2 定稿后删掉。
 */

const PENDING = [
  {
    id: 'tracks',
    hud: 'SECTOR 01',
    title: '五个技术方向',
    note: '五张角色卡，两大三小非对称排布。悬停触发看板娘联动，点击原地展开年级路线。',
    ship: 'M4',
  },
  {
    id: 'projects',
    hud: 'SECTOR 02',
    title: '三个开源项目',
    note: '左右交替视差展台，各取截图主调做框线。悬停浮现拓扑微光流，点击原地展开档案。',
    ship: 'M4',
  },
  {
    id: 'docs',
    hud: 'SECTOR 03',
    title: '开发者档案库',
    note: '三个分类八篇长文。滚动时段落由虚焦聚为实焦，代码块走构建期高亮。',
    ship: 'M5',
  },
] as const

export default function App() {
  if (new URLSearchParams(window.location.search).has('lab')) {
    return (
      <main className="grain">
        <MascotLab />
      </main>
    )
  }

  return (
    <div className="page grain">
      <Nav />
      <main>
        <Hero />

        {PENDING.map((s) => (
          <section key={s.id} id={s.id} className="slot">
            <Rail />
            <div className="slot-inner shell">
              <div className="slot-head">
                <Reticle size={22} />
                <Tag tone="solid">{s.hud}</Tag>
                <Tag tone="ink">{s.ship}</Tag>
              </div>
              <h2 className="slot-title">{s.title}</h2>
              <p className="slot-note">{s.note}</p>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}
