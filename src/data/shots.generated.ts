/* 由 scripts/build-shots.ts 生成，不要手改。选片与档位见 docs/design-spec.md 4.3.1。 */

export interface ShotAsset {
  /** 源图像素宽高，用来锁 aspect-ratio，防止图片加载前抖版。 */
  width: number
  height: number
  /** 已产出的档位，降序。第一个是最大档。 */
  widths: readonly number[]
  /** 20px 宽的内联占位图。零运行时解码，直接当 background-image。 */
  lqip: string
}

export const SHOTS = {
  'zgyc-map': {
    width: 1920,
    height: 1079,
    widths: [1600, 960],
    lqip: 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAABwAwCdASoUAAsAPu1iqU2ppaQiMAgBMB2JZwAAW+oGGe5TRNAA/u+/jtiAvZsQK+4EF+yjnjDvANCGcMAAAA==',
  },
  'zgyc-realtime': {
    width: 1920,
    height: 1084,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADQAgCdASoUAAsAPu1iqU2ppaQiMAgBMB2JaQAAfj4AAP7wwGcyrl/xuszgAA==',
  },
  'zgyc-policy': {
    width: 1920,
    height: 1079,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAAAQAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JaQAAetDEoAAA/vCTEg/DhMYlivSXgAA=',
  },
  'zgyc-alarm': {
    width: 1920,
    height: 1084,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAAAQAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JaQAAetCYUgAA/vClJXmAAAA=',
  },
  'zhixueban-knowledge': {
    width: 1920,
    height: 1086,
    widths: [1600, 960],
    lqip: 'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JYwC7ACHe72wf0vwvNgAA/tMs0E0uwlaGZrqHoYH44xF+lAB0y6dElbOoFSAssAA=',
  },
  'zhixueban-chat': {
    width: 1920,
    height: 1086,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAABwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JQBUehDvpIQinzAwA/tMuBGtwFJPg5p9u9FPCby9nfPqsI3pN7u9eELr/7qs606mds5Qy3j1F8AAA',
  },
  'zhixueban-roadmap': {
    width: 1920,
    height: 1086,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JQBdmUABe8NqmeHgbkAAA/tOWh5wFgWpc1VPkeoEr8QYrBFe98i6TADOcft/B5ZMqhuOxGa9ntwAA',
  },
  'matrix-main': {
    width: 1920,
    height: 1086,
    widths: [1600, 960],
    lqip: 'data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAAAQAwCdASoUAAsAPu1iqU2ppaQiMAgBMB2JZwDA3C0Hf6AA/vAtLoV116edJ8dP/CbkijB1FAA=',
  },
  'matrix-trace': {
    width: 1920,
    height: 1064,
    widths: [960],
    lqip: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAgCdASoUAAsAPu1kqU2tJaOiMAgBoB2JZwC/ODKtAAD+8GQg+ATrThSTTAAA',
  },
} as const

export type ShotId = keyof typeof SHOTS

const BASE = '/images/stage'

/** srcset 用的候选列表。 */
export function shotSrcSet(id: ShotId) {
  return SHOTS[id].widths.map((w) => `${BASE}/${id}-${w}.webp ${w}w`).join(', ')
}

/** src 兜底取最小档，避免不支持 srcset 的环境直接拉大图。 */
export function shotSrc(id: ShotId) {
  const widths = SHOTS[id].widths
  return `${BASE}/${id}-${widths[widths.length - 1]}.webp`
}
