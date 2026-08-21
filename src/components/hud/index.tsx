import type { CSSProperties, ReactNode } from 'react'
import './hud.css'

export type HudTone = 'sky' | 'pink' | 'ink'

/* ------------------------------------------------------------------------ */

interface RailProps {
  orientation?: 'horizontal' | 'vertical'
  /** 两端各加一道 4px 短刻。用于分区导轨，纯装饰性分隔可以关掉。 */
  ticks?: boolean
  className?: string
}

export function Rail({ orientation = 'horizontal', ticks = true, className }: RailProps) {
  return (
    <div
      aria-hidden="true"
      className={['hud-rail', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-ticks={ticks}
    />
  )
}

/* ------------------------------------------------------------------------ */

interface ReticleProps {
  size?: number
  tone?: HudTone
  className?: string
}

/** 十字准星。中心是空心方，不是实心点——实心点会显脏。 */
export function Reticle({ size = 22, tone = 'sky', className }: ReticleProps) {
  const half = size / 2
  const box = 3

  return (
    <svg
      aria-hidden="true"
      className={['hud-reticle', className].filter(Boolean).join(' ')}
      data-tone={tone}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
    >
      <path
        d={`M0 ${half} H${half - box} M${half + box} ${half} H${size} M${half} 0 V${half - box} M${half} ${half + box} V${size}`}
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x={half - box}
        y={half - box}
        width={box * 2}
        height={box * 2}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------------ */

interface TickScaleProps {
  count: number
  /** 每几格出一道长刻并标序号。 */
  majorEvery?: number
  /** 当前高亮到第几格，从 0 起。传 null 表示不高亮。 */
  active?: number | null
  className?: string
}

/** 垂直刻度尺。页面左侧的滚动进度就是它。 */
export function TickScale({ count, majorEvery = 5, active = null, className }: TickScaleProps) {
  return (
    <div
      aria-hidden="true"
      className={['hud-scale', className].filter(Boolean).join(' ')}
    >
      {Array.from({ length: count }, (_, i) => {
        const major = i % majorEvery === 0
        return (
          <div
            key={i}
            className="hud-scale-row"
            data-major={major}
            data-active={active === i}
          >
            <span className="hud-scale-mark" />
            {major && <span className="hud-scale-num">{String(i).padStart(2, '0')}</span>}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------------ */

interface TagProps {
  children: ReactNode
  tone?: HudTone | 'solid'
  className?: string
}

/** 切角标签。文案只用真实语义的短词，不编中二黑话。 */
export function Tag({ children, tone = 'sky', className }: TagProps) {
  return (
    <span className={['hud-tag', className].filter(Boolean).join(' ')} data-tone={tone}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------------ */

interface BracketProps {
  children: ReactNode
  /** 展台主调。传 CSS 颜色值，见 tokens.css 的 --stage-*。 */
  tone?: string
  /** 角线长度。大图用长一点，小卡用短一点。 */
  length?: number
  /** 角线离内容的距离。 */
  gap?: number
  className?: string
}

/** 四角 L 形取景框。只画角，不闭合——闭合了就变成普通边框，失去取景的意味。 */
export function Bracket({ children, tone, length, gap, className }: BracketProps) {
  return (
    <div
      className={['hud-bracket', className].filter(Boolean).join(' ')}
      style={
        {
          ...(tone ? { '--bracket-tone': tone } : {}),
          ...(length ? { '--bracket-len': `${length}px` } : {}),
          ...(gap ? { '--bracket-gap': `${gap}px` } : {}),
        } as CSSProperties
      }
    >
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <span key={corner} className="hud-bracket-corner" data-corner={corner} aria-hidden="true" />
      ))}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------------ */

interface DiamondProps {
  tone?: HudTone
  className?: string
}

/** 45° 小方块。全站的列表符号只有它，不用 Emoji，不用短横线。 */
export function Diamond({ tone = 'sky', className }: DiamondProps) {
  return (
    <span
      aria-hidden="true"
      className={['hud-diamond', className].filter(Boolean).join(' ')}
      data-tone={tone}
    />
  )
}

/* ------------------------------------------------------------------------ */

interface HudListProps {
  items: ReactNode[]
  tone?: HudTone
  className?: string
}

export function HudList({ items, tone = 'sky', className }: HudListProps) {
  return (
    <ul className={['hud-list', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <li key={i}>
          <Diamond tone={tone} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
