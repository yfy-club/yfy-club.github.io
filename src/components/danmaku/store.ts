/**
 * 弹幕状态。规格 5.4。
 *
 * 只存 localStorage，没有后端，也不打算有。界面上必须把这件事写明白，
 * 不许让人以为自己发的东西别人看得见——这是防「假互动」欺骗的硬要求。
 *
 * 排期规则（决定弹幕会不会追尾）：
 *   同一条轨道上所有弹幕共用一个穿屏耗时，也就是同速。同速就永远追不上，
 *   于是「两条会不会撞」只取决于起跑时刻之差，而且这个差是常数、不随时间变。
 *   动画是 infinite 的，周期就是那条轨道的耗时，所以按周期取模比一次即可定论。
 *   四条轨道各占 28–42s 里的一档，横向节奏才不会齐步走。
 */
import { DANMAKU_PRESETS } from '@/data/danmaku'
import { createStore } from '@/lib/store'

/** 轨道数。规格 5.4。 */
export const TRACKS = 4

/** 单条弹幕上限 40 字。规格 5.4。 */
export const MAX_LEN = 40

/**
 * 自己发的最多留几条。
 * 再多轨道就挤成一堵墙，而且 localStorage 不是留言板——旧的先出队。
 */
export const MAX_MINE = 12

/** 四条轨道各自的穿屏耗时，秒。规格 5.4 的 28–42s 区间四等分。 */
const DURATIONS = [28, 32.7, 37.3, 42] as const

/** 同轨两条弹幕的最小起跑间隔，秒。 */
const MIN_GAP = 6

const KEY_ON = 'yfy.danmaku.on'
const KEY_MINE = 'yfy.danmaku.mine'

export interface DanmakuItem {
  id: string
  text: string
  /** 自己发的。样式上要与预置区分：粉色 + Diamond 前标。 */
  own: boolean
  /** 轨道序号，0 起。 */
  track: number
  /** 穿屏耗时，秒。同轨恒等。 */
  duration: number
  /** animation-delay，秒。负值表示挂载时这条已经跑在半路上。 */
  delay: number
  /** 起跑时刻，epoch ms。只给排期算距离用，不参与渲染。 */
  startAt: number
}

export interface DanmakuState {
  on: boolean
  items: readonly DanmakuItem[]
}

export const danmakuStore = createStore<DanmakuState>({ on: false, items: [] })

/* ---------------------------------------------------------------------- */

/**
 * 过滤空白与控制字符，截到 40 字。规格 5.4。
 *
 * 用展开运算符按码点切，不用 slice：`[...s]` 认得代理对，`s.slice` 会把
 * 一个 emoji 拦腰砍成半个字符。
 */
export function sanitize(raw: string) {
  const flat = raw.replace(/\p{C}/gu, ' ').replace(/\s+/gu, ' ').trim()
  return [...flat].slice(0, MAX_LEN).join('')
}

/** 计数也按码点算，跟 sanitize 的截断口径保持一致。 */
export function lengthOf(raw: string) {
  return [...raw].length
}

/* ---------------------------------------------------------------------- */

let seq = 0
const nextId = () => `dm-${(seq += 1)}`

/**
 * 挂载时的整体排布。
 *
 * 相位按「在整份名单里排第几」取，不按「在本轨道里排第几」——后者会让
 * 四条轨道的同序号弹幕同时起跑，屏幕上就出现一列一列的方阵，不像弹幕像段落。
 * 实测过，M6 第一版就是这个毛病。
 *
 * 负 delay 的意思是「这条已经跑了一段」，所以首帧屏幕上就有弹幕，
 * 不用等半分钟才热起来——规格 5.4 要的是「首次进入展示 12 条预置弹幕」。
 */
function layout(entries: readonly { text: string; own: boolean }[]): DanmakuItem[] {
  const count = Math.max(1, entries.length)
  const now = Date.now()

  return entries.map((entry, i) => {
    const track = i % TRACKS
    const duration = DURATIONS[track]!
    const delay = -((i / count) * duration)
    return {
      id: nextId(),
      text: entry.text,
      own: entry.own,
      track,
      duration,
      delay,
      startAt: now + delay * 1000,
    }
  })
}

