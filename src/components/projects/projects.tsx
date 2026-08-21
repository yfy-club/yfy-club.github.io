/**
 * 项目视差展台 · 三个。规格 4.3。
 *
 * 各占 80vh，左右交替。三层视差不同速率：
 *   截图容器 +8%   文案块 -4%   背景刻度线 +14%
 * 位移由一个共用的滚动 RAF 写成 CSS 变量，不让 React 每帧参与。
 *
 * 三色世界（4.3.2）：每个展台的框线与光效走各自主调，面积占比 < 8%，
 * 页面底色、正文墨色、导轨全部保持全局令牌不变。
 *
 * 占位图是构建期出的 20px WebP 内联 data URI，不是 blurhash——
 * 后者要在运行时用 canvas 解码，为一张占位图多背 2 KB JS。见 4.3.1 修正记录。
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bracket, Diamond, Rail, Reticle, Tag } from '@/components/hud'
import { PROJECTS, type Project } from '@/data/projects'
import { SHOTS, shotSrc, shotSrcSet, type ShotId } from '@/data/shots.generated'
import { SPRING, staggerDelay } from '@/lib/motion-tokens'
import { useInView } from '@/lib/use-in-view'
import { usePrefersReducedMotion } from '@/components/mascot/mascot'
import './projects.css'

interface ProjectsProps {
  /** 悬停哪个展台。null = 没有。页面据此让向导的瞳内映色跟随展台主调。 */
  onHover: (tone: string | null) => void
}

export function Projects({ onHover }: ProjectsProps) {
  return (
    <section className="projects" id="projects">
      <Rail />
      <div className="shell">
        <header className="sector-head">
          <div className="sector-badges">
            <Reticle size={22} />
            <Tag tone="solid">SECTOR 02</Tag>
            <Tag tone="ink">03 PROJECTS</Tag>
          </div>
          <h2 className="sector-title">三个开源项目</h2>
          <p className="sector-note">
            每个展台取自己截图的主调做框线。悬停看拓扑光流，点开看分层与指标。
          </p>
        </header>
      </div>

      {PROJECTS.map((project, i) => (
        <Stage key={project.id} project={project} flip={i % 2 === 1} onHover={onHover} />
      ))}
    </section>
  )
}

/* ====================================================================== */

interface StageProps {
  project: Project
  /** 奇数号展台左右翻面。 */
  flip: boolean
  onHover: (tone: string | null) => void
}

