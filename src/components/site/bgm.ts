/**
 * 背景音乐。规格 5.5。
 *
 * 本工程不自带任何第三方音频文件。放不放由你决定，路径固定：
 *   public/audio/bgm.ogg（主）  public/audio/bgm.mp3（老 Safari 兜底）
 * 两个都不在时，导航条上的声音开关自动消失——不报错，也不留死按钮。
 * 音源渠道与转码命令见 docs/music-sources.md。
 *
 * 「在不在」是构建期扫出来的（vite.config.ts 的 __BGM_SOURCES__），不在运行时探。
 * 运行时探要发 HEAD，文件不在时每位访客的控制台里都会留一条 404——那就是「报错」了。
 *
 * 播放器活在模块级而不是组件里：换路由时 Nav 整棵树重挂，
 * 挂在组件上的 <audio> 会被一起销毁，歌就断了。
 */
import { createStore } from '@/lib/store'
import { getSharedAudioContext, isAudioRunning, onAudioUnlocked } from '@/lib/sound'
import { bgmSynth } from '@/lib/bgm-synth'

const KEY_ON = 'yfy.audio.on'

/** 默认音量。规格 5.5。 */
const VOLUME = 0.35

/** 淡入淡出时长，毫秒。规格 5.5。 */
const FADE_MS = 1200

export interface BgmState {
  /** 探测到的可播放地址。null 表示没有文件，开关不出现。 */
  src: string | null
  on: boolean
  /**
   * 意愿已开启但浏览器还没放行，此刻一声也没有。
   *
   * 开关得把这个状态画出来（M9）：之前 aria-pressed 一上来就是 true、
   * 图标在跳波形，而实际上静音——这是在骗人，用户于是去戳立绘试运气。
   */
  pending: boolean
}

export const bgmStore = createStore<BgmState>({ src: null, on: true, pending: false })

/* ---------------------------------------------------------------------- */

let audio: HTMLAudioElement | null = null
let fadeFrame = 0
let offUnlock: (() => void) | null = null
let visibilityBound = false

/**
 * 等音频真正可用时自动接着播。
 *
 * 手势监听只在 lib/sound.ts 里有一份（M9）。这里曾经另挂了一套并且首次手势就
 * 把自己摘掉，两份监听抢同一次手势；而 resume() 在移动端首次手势时往往还没真的
 * 把 state 推到 running——钩子却已经没了，BGM 于是永远在等一个不会再来的回调。
 */
function waitForUnlock() {
  if (offUnlock) return
  offUnlock = onAudioUnlocked(() => {
    offUnlock = null
    if (!bgmStore.get().on) return
    setBgmOn(true)
  })
}

function ensureAudio(src: string) {
  if (audio) return audio

  const el = new Audio()
  el.src = src
  el.loop = true
  // 规格 5.5：首次开启才发起下载
  el.preload = 'none'
  el.volume = 0

  audio = el
  return el
}

/**
 * 页面隐藏就暂停。切到别的标签页还在放歌是最招人烦的一种自作主张。
 *
 * 挂在模块初始化而不是 ensureAudio 里（M9）：ensureAudio 只在有静态音频文件时才跑，
 * 而现在默认路径是 synth，以前这段逻辑在合成引擎上永远不生效。
 */
function bindVisibility() {
  if (visibilityBound || typeof document === 'undefined') return
  visibilityBound = true

  document.addEventListener('visibilitychange', () => {
    const state = bgmStore.get()
    if (state.src === 'synth') {
      if (document.hidden) bgmSynth.pause()
      else if (state.on) bgmSynth.resume(VOLUME)
      return
    }
    if (!audio) return
    if (document.hidden) audio.pause()
    else if (state.on) void audio.play().catch(() => waitForUnlock())
  })
}

