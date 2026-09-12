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
import { Diamond, Rail, Reticle, Tag } from '@/components/hud'
import { PROJECTS, type Project } from '@/data/projects'
import { SHOTS, shotSrc, shotSrcSet, type ShotId } from '@/data/shots.generated'
import { SPRING, staggerDelay } from '@/lib/motion-tokens'
import { useInView } from '@/lib/use-in-view'
import './projects.css'

interface ProjectsProps {
  /** 悬停哪个展台。null = 没有。页面据此让向导的瞳内映色跟随展台主调。 */
  onHover: (tone: string | null) => void
}

interface ToastNotice {
  role: string
  label: string
  value: string
}

export function Projects({ onHover }: ProjectsProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [notice, setNotice] = useState<ToastNotice | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  return (
    <section className="projects" id="projects">
      <Rail />
      <div className="shell">
        <header className="sector-head">
          <div className="sector-badges">
            <Reticle size={22} />
            <Tag tone="solid">SECTOR 02</Tag>
          </div>
          <h2 className="sector-title">社团开源工程</h2>
          <p className="sector-note">
            源自真实场景需求，具备完整的架构设计、技术分层与可在线运行环境。
          </p>
        </header>
      </div>

      <div className="projects-list shell">
        {PROJECTS.map((project, i) => (
          <Stage
            key={project.id}
            project={project}
            flip={i % 2 === 1}
            open={openId === project.id}
            onToggle={() => setOpenId((cur) => (cur === project.id ? null : project.id))}
            onHover={onHover}
            onNotify={setNotice}
          />
        ))}
      </div>

      {/* 复制成功全局轻量提示 Toast */}
      <div className="stage-toast-viewport" aria-live="polite">
        <AnimatePresence>
          {notice && (
            <motion.div
              className="stage-toast"
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="stage-toast-diamond">◆</span>
              <span className="stage-toast-badge">已复制</span>
              <span className="stage-toast-text">
                <span className="stage-toast-role">{notice.role}</span>
                <span className="stage-toast-label">{notice.label}</span>
                <code className="stage-toast-val">{notice.value}</code>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ====================================================================== */

interface StageProps {
  project: Project
  /** 奇数号展台左右翻面。 */
  flip: boolean
  open: boolean
  onToggle: () => void
  onHover: (tone: string | null) => void
  onNotify: (msg: ToastNotice) => void
}

function Stage({ project, flip, open, onToggle, onHover, onNotify }: StageProps) {
  const { ref, entered } = useInView<HTMLElement>()

  /*
   * Esc 收起当前展开的卡片。
   */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onToggle])

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
      <div className="stage-card" data-open={open}>
        {/* 45° 战术角标 Pin */}
        <div className="stage-card-pin">
          <span className="stage-pin-index">{project.index}</span>
          <span className="stage-pin-tag">PROJECT</span>
        </div>

        {/* 主展示行（大画幅截图 + 详情文案） */}
        <div className="stage-card-main">
          {/* 卡片内截图媒体区 */}
          <div className="stage-card-media">
            <Shot id={project.shot} alt={`${project.name} 界面截图`} />
          </div>

          {/* 卡片内信息区 */}
          <div className="stage-card-content">
            <div className="stage-head">
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

            {project.demoAccounts && (
              <div className="stage-demo-panel">
                <table className="stage-demo-table">
                  <caption className="sr-only">{project.name} 演示测试账号</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="stage-col-role">角色</th>
                      <th scope="col" className="stage-col-account">账号</th>
                      <th scope="col" className="stage-col-password">密码</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.demoAccounts.map((account) => (
                      <tr key={account.role}>
                        <td className="stage-cell-role">
                          <span className="stage-role-tag">{account.role}</span>
                        </td>
                        <td className="stage-cell-account">
                          <CopyCell
                            value={account.account}
                            label="账号"
                            role={account.role}
                            onNotify={onNotify}
                          />
                        </td>
                        <td className="stage-cell-password">
                          <CopyCell
                            value={account.password}
                            label="密码"
                            role={account.role}
                            onNotify={onNotify}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="stage-actions">
              <button
                type="button"
                className="stage-btn"
                aria-expanded={open}
                onClick={onToggle}
              >
                {open ? '收起档案 ▴' : '展开档案 ▾'}
              </button>
              <a className="stage-link" href={project.live} target="_blank" rel="noreferrer">
                打开线上 ↗
              </a>
            </div>
          </div>
        </div>

          {/* 底部全宽向下展开的档案区域 */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                className="stage-card-dossier"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING.expand}
              >
                <div className="stage-dossier-inner">
                  {/* 分层架构区（4 列横向建筑分层流水线） */}
                  <div className="stage-dossier-section">
                    <div className="stage-dossier-header">
                      <Reticle size={14} />
                      <span className="stage-dossier-title">SYSTEM ARCHITECTURE TIERS</span>
                      <Rail className="stage-dossier-rail" ticks={false} />
                    </div>

                    <ol className="stage-tiers">
                      {project.tiers.map((tier, i) => (
                        <li
                          key={tier.code}
                          style={{ '--enter-delay': `${staggerDelay(i)}s` } as React.CSSProperties}
                        >
                          <div className="stage-tier-head">
                            <span className="stage-tier-code">{tier.code}</span>
                            <span className="stage-tier-name">{tier.name}</span>
                          </div>
                          <div className="stage-tier-tags">
                            {tier.tags.map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 详细图库区（全宽大画幅展示） */}
                  <div className="stage-dossier-section">
                    <div className="stage-dossier-header">
                      <Reticle size={14} />
                      <span className="stage-dossier-title">GALLERY PREVIEWS</span>
                      <Rail className="stage-dossier-rail" ticks={false} />
                    </div>

                    <div className="stage-gallery" data-count={project.gallery.length}>
                      {project.gallery.map((id) => (
                        <div key={id} className="stage-gallery-item">
                          <Shot id={id} alt={`${project.name} 界面截图`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

/* ====================================================================== */

function CopyCell({
  value,
  label,
  role,
  onNotify,
}: {
  value: string
  label: string
  role: string
  onNotify: (msg: ToastNotice) => void
}) {
  const [active, setActive] = useState(false)

  const onCopy = () => {
    const onSuccess = () => {
      setActive(true)
      setTimeout(() => setActive(false), 800)
      onNotify({ role, label, value })
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(onSuccess).catch(() => {
        if (fallbackCopy(value)) onSuccess()
      })
    } else {
      if (fallbackCopy(value)) onSuccess()
    }
  }

  return (
    <button
      type="button"
      className="stage-copy-cell"
      data-active={active}
      onClick={onCopy}
      title={`点击复制${label} ${value}`}
      aria-label={`复制${role}${label} ${value}`}
    >
      <code className="stage-copy-code">{value}</code>
    </button>
  )
}

function fallbackCopy(text: string): boolean {
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(el)
    return successful
  } catch {
    return false
  }
}