function Stage({ project, flip, onHover }: StageProps) {
  const [open, setOpen] = useState(false)
  const { ref, entered } = useInView<HTMLElement>()
  const reduced = usePrefersReducedMotion()
  useParallax(ref, reduced)

  return (
    <article
      className="stage"
      ref={ref}
      data-flip={flip}
      data-entered={entered}
      data-open={open}
      style={{ '--stage-tone': project.tone } as React.CSSProperties}
      onPointerEnter={() => onHover(project.tone)}
      onPointerLeave={() => onHover(null)}
    >
      {/* 背景刻度线。走最快的一层视差 +14% */}
      <div className="stage-ticks" aria-hidden="true" />

      <div className="stage-inner shell">
        <div className="stage-shot">
          <Bracket tone="var(--stage-tone)" length={34} gap={14}>
            <Shot id={project.shot} alt={`${project.name} 界面截图`} />
            <TopoFlow />
          </Bracket>

          {/* 取景框四角的准星。Bracket 只给角线，准星是另一件事 */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <span key={corner} className="stage-reticle" data-corner={corner}>
              <Reticle size={18} />
            </span>
          ))}
        </div>

        <div className="stage-copy">
          <div className="stage-head">
            <span className="stage-index">{project.index}</span>
            <Rail className="stage-head-rail" ticks={false} />
            <span className="stage-name-en">{project.nameEn}</span>
          </div>

          <h3 className="stage-name">{project.name}</h3>
          <p className="stage-brief">{project.brief}</p>

          <ul className="stage-metrics">
            {project.metrics.map((m, i) => (
              <li key={m.label}>
                {i > 0 && <Diamond tone="ink" />}
                <span className="stage-metric-value">{m.value}</span>
                <span className="stage-metric-label">{m.label}</span>
              </li>
            ))}
          </ul>

          <div className="stage-stack">
            {project.stack.map((s) => (
              <Tag key={s} tone="ink">
                {s}
              </Tag>
            ))}
          </div>

          <div className="stage-actions">
            <button
              type="button"
              className="stage-btn"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? '收起档案' : '展开档案'}
            </button>
            <a className="stage-link" href={project.live} target="_blank" rel="noreferrer">
              打开线上 ↗
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="stage-dossier"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING.expand}
          >
            <div className="stage-dossier-inner shell">
              <ol className="stage-tiers">
                {project.tiers.map((tier, i) => (
                  <li key={tier.code} style={{ '--enter-delay': `${staggerDelay(i)}s` } as React.CSSProperties}>
                    <span className="stage-tier-code">{tier.code}</span>
                    <span className="stage-tier-name">{tier.name}</span>
                    <span className="stage-tier-tags">
                      {tier.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="stage-gallery">
                {project.gallery.map((id) => (
                  <Shot key={id} id={id} alt={`${project.name} 界面截图`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

/* ====================================================================== */

/**
 * 一张截图。aspect-ratio 由清单里的真实像素锁住，图片加载前不抖版。
 * 占位图是 20px 宽的内联 WebP，blur 压在 8px 以内（规格 2.5 第 2 条）。
 */
function Shot({ id, alt }: { id: ShotId; alt: string }) {
  const asset = SHOTS[id]
  const [loaded, setLoaded] = useState(false)

  return (
    <span
      className="shot"
      data-loaded={loaded}
      style={
        {
          aspectRatio: `${asset.width} / ${asset.height}`,
          '--shot-lqip': `url("${asset.lqip}")`,
        } as React.CSSProperties
      }
    >
      <img
        src={shotSrc(id)}
        srcSet={shotSrcSet(id)}
        sizes="(width < 768px) 92vw, 46vw"
        width={asset.width}
        height={asset.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </span>
  )
}

/**
 * 拓扑微光流。悬停时沿界面结构线游走，透明度 0.35。
 *
 * 路径是抽象的界面骨架（侧栏 → 主区 → 卡片行），不是描某一张截图的边，
 * 三个展台共用同一份——它表达的是"界面有结构"，不是某个具体布局。
 */
function TopoFlow() {
  return (
    <svg className="stage-topo" viewBox="0 0 400 225" fill="none" aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 34H400" />
      <path d="M84 34V225" />
      <path d="M84 78H400" />
      <path d="M232 78V225" />
      <path d="M232 152H400" />
      <path d="M84 186H232" />
    </svg>
  )
}

/* ====================================================================== */

/** 三层视差的速率。规格 4.3：截图 +8%，文案 -4%，刻度线 +14%。 */
const RATE = { shot: 0.08, copy: -0.04, ticks: 0.14 } as const

/**
 * 视差。全展台共用一个 RAF，位移写成 CSS 变量。
 *
 * 进度定义：区块中心与视口中心对齐时 0，往上往下各到 ±1。
 * 乘上区块高度再乘速率得到像素位移，所以 +8% 是"区块高度的 8%"，
 * 不是"滚了多少就位移多少的 8%"——后者在长页面里会飘到画面外。
 */
function useParallax(ref: React.RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    let raf = 0
    let queued = false

    const apply = () => {
      queued = false
      const r = el.getBoundingClientRect()
      // 区块完全在视口外就不算，省掉离屏元素的 style 写入
      if (r.bottom < 0 || r.top > window.innerHeight) return
      const center = r.top + r.height / 2
      const p = (center - window.innerHeight / 2) / window.innerHeight
      const px = (rate: number) => `${(p * r.height * rate).toFixed(1)}px`
      el.style.setProperty('--par-shot', px(RATE.shot))
      el.style.setProperty('--par-copy', px(RATE.copy))
      el.style.setProperty('--par-ticks', px(RATE.ticks))
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, reduced])
}
