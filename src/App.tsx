import { useEffect, useState } from 'react'
import { Hero } from './components/hero/hero'
import { Nav } from './components/site/nav'
import { Footer } from './components/site/footer'
import { MascotDock } from './components/site/dock'
import { Tracks } from './components/tracks/tracks'
import { Projects } from './components/projects/projects'
import { Rail, Reticle, Tag } from './components/hud'
import { TRACK_FX, stageFx, type MascotFx } from './components/mascot/fx'
import type { MascotState } from './components/mascot/expressions'
import type { TrackSlug } from './data/characters'
import { MascotLab } from './mascot-lab'
import './app.css'

/**
 * 单页纵向叙事。规格第 4 节。
 *
 * Hero（M3）、方向卡与项目展台（M4）已落地。档案库入口还是骨架，M5 的活。
 *
 * 立绘状态与联动特效的结论在这里算，算完传给向导挂件——
 * 挂件是 3.4 的唯一观看位（见 spec 3.4 的 M4 修正记录），
 * Hero 的立绘只演首屏那一段，滚出去就交给挂件。
 *
 * 立绘验收页搬到 ?lab=1，不再挂在首页。M2 定稿后删掉。
 */

/** 进区状态。规格 3.3：方向区 FOCUS，项目区 SMILE，文档库 THINK。 */
const SECTION_STATE: Record<string, MascotState> = {
  tracks: 'FOCUS',
  projects: 'SMILE',
  docs: 'THINK',
}

export default function App() {
  if (new URLSearchParams(window.location.search).has('lab')) {
    return (
      <main className="grain">
        <MascotLab />
      </main>
    )
  }

  return <Portal />
}

function Portal() {
  const section = useCurrentSection()
  /** 悬停的方向卡。优先级高于展台——鼠标只可能在一个地方。 */
  const [track, setTrack] = useState<TrackSlug | null>(null)
  /** 悬停的展台主调。 */
  const [stage, setStage] = useState<string | null>(null)

  /*
   * 离开分区就清掉当前的悬停结论。
   *
   * 卡片的 onBlur 不够用：用键盘展开再按 Esc 后焦点仍在卡片上，
   * 接着滚到项目区，挂件会一直演一张已经出画的卡的反应。实测过。
   */
  useEffect(() => {
    if (section !== 'tracks') setTrack(null)
    if (section !== 'projects') setStage(null)
  }, [section])

  const fx: MascotFx | null = track ? TRACK_FX[track] : stage ? stageFx(stage) : null

  // 悬停项目展台是 SURPRISE（规格 3.3），400ms 后由状态机自己回落到 SMILE
  const state: MascotState = stage && !track ? 'SURPRISE' : (SECTION_STATE[section] ?? 'NEUTRAL')

  return (
    <div className="page grain">
      <Nav />
      <main>
        <Hero state={section === 'hero' ? 'NEUTRAL' : state} />
        <Tracks onHover={setTrack} />
        <Projects onHover={setStage} />

        {/* M5 的档案库。这里只立锚点与分区骨架，不摆假内容。 */}
        <section id="docs" className="slot">
          <Rail />
          <div className="slot-inner shell">
            <div className="slot-head">
              <Reticle size={22} />
              <Tag tone="solid">SECTOR 03</Tag>
              <Tag tone="ink">M5</Tag>
            </div>
            <h2 className="slot-title">开发者档案库</h2>
            <p className="slot-note">
              三个分类八篇长文。滚动时段落由虚焦聚为实焦，代码块走构建期高亮。
            </p>
          </div>
        </section>
      </main>
      <Footer />

      <MascotDock state={state} fx={fx} visible={section !== 'hero'} />
    </div>
  )
}

/**
 * 当前滚到了哪个分区。
 *
 * 判据是「哪个分区占了视口中线」，不是「谁先进视口 15%」：
 * 后者在两个分区交界处会来回抖，立绘表情跟着抽搐。
 */
function useCurrentSection() {
  const [id, setId] = useState('hero')

  useEffect(() => {
    const ids = ['hero', 'tracks', 'projects', 'docs']

    const pick = () => {
      const mid = window.innerHeight / 2
      let hit = 'hero'
      for (const candidate of ids) {
        const el = document.getElementById(candidate)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) hit = candidate
      }
      setId(hit)
    }

    pick()
    window.addEventListener('scroll', pick, { passive: true })
    window.addEventListener('resize', pick, { passive: true })
    return () => {
      window.removeEventListener('scroll', pick)
      window.removeEventListener('resize', pick)
    }
  }, [])

  return id
}