/**
 * 候选起跑时刻跟这条轨道上已有的弹幕够不够开。
 * 两边都要留够 MIN_GAP：既不能贴在别人屁股后面，也不能插在别人鼻子前面。
 */
function clearOf(starts: readonly number[], candidate: number, durationSec: number) {
  const period = durationSec * 1000
  const gap = MIN_GAP * 1000
  return starts.every((s) => {
    const ahead = (((candidate - s) % period) + period) % period
    return ahead >= gap && period - ahead >= gap
  })
}

/**
 * 新发的一条排到哪。
 *
 * 四条轨道各自往后找第一个不追尾的秒，取其中最早的那个。
 * 一秒的探测粒度足够——MIN_GAP 是 6 秒，差一秒不影响观感。
 * 四条全满（自己发了十几条又都挤在一处）就退回立刻起跑，
 * 宁可让两条叠一下，也不能把人发的东西吞掉。
 */
function schedule(text: string, items: readonly DanmakuItem[]): DanmakuItem {
  const now = Date.now()
  let track = 0
  let startAt = Number.POSITIVE_INFINITY

  for (let t = 0; t < TRACKS; t += 1) {
    const duration = DURATIONS[t]!
    const starts = items.filter((x) => x.track === t).map((x) => x.startAt)
    for (let wait = 0; wait <= Math.ceil(duration); wait += 1) {
      const at = now + wait * 1000
      if (!clearOf(starts, at, duration)) continue
      if (at < startAt) {
        startAt = at
        track = t
      }
      break
    }
  }

  if (!Number.isFinite(startAt)) startAt = now

  return {
    id: nextId(),
    text,
    own: true,
    track,
    duration: DURATIONS[track]!,
    delay: (startAt - now) / 1000,
    startAt,
  }
}

/* ---------------------------------------------------------------------- */

function readMine(): string[] {
  try {
    const raw = localStorage.getItem(KEY_MINE)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .map(sanitize)
      .filter(Boolean)
      .slice(-MAX_MINE)
  } catch {
    // 手改过、存坏了、隐私模式读不到——一律当作没有，不要让一行脏数据崩掉首页
    return []
  }
}

function writeMine(list: readonly string[]) {
  try {
    localStorage.setItem(KEY_MINE, JSON.stringify(list))
  } catch {
    // 配额满或被禁用。发出去的那条这一次仍然会飞，只是下次进来没了
  }
}

function persistOn(on: boolean) {
  try {
    localStorage.setItem(KEY_ON, on ? '1' : '0')
  } catch {
    // 记不住就记不住，本次会话照常工作
  }
}

let ready = false

/** 从 localStorage 恢复。导航条的开关挂载时调一次，重复调用无副作用。 */
export function initDanmaku() {
  if (ready) return
  ready = true

  const mine = readMine()
  const items = layout([
    ...DANMAKU_PRESETS.map((p) => ({ text: p.text, own: false })),
    ...mine.map((text) => ({ text, own: true })),
  ])

  let on = false
  try {
    on = localStorage.getItem(KEY_ON) === '1'
  } catch {
    on = false
  }

  danmakuStore.set({ on, items })
}

export function setDanmakuOn(on: boolean) {
  persistOn(on)
  danmakuStore.set({ ...danmakuStore.get(), on })
}

/**
 * 发一条。返回落库后的正文，空串表示这条被过滤光了、什么也没发生。
 * 只写 localStorage，没有任何网络请求。
 */
export function sendDanmaku(raw: string) {
  const text = sanitize(raw)
  if (!text) return ''

  const state = danmakuStore.get()
  const items = [...state.items, schedule(text, state.items)]

  // 超量时把自己最早那条挤出去，预置的不动——它们是底噪，不是留言
  const mine = items.filter((x) => x.own)
  const dropped =
    mine.length > MAX_MINE
      ? new Set(mine.slice(0, mine.length - MAX_MINE).map((x) => x.id))
      : null

  const kept = dropped ? items.filter((x) => !dropped.has(x.id)) : items
  danmakuStore.set({ on: true, items: kept })
  persistOn(true)
  writeMine(kept.filter((x) => x.own).map((x) => x.text))

  return text
}
