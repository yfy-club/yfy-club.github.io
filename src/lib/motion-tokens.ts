/**
 * 动效令牌。
 *
 * 数值是设计规格的一部分，不是随手调的手感值。改之前先看
 * docs/design-spec.md 第 3.5 与 5.1 节，改完把那两张表一起改。
 */

export interface Spring {
  type: 'spring'
  stiffness: number
  damping: number
  mass: number
}

const spring = (stiffness: number, damping: number, mass: number): Spring => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
})

/** 界面级弹簧（规格 5.1） */
export const SPRING = {
  /** 卡片原地展开与收起 */
  expand: spring(260, 30, 0.9),
  /** 按钮磁吸跟随鼠标 */
  magnetic: spring(180, 18, 1.0),
  /** 卡片 3D 倾斜 */
  tilt: spring(220, 26, 1.0),
} as const

/**
 * 立绘部件惯性（规格 3.5）。
 * gain 是跟随增益，位移一律 clamp 到 MASCOT_MAX_OFFSET，
 * 否则鼠标一甩画面就散架。
 */
export const MASCOT = {
  ahoge: { ...spring(70, 9, 1.0), gain: 0.16 },
  hairBack: { ...spring(90, 12, 0.9), gain: 0.1 },
  hairFront: { ...spring(120, 14, 0.8), gain: 0.07 },
  scarf: { ...spring(100, 13, 1.1), gain: 0.12 },
  halo: { ...spring(150, 18, 0.7), gain: 0.05 },
  body: { ...spring(200, 24, 1.0), gain: 0.03 },
} as const

export const MASCOT_MAX_OFFSET = 14

/** 区块进入。不用弹簧，用缓动，避免满屏东西一起弹。 */
export const ENTER = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
} as const

/** 同一屏内最多做 6 个 stagger 单元，超出的不做动画。 */
export const STAGGER_SECONDS = 0.06
export const STAGGER_MAX_ITEMS = 6

/** 立绘差分交叉淡入。禁止硬切。 */
export const SWAP_SECONDS = 0.12

export function staggerDelay(index: number) {
  return Math.min(index, STAGGER_MAX_ITEMS) * STAGGER_SECONDS
}
