import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router'
import { Hero } from './components/hero/hero'
import { Nav } from './components/site/nav'
import { Footer } from './components/site/footer'
import { MascotDock } from './components/site/dock'
import { Tracks } from './components/tracks/tracks'
import { Projects } from './components/projects/projects'
import { ArchiveEntry } from './components/docs/entry'
import { DocPage, DocsIndex } from './components/docs/archive'
import { TRACK_FX, stageFx, type MascotFx } from './components/mascot/fx'
import type { MascotState } from './components/mascot/states'
import type { TrackSlug } from './data/characters'
import { pageDescription, pageTitle } from './lib/page-title'
import { onScrollFrame, requestScrollFrame, scrollY, viewportH } from './lib/scroll-frame'
import { useSmoothScroll, scrollToAnchor, scrollToTop } from './lib/smooth-scroll'
import { usePrefersReducedMotion } from './components/mascot'
import { MascotLab } from './mascot-lab'
import './app.css'

/**
 * 路由表。规格 4.4 定的两条档案库路由 + 首页。
 *
 * 三条路由全部在构建期预渲染成静态页（scripts/prerender.ts），
 * 因为 GitHub Pages 没有 SPA fallback，/docs/git-flow 直接刷新会 404。
 * 见 spec 第 8 节的 M5 修正记录。
 *
 * 立绘验收页挂在 ?lab=1，不占路由，M2 定稿后删掉。
 */
export default function App() {
  useRouteScroll()
  useDocumentHead()

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/docs" element={<DocsIndex />} />
      <Route path="/docs/:slug" element={<DocPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Home() {
  const [params] = useSearchParams()

  if (params.has('lab')) {
    return (
      <main className="grain">
        <MascotLab />
      </main>
    )
  }

  return <Portal />
}

/**
 * 换路由后滚到哪。
 *
 * BrowserRouter 走 pushState，浏览器不会自己滚，也不会自己跳锚点：
 * 从 /docs 点导航条的「方向」回到 /#tracks 时不处理的话，人还停在文档中段。
 *
 * 走 smooth-scroll 模块而不是直接 window.scrollTo：/docs 上挂着 lenis，
 * 它会在下一帧把原生 scrollTo 的结果拽回去。
 */
function useRouteScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        scrollToAnchor(el)
        return
      }
    }
    scrollToTop()
  }, [pathname, hash])
}

/**
 * 逐页 title 与 meta description。
 *
 * 预渲染已经把两样都写进静态页的 head 了（scripts/prerender.ts），
 * 这里补的是客户端换路由那一路：pushState 既不改标题也不改 meta。
 *
 * description 在客户端换路由后其实没人读——爬虫拿的是静态页那一份。
 * 跟一份是为了让 DOM 与地址栏始终自洽：调试时 F12 看到的 head 就是这条路由的 head。
 */
function useDocumentHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = pageTitle(pathname)

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = pageDescription(pathname)
  }, [pathname])
}

/* ====================================================================== */

/** 进区状态。规格 3.3：方向区 FOCUS，项目区 SMILE，文档库 THINK。 */
const SECTION_STATE: Record<string, MascotState> = {
  tracks: 'FOCUS',
  projects: 'SMILE',
  docs: 'THINK',
}

/**
 * 单页纵向叙事。规格第 4 节。
 *
 * 立绘状态与联动特效的结论在这里算，算完传给向导挂件——
 * 挂件是 3.4 的唯一观看位（见 spec 3.4 的 M4 修正记录），
 * Hero 的立绘只演首屏那一段，滚出去就交给挂件。
 */
function Portal() {
  useSmoothScroll(!usePrefersReducedMotion())
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
        <ArchiveEntry />
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
 *
 * 坐标缓存，不在滚动帧里读 rect。
 *
 * 前一版每帧对四个分区各调一次 getBoundingClientRect()。首页在同一帧里还有
 * 视差与立绘惯性往 style 上写东西，读写交替 = 每帧一次强制同步布局
 * （forced synchronous layout），lenis 的单帧步长因此忽长忽短。档案库上没有
 * 任何一处在滚动帧里写 style，所以它那份 rect 读取是白拿的，首页不是。
 *
 * 分区高度会变（方向卡展开路线面板），所以挂 ResizeObserver 重新量，
 * 而不是只在 window resize 时量。
 */
function useCurrentSection() {
  const [id, setId] = useState('hero')

  useEffect(() => {
    const ids = ['hero', 'tracks', 'projects', 'docs']
    const els = ids
      .map((sectionId) => document.getElementById(sectionId))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    /** 文档绝对坐标区间。滚动帧里只拿它跟 scrollY 比大小，不碰布局。 */
    let spans: { id: string; top: number; bottom: number }[] = []

    const measure = () => {
      const sy = window.scrollY
      spans = els.map((el) => {
        const r = el.getBoundingClientRect()
        return { id: el.id, top: r.top + sy, bottom: r.bottom + sy }
      })
    }

    const pick = () => {
      const mid = scrollY() + viewportH() / 2
      let hit = 'hero'
      for (const span of spans) {
        if (span.top <= mid && span.bottom > mid) hit = span.id
      }
      setId((prev) => (prev === hit ? prev : hit))
    }

    const remeasure = () => {
      measure()
      requestScrollFrame()
    }

    measure()
    pick()

    // 展开路线面板会改分区高度。ResizeObserver 只在真的变了时回调，不占滚动帧。
    const ro = new ResizeObserver(remeasure)
    for (const el of els) ro.observe(el)

    const off = onScrollFrame('read', pick)
    requestScrollFrame()

    return () => {
      off()
      ro.disconnect()
    }
  }, [])

  return id
}
