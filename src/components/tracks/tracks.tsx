/**
 * 方向角色卡 · 五张。规格 4.2（含 M4 两条修正记录）。
 *
 * 非对称栅格，列位与高度在 tracks.css 里写死，不是 auto-fill：
 *   ORACLE  1 / span 5  h 480      WEAVER  7 / span 5  h 480
 *   VAULT   2 / span 4  h 320      RELAY   6 / span 4  h 320
 *   FORGE  10 / span 3  h 320
 * 规格原文「小卡各跨 4 列 + 整体右移 1 列」要占到第 13 列，12 栅放不下，已改。
 *
 * 能力条不填百分比。主站 deepFocus[] 里没有任何可以当熟练度的数值，
 * 编一个 85% 违反「事实性数据一律不维护」。见 spec 4.2 修正记录二。
 *
 * 悬停要把联动特效结论报给页面（onHover），观看位是右侧的向导挂件。
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionStyle } from 'motion/react'
import { Diamond, Rail, Reticle, Tag } from '@/components/hud'
import { Mascot } from '@/components/mascot'
import { characterByTrack, FICTION_NOTICE, type TrackSlug } from '@/data/characters'
import { isFeature, TRACKS, type Track } from '@/data/tracks'
import { usePrefersReducedMotion } from '@/components/mascot/mascot'
import { SPRING, staggerDelay } from '@/lib/motion-tokens'
import { useInView } from '@/lib/use-in-view'
import './tracks.css'

/** 倾斜上限。规格 4.2 写死 ≤ 4°，不许调大。 */
const TILT_MAX = 4

interface TracksProps {
  /** 悬停哪张卡。null = 没有。页面据此驱动向导挂件的联动特效。 */
  onHover: (slug: TrackSlug | null) => void
}

export function Tracks({ onHover }: TracksProps) {
  const [open, setOpen] = useState<TrackSlug | null>(null)
  const { ref, entered } = useInView<HTMLElement>()

  // Esc 收起。挂在 window 上而不是卡片上：焦点可能已经移到展开面板里的链接上了
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section className="tracks" id="tracks" ref={ref} data-entered={entered}>
      <Rail />
      <div className="shell">
        <header className="sector-head">
          <div className="sector-badges">
            <Reticle size={22} />
            <Tag tone="solid">SECTOR 01</Tag>
            <Tag tone="ink">05 TRACKS</Tag>
          </div>
          <h2 className="sector-title">五个技术方向</h2>
          <p className="sector-note">
            每个方向配一位常驻研究员。悬停看向导反应，点开看三年路线。
          </p>
        </header>

        <div className="track-grid">
          {TRACKS.map((track, i) => (
            <TrackCard
              key={track.slug}
              track={track}
              index={i}
              open={open === track.slug}
              onToggle={() => setOpen((cur) => (cur === track.slug ? null : track.slug))}
              onHover={onHover}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====================================================================== */

interface TrackCardProps {
  track: Track
  index: number
  open: boolean
  onToggle: () => void
  onHover: (slug: TrackSlug | null) => void
}

function TrackCard({ track, index, open, onToggle, onHover }: TrackCardProps) {
  const character = characterByTrack(track.slug)
  const feature = isFeature(track.slug)
  const card = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  const { rotateX, rotateY, onPointerMove, onLeave } = useTilt(card, reduced)

  return (
    // 外层只管栅格位与 layout，内层只管倾斜。
    // 两件事不能写在同一个元素上：motion 的 layout 动画要接管 transform，
    // 跟自己写的 rotateX/rotateY 会互相覆盖。
    <motion.div
      className="track-card"
      data-size={feature ? 'large' : 'small'}
      data-track={track.slug}
      data-open={open}
      layout
      layoutId={`track-${track.slug}`}
      transition={SPRING.expand}
      // motion 的 style 不接 CSSProperties（exactOptionalPropertyTypes 下 x/y 等属性不兼容）
      style={{ '--i': index, '--enter-delay': `${staggerDelay(index)}s` } as MotionStyle}
      onPointerEnter={() => onHover(track.slug)}
      onPointerLeave={() => {
        onLeave()
        onHover(null)
      }}
    >
      <motion.div
        ref={card}
        className="track-tilt"
        style={{ rotateX, rotateY }}
        onPointerMove={onPointerMove}
      >
        {/* 悬停时扫过的光栅。绑在交互态上，静止画面里没有光（规格 2.5 第 4 条） */}
        <span className="track-raster" aria-hidden="true" />

        <button
          type="button"
          className="track-face"
          aria-expanded={open}
          onClick={onToggle}
          // 键盘聚焦也要给向导反应，否则 Tab 过去像坏了
          onFocus={() => onHover(track.slug)}
          onBlur={() => onHover(null)}
        >
          <span className="track-top">
            <Tag tone="solid">{character.codename}</Tag>
            <span className="track-index">{track.index}</span>
          </span>

          <span className="track-portrait">
            <Mascot character={character} crop={feature ? 'full' : 'bust'} state="NEUTRAL" />
          </span>

          <span className="track-id">
            <span className="track-name">{character.name}</span>
            <span className="track-romaji">{character.romaji}</span>
          </span>

          <span className="track-role">{character.role}</span>

          <ul className="track-abilities">
            {track.abilities.map((ability) => (
              <li key={ability.code}>
                <span className="track-ability-head">
                  <Diamond tone="sky" />
                  <span className="track-ability-zh">{ability.zh}</span>
                </span>
                <span className="track-ability-code">{ability.code}</span>
                {feature && <span className="track-ability-keys">{ability.keys}</span>}
                {/* 细导轨。不填百分比——没有可用的数值，编一个就是假数据 */}
                <span className="track-ability-rail" aria-hidden="true" />
              </li>
            ))}
          </ul>

          <span className="track-notice">{FICTION_NOTICE}</span>
        </button>

        {/* 原地展开，不弹模态遮罩（规格 4.2） */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              className="track-dossier"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING.expand}
            >
              <p className="track-tagline">{track.tagline}</p>
              <ol className="track-stages">
                {track.stages.map((stage) => (
                  <li key={stage.code}>
                    <span className="track-stage-head">
                      <Tag tone="pink">{stage.year}</Tag>
                      <span className="track-stage-code">{stage.code}</span>
                    </span>
                    <span className="track-stage-title">{stage.title}</span>
                    <span className="track-stage-tags">
                      {stage.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ====================================================================== */

/**
 * 3D 倾斜跟鼠标。规格 5.1 的 tilt 弹簧，幅度 ≤ 4°。
 * 用 motion 的 useSpring 而不是自己的 RAF：卡片只有五张，且 transform
 * 由 motion 直接写进 style，不会每帧过 React 的 diff。
 */
function useTilt(ref: React.RefObject<HTMLElement | null>, reduced: boolean) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, SPRING.tilt)
  const rotateY = useSpring(ry, SPRING.tilt)

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // 归一化到 ±1 再乘上限，卡片多大都是同一个手感
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    // 鼠标往下 → 卡片上缘后仰，所以 rotateX 取负号
    rx.set(-ny * TILT_MAX * 2)
    ry.set(nx * TILT_MAX * 2)
  }

  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return { rotateX, rotateY, onPointerMove, onLeave }
}
