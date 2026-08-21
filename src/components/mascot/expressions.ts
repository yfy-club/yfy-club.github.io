/**
 * 七态差分表。
 *
 * 差分只切五组：eye-lid / eye-iris / brows / mouth / blush。
 * 脸、眼白、睫毛、耳、脖、身体、头发一律不动——这是差分的正确成本模型，
 * 想加新表情就往这张表里加一行，不要去动骨架。
 *
 * 全部路径写左半边的坐标，右半边默认取镜像（geometry.MIRROR）。
 * 只有需要左右不对称的状态（THINK 单眉上挑、POUT 闭一只眼）才写 *Right 覆盖。
 */

export const MASCOT_STATES = [
  'NEUTRAL',
  'FOCUS',
  'SURPRISE',
  'THINK',
  'SMILE',
  'IDLE_DAZE',
  'POUT',
] as const

export type MascotState = (typeof MASCOT_STATES)[number]

export interface EyeShape {
  /** 上睑压下来的皮肤色形状，裁在眼窝内。null = 全睁。 */
  lid: string | null
  /**
   * 睑缘的睫毛线。有 lid 就必须有它。
   * 睑压下来时固定睫毛会淡出，由这条线接手——不然半睁的眼就是脸上糊了一块肉色。
   */
  lidLine: string | null
  /** 闭眼弧线。非 null 时不画眼白与瞳，只留这条线。 */
  shut: string | null
}

export interface Expression {
  /** 一句话说清这个状态在表达什么。改路径前先确认还符合这句话。 */
  intent: string
  eye: EyeShape
  /** 右眼覆盖。不写就用 eye 的镜像。 */
  eyeRight?: EyeShape
  brow: string
  /** 右眉覆盖。不写就用 brow 的镜像。 */
  browRight?: string
  mouth: string
  /** 嘴是否填充。张嘴要填，闭嘴只描边。 */
  mouthFilled: boolean
  blush: number
  /** 瞳孔缩放。SURPRISE 放大到 1.15 是规格 3.3 定死的。 */
  irisScale: number
  /** 视线偏置，叠加在鼠标跟随之上，单位是 viewBox 用户单位。 */
  gaze: { x: number; y: number }
  /** 鼓脸。只有 POUT 用。 */
  puff: boolean
}

/* 复用的睑形，避免同一条曲线抄七遍抄歪。 */
const OPEN: EyeShape = { lid: null, lidLine: null, shut: null }

/** 压四分之一。眉压下来时上睑跟着走一点，不然只有眉动很假。 */
const LID_QUARTER: EyeShape = {
  lid: 'M162 206H232V230C212 220 184 220 162 232Z',
  lidLine: 'M156 227C168 219 186 217 204 219C216 221 226 224 232 230',
  shut: null,
}

/** 压一半。发呆用。 */
const LID_HALF: EyeShape = {
  lid: 'M162 206H232V248C212 237 184 237 162 250Z',
  lidLine: 'M157 243C170 235 188 233 206 235C218 237 227 241 232 248',
  shut: null,
}

/** 笑眼。开口朝下的弧，这是"眼睑下弯"的正解。 */
const SHUT_HAPPY: EyeShape = {
  lid: null,
  lidLine: null,
  shut: 'M161 254C176 231 212 229 229 248',
}

/** 眨眼与闭眼。比笑眼平，几乎是一条线。 */
const SHUT_FLAT: EyeShape = {
  lid: null,
  lidLine: null,
  shut: 'M163 243C178 256 208 258 227 243',
}

export const EXPRESSIONS: Record<MascotState, Expression> = {
  NEUTRAL: {
    intent: '待机。视线跟鼠标，随机眨眼。',
    eye: OPEN,
    brow: 'M170 202C181 194 199 193 214 199',
    mouth: 'M231 302C235 306 245 306 249 302',
    mouthFilled: false,
    blush: 0,
    irisScale: 1,
    gaze: { x: 0, y: 0 },
    puff: false,
  },

  FOCUS: {
    intent: '专注。眉略压，上睑跟着下来一点，视线咬住目标。',
    eye: LID_QUARTER,
    brow: 'M169 199C181 195 199 199 214 208',
    mouth: 'M232 303C236 302 244 302 248 303',
    mouthFilled: false,
    blush: 0,
    irisScale: 1,
    gaze: { x: 0, y: 1 },
    puff: false,
  },

  SURPRISE: {
    intent: '意外。瞳孔放大 1.15，嘴张成小 O，眉抬到最高。',
    eye: OPEN,
    brow: 'M170 193C181 184 199 183 214 189',
    mouth:
      'M240 293C247 293 252 298 252 305C252 312 247 317 240 317C233 317 228 312 228 305C228 298 233 293 240 293Z',
    mouthFilled: true,
    blush: 0.35,
    irisScale: 1.15,
    gaze: { x: 0, y: -1 },
    puff: false,
  },

  THINK: {
    intent: '思索。单眉上挑，视线上飘。呆毛下垂由 CSS 单独处理。',
    eye: LID_QUARTER,
    // 左眉挑高
    brow: 'M170 189C181 180 200 180 215 188',
    // 右眉留在原位。不对称才是"单眉上挑"，两边一起挑就是惊讶了。
    browRight: 'M266 200C281 194 299 195 310 203',
    mouth: 'M230 304C234 300 241 301 245 305',
    mouthFilled: false,
    blush: 0,
    irisScale: 0.98,
    gaze: { x: 0, y: -4 },
    puff: false,
  },

  SMILE: {
    intent: '愉快。笑眼 + 张口笑 + 腮红半开。',
    eye: SHUT_HAPPY,
    brow: 'M170 199C181 192 199 191 214 198',
    mouth: 'M226 297C232 295 248 295 254 297C254 310 247 318 240 318C233 318 226 310 226 297Z',
    mouthFilled: true,
    blush: 0.5,
    irisScale: 1,
    gaze: { x: 0, y: 0 },
    puff: false,
  },

  IDLE_DAZE: {
    intent: '发呆。睑半闭，瞳飘左上，眉塌平。',
    eye: LID_HALF,
    brow: 'M170 205C181 203 199 203 214 206',
    mouth: 'M235 302C238 300 242 300 245 302C245 308 242 311 240 311C238 311 235 308 235 302Z',
    mouthFilled: true,
    blush: 0.15,
    irisScale: 0.94,
    gaze: { x: -3, y: -4 },
    puff: false,
  },

  POUT: {
    intent: '鼓脸。闭右眼，嘴抿成一小撮，腮红拉满，halo 抖。',
    eye: LID_QUARTER,
    eyeRight: SHUT_FLAT,
    brow: 'M168 196C181 194 200 200 215 210',
    browRight: 'M265 210C280 200 299 194 312 196',
    mouth: 'M231 305C234 299 246 299 249 305C246 310 234 310 231 305Z',
    mouthFilled: true,
    blush: 0.8,
    irisScale: 1.05,
    gaze: { x: 0, y: 1 },
    puff: true,
  },
}

/** 鼓脸时额外鼓出去的那块脸颊。左半边，右边取镜像。 */
export const CHEEK_PUFF = 'M162 266C149 272 146 291 155 302C162 311 171 312 178 305Z'

/** 眨眼用的睑形。眨眼不进状态机——它是叠在任何状态上的一层瞬时覆盖。 */
export const BLINK_SHUT = SHUT_FLAT.shut!
