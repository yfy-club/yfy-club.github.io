/**
 * BGM 音色预设。桌面与手机两套，运行时挑一套。
 *
 * 为什么要分两套（M9）：手机扬声器 500Hz 以下基本没有输出能力。
 * 实测线上站点的真实输出频谱，暖垫（185–277Hz，套 320Hz 低通）与次低音（49–73Hz）
 * 在手机上全程等于不存在，而它们占掉了大部分动态余量；
 * 可听频段 500–1200Hz 只在钢琴音头那一瞬冒到 -63dB，乐句留白期掉到 -121dB。
 * 于是手机上「技术上在播、人耳听不见」，与「BGM 没开」无法区分。
 *
 * desktop 那一列是原始手调数值，逐个不动——耳机上那种极暗极轻是刻意的。
 * mobile 把能量搬进 370–1200Hz，代价是听感更亮更湿，只在小屏 / 粗指针设备生效。
 */

export interface TonePreset {
  /** 暖垫每个音的增益。 */
  padGain: number
  /**
   * 暖垫八度叠层的相对增益（0 = 不叠）。
   *
   * 正弦波在 185Hz 上于 500Hz 处能量严格为零，所以单抬低通一点用都没有，
   * 必须真的把能量放到上面去。叠八度而不是直接移调：和声色彩不变。
   */
  padOctaveMix: number
  padLowpassHz: number
  /** 暖垫爬到目标音量的时长，秒。 */
  padRampSec: number

  /** 次低音增益。手机上全损，调低省出动态余量。 */
  bassGain: number

  pianoGain: number
  /** 2 次谐波相对增益。 */
  pianoH2: number
  /** 3 次谐波相对增益（0 = 不加）。 */
  pianoH3: number
  pianoLowpassHz: number

  /** 母带高通。砍掉放不出来的超低频。 */
  masterHighpassHz: number

  delaySendGain: number
  delayFeedback: number
  delayLowpassHz: number

  /** 起播淡入时长，毫秒。 */
  fadeInMs: number
  /** 和弦升起后到第一颗钢琴键的延迟，毫秒。 */
  firstNoteDelayMs: number

  /**
   * 主音量倍率。
   *
   * 外部传进来的目标音量固定 0.35，而手机上整条链子加起来仍旧跑在
   * 满刻度以下很多（实测峰值 0.19）。继续抬单层增益会把暖垫与钢琴的
   * 平衡推歪，所以剩下的余量统一从主增益拿。
   */
  masterVolumeScale: number
}

/** 桌面：原始手调数值，不要动。 */
const DESKTOP: TonePreset = {
  padGain: 0.016,
  padOctaveMix: 0,
  padLowpassHz: 320,
  padRampSec: 2.5,

  bassGain: 0.012,

  pianoGain: 0.055,
  pianoH2: 0.3,
  pianoH3: 0,
  pianoLowpassHz: 1100,

  masterHighpassHz: 45,

  delaySendGain: 0.24,
  delayFeedback: 0.28,
  delayLowpassHz: 1000,

  fadeInMs: 1500,
  firstNoteDelayMs: 1000,

  masterVolumeScale: 1,
}

/**
 * 手机：把实能量搬进扬声器通带。
 *
 * 增益敢往上抬是因为原来整条链子跑在满刻度以下约 28dB（实测峰值 0.042），
 * 动态余量根本没用上，抬到峰值 0.25 附近仍不削波。
 *
 * 留白期靠加深空间延迟铺满：乐句之间有 5–6 秒空档，在手机上就是彻底没声。
 * 这是 C418 本来就重度依赖的手法，不算跑偏。
 */
const MOBILE: TonePreset = {
  padGain: 0.075,
  padOctaveMix: 0.6,
  padLowpassHz: 1800,
  padRampSec: 1.2,

  bassGain: 0.008,

  pianoGain: 0.28,
  pianoH2: 0.45,
  pianoH3: 0.18,
  pianoLowpassHz: 2800,

  masterHighpassHz: 90,

  delaySendGain: 0.32,
  delayFeedback: 0.45,
  delayLowpassHz: 2200,

  fadeInMs: 600,
  firstNoteDelayMs: 300,

  masterVolumeScale: 1.7,
}

/**
 * 挑一套。窄屏或粗指针（触摸）算手机。
 *
 * 两个判据取并集而不是只看宽度：平板横放时宽度够，但仍是外放小喇叭；
 * 桌面浏览器拖窄窗口时走亮的那套虽然不完美，但比反过来漏掉真手机好。
 *
 * 每次调用现算，不缓存：桌面拖动窗口宽度、平板旋转都会改变结论，
 * 而调用点只在建图时（一次起播一次），不值得为它挂 matchMedia 监听。
 */
export function tonePreset(): TonePreset {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return DESKTOP
  const narrow = window.matchMedia('(width < 768px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return narrow || coarse ? MOBILE : DESKTOP
}

/** 测试与诊断用。 */
export const TONE_PRESETS = { DESKTOP, MOBILE }