/** 线性淡入淡出。不用 CSS，音量不是样式。 */
function fadeTo(target: number, done?: () => void) {
  const el = audio
  if (!el) return

  cancelAnimationFrame(fadeFrame)
  const from = el.volume
  const start = performance.now()

  const step = (now: number) => {
    if (!audio) return
    const k = Math.min(1, (now - start) / FADE_MS)
    audio.volume = from + (target - from) * k
    if (k < 1) fadeFrame = requestAnimationFrame(step)
    else done?.()
  }

  fadeFrame = requestAnimationFrame(step)
}

function persistOn(on: boolean) {
  try {
    localStorage.setItem(KEY_ON, on ? '1' : '0')
  } catch {
    // 记不住就记不住，本次会话照常工作
  }
}

/** 播放被浏览器策略拦截时等待首次交互唤醒 */
function onPlayBlocked() {
  waitForUnlock()
}

export function setBgmOn(on: boolean) {
  const { src } = bgmStore.get()
  if (!src) return

  if (!on) {
    persistOn(false)
    bgmStore.set({ src, on: false, pending: false })
    // 关掉就不该再等解锁，否则下一次点屏会自己唱起来
    if (offUnlock) {
      offUnlock()
      offUnlock = null
    }
    if (src === 'synth') {
      bgmSynth.stop()
      return
    }
    fadeTo(0, () => audio?.pause())
    return
  }

  /*
   * 开启路径。store 先置 on，开关立即反馈；
   * 能不能真的出声交给 sound.ts 的解锁机制，它会在 running 那一刻回来叫我们。
   * pending 把「意愿已开、但还没声」画出来，否则开关在骗人。
   */
  persistOn(true)
  const unlocked = isAudioRunning()
  bgmStore.set({ src, on: true, pending: !unlocked })
  if (!unlocked) markPendingUntilUnlocked()

  if (src === 'synth') {
    // 建 Context + 挂全局手势钩（幂等）。
    // 引擎 start() 内部自己会等 running 后才建图，这里不要再叠一道等待。
    getSharedAudioContext()
    bgmSynth.start(VOLUME).catch(onPlayBlocked)
    return
  }

  const el = ensureAudio(src)
  void el
    .play()
    .then(() => {
      fadeTo(VOLUME)
    })
    .catch(onPlayBlocked)
}

/** 解锁那一刻把 pending 摘掉，开关从「待开启」切成「正在放」。 */
function markPendingUntilUnlocked() {
  onAudioUnlocked(() => {
    const s = bgmStore.get()
    if (s.pending) bgmStore.set({ ...s, pending: false })
  })
}

/* ---------------------------------------------------------------------- */

/**
 * 挑一个这个浏览器放得动的。ogg 排前面（Opus 体积最小），mp3 是老 Safari 的兜底。
 * canPlayType 回空串表示明确放不了，回 'maybe' / 'probably' 都算能放。
 */
function pick(): string | null {
  const probe = document.createElement('audio')
  for (const path of __BGM_SOURCES__) {
    const type = path.endsWith('.ogg') ? 'audio/ogg; codecs=opus' : 'audio/mpeg'
    if (probe.canPlayType(type)) return path
  }
  // 一个都说不行还是把第一个交出去：canPlayType 出了名的保守，宁可试一次
  return __BGM_SOURCES__[0] ?? null
}

let ready = false

/** 导航条挂载时调一次，重复调用无副作用。 */
export function initBgm() {
  if (ready) return
  ready = true

  const path = pick()
  // 如果有静态音频文件优先使用文件；若没有则启用实时代码合成引擎
  const targetSrc = path ? `${import.meta.env.BASE_URL}${path}` : 'synth'

  // 默认开启：未明确设置为 '0' 时默认开启
  let wanted = true
  try {
    const saved = localStorage.getItem(KEY_ON)
    wanted = saved !== '0'
  } catch {
    wanted = true
  }
  bgmStore.set({ src: targetSrc, on: wanted, pending: false })
  // 建 Context 并挂上全局手势解锁钩子（幂等）
  getSharedAudioContext()
  bindVisibility()
  if (wanted) setBgmOn(true)
}
