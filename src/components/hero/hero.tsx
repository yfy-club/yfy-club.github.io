/**
 * Hero 全屏舞台。规格 4.1。
 *
 * 骨架：左侧刻度尺 → 竖排字标 → 导轨 → HUD 行 → 副标题 → 两枚按钮，
 * 立绘压在右侧 42%，顶部与右侧刻意溢出裁切边界。首屏不出现任何卡片。
 * 背景自下而上：--bg-sky 纯色 → 坐标网格 → Canvas 粒子 → 内容。
 */
import { useEffect, useState } from 'react'
import { DanmakuTracks } from '@/components/danmaku/tracks'
import { Rail, Reticle, Tag, TickScale } from '@/components/hud'
import { Mascot, type MascotState } from '@/components/mascot'
import { NAVI } from '@/data/characters'
import { ParticleField } from './particles'
import { Wordmark } from './wordmark'
import './hero.css'

/** 左侧刻度尺格数。20 格在 1000px 视口高度下约 30px 一格，够密不显空。 */
const TICKS = 20

const CLUB_SITE = 'https://www.yunfeiyang.tech'

interface HeroProps {
  /**
   * 立绘状态。页面算好传进来。
   * 首屏在视口里时是 NEUTRAL，滚出去后的进区状态主要由向导挂件演，
   * 这里跟一份是为了反向滚回首屏时不会突然切回。
   */
  state?: MascotState
}

export function Hero({ state = 'NEUTRAL' }: HeroProps) {
  const active = useHeroProgress(TICKS)

  return (
    <section className="hero" id="hero">
      <div className="hero-grid coord-grid" aria-hidden="true" />
      <ParticleField />
      <DanmakuTracks />

      <TickScale count={TICKS} active={active} className="hero-scale" />

      <div className="hero-body shell">
        <div className="hero-copy">
          <Wordmark />

          <Rail className="hero-rail" />

          <p className="hero-hud">OPEN SOURCE PORTAL</p>

          <p className="hero-sub">五个技术方向 · 三个开源项目 · 一座观测站</p>

          <div className="hero-actions">
            <a className="hero-btn" data-kind="primary" href="#tracks">
              进入方向档案
            </a>
            <a
              className="hero-btn"
              data-kind="ghost"
              href={CLUB_SITE}
              target="_blank"
              rel="noreferrer"
            >
              前往社团官网 ↗
            </a>
          </div>
        </div>

        <div className="hero-mascot">
          {/* 首屏 LCP 元素：eager + fetchpriority=high，并在 index.html 预载 */}
          <Mascot character={NAVI} state={state} priority />
          <figcaption className="hero-mascot-plate">
            <Tag tone="solid">{NAVI.codename}</Tag>
            <span className="hero-mascot-name">{NAVI.name}</span>
            <span className="hero-mascot-romaji">{NAVI.romaji}</span>
          </figcaption>
        </div>
      </div>

      <Reticle size={26} className="hero-reticle" />
    </section>
  )
}

/**
 * 首屏滚动进度，映射到刻度尺的第几格。
 * 只在首屏范围内算，滚出去就锁在最后一格，不做无意义的全页进度。
 */
function useHeroProgress(count: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let frame = 0
    const on = () => {
      frame = 0
      const span = window.innerHeight
      const ratio = Math.min(1, Math.max(0, window.scrollY / span))
      const next = Math.min(count - 1, Math.round(ratio * (count - 1)))
      setIndex((prev) => (prev === next ? prev : next))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(on)
    }
    on()
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
    }
  }, [count])

  return index
}
