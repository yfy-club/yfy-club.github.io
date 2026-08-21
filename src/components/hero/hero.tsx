/**
 * Hero 全屏舞台。规格 4.1。
 *
 * 骨架：左侧刻度尺 → 竖排字标 → 导轨 → HUD 行 → 副标题 → 两枚按钮，
 * 立绘压在右侧 42%，顶部与右侧刻意溢出裁切边界。首屏不出现任何卡片。
 * 背景自下而上：--bg-sky 纯色 → 坐标网格 → Canvas 粒子 → 内容。
 */
import { useEffect, useState } from 'react'
import { Rail, Reticle, Tag, TickScale } from '@/components/hud'
import { Mascot } from '@/components/mascot'
import { NAVI } from '@/data/characters'
import { ParticleField } from './particles'
import { Wordmark } from './wordmark'
import './hero.css'

/** 左侧刻度尺格数。20 格在 1000px 视口高度下约 30px 一格，够密不显空。 */
const TICKS = 20

const CLUB_SITE = 'https://www.yunfeiyang.tech'

export function Hero() {
  const active = useHeroProgress(TICKS)

  return (
    <section className="hero" id="hero">
      <div className="hero-grid coord-grid" aria-hidden="true" />
      <ParticleField />

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
          <Mascot character={NAVI} state="NEUTRAL" />
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
    const on = () => {
      const span = window.innerHeight
      const ratio = Math.min(1, Math.max(0, window.scrollY / span))
      setIndex(Math.min(count - 1, Math.round(ratio * (count - 1))))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [count])

  return index
}
