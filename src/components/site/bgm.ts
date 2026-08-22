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

const KEY_ON = 'yfy.audio.on'

/** 默认音量。规格 5.5。 */
const VOLUME = 0.35

/** 淡入淡出时长，毫秒。规格 5.5。 */
const FADE_MS = 1200

export interface BgmState {
  /** 探测到的可播放地址。null 表示没有文件，开关不出现。 */
  src: string | null
  on: boolean
}

export const bgmStore = createStore<BgmState>({ src: null, on: false })

/* ---------------------------------------------------------------------- */

let audio: HTMLAudioElement | null = null
let fadeFrame = 0

function ensureAudio(src: string) {
  if (audio) return audio

  const el = new Audio()
  el.src = src
  el.loop = true
  // 规格 5.5：首次开启才发起下载
  el.preload = 'none'
  el.volume = 0

  /*
   * 页面隐藏就暂停。切到别的标签页还在放歌是最招人烦的一种自作主张。
   * 监听器跟播放器同寿命，不解绑。
   */
  document.addEventListener('visibilitychange', () => {
    if (!audio) return
    if (document.hidden) audio.pause()
    else if (bgmStore.get().on) void audio.play().catch(() => stopSilently())
  })

  audio = el
  return el
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

/** 播放被拒时把界面拨回静音态。开关写着「开」而其实没声音，是在骗人。 */
function stopSilently() {
  const { src } = bgmStore.get()
  bgmStore.set({ src, on: false })
  persistOn(false)
}

export function setBgmOn(on: boolean) {
  const { src } = bgmStore.get()
  if (!src) return

  if (!on) {
    persistOn(false)
    bgmStore.set({ src, on: false })
    fadeTo(0, () => audio?.pause())
    return
  }

  const el = ensureAudio(src)
  void el
    .play()
    .then(() => {
      persistOn(true)
      bgmStore.set({ src, on: true })
      fadeTo(VOLUME)
    })
    .catch(stopSilently)
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
  if (!path) return
  bgmStore.set({ src: `${import.meta.env.BASE_URL}${path}`, on: false })

  // 记住的选择在这里恢复。自动播放被浏览器拒了会由 setBgmOn 自己退回静音
  let wanted = false
  try {
    wanted = localStorage.getItem(KEY_ON) === '1'
  } catch {
    wanted = false
  }
  if (wanted) setBgmOn(true)
}
