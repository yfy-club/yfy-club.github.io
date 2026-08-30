/**
 * Web Audio 极简科幻微音效引擎。
 *
 * 纯代码内存合成，零网络请求、零外部音频资源依赖。
 * 遵循 Web Audio API 规范，在用户首次手势交互后按需初始化 AudioContext。
 *
 * 解锁只有这一处实现（M9 修正）。此前 bgm.ts 另有一份手势监听，两份各自
 * 「首次手势即摘钩」，谁先跑谁把钩子摘掉——而移动端第一次手势往往只是滑动，
 * resume() 是异步的且可能压根没把 state 推到 running，钩子却已经没了，
 * 于是只剩「戳立绘」这一条还会现场新建振荡器的路径能出声。
 *
 * 现在的规矩：钩子一直挂着，每次手势都重试，只有 state 真的变成 running 才摘。
 */

let ctx: AudioContext | null = null
let autoUnlockBound = false

/** 等 AudioContext 真正 running 才执行的回调。解锁成功后一次性清空。 */
const unlockWaiters = new Set<() => void>()

/** 已经广播过一次解锁事件。只用于防重复 dispatch。 */
let unlockedOnce = false

/**
 * 手势事件清单。
 *
 * scroll 也算：移动端第一次交互多半是滑动，touchstart 之后才是 touchmove/scroll，
 * 但 iOS 上被 lenis 接管的容器里 touchstart 有可能被吞，多留一道保险不花钱。
 */
const UNLOCK_EVENTS = [
  'pointerdown',
  'pointerup',
  'touchstart',
  'touchend',
  'mousedown',
  'click',
  'keydown',
  'wheel',
  'scroll',
] as const

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    /*
     * 用 addEventListener 而不是 onstatechange：后者是单槽位属性，
     * 谁后写谁把前一个覆盖掉（bgm-synth 曾经就这么把这里的监听吃掉过）。
     */
    ctx.addEventListener('statechange', () => {
      if (ctx?.state === 'running') settleUnlocked()
    })
  }
  bindAutoUnlock()
  if (ctx.state !== 'running') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

/** Context 是否真的在出声。suspended / interrupted / closed 都算没在。 */
export function isAudioRunning(): boolean {
  return ctx?.state === 'running'
}

/**
 * 订阅「音频真正可用」这一刻。
 *
 * 已经可用就同步立刻执行；否则等第一次成功解锁。返回退订函数。
 */
export function onAudioUnlocked(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  getSharedAudioContext()
  if (isAudioRunning()) {
    fn()
    return () => {}
  }
  unlockWaiters.add(fn)
  return () => {
    unlockWaiters.delete(fn)
  }
}

/**
 * 全局监听任意手势，反复尝试唤醒 AudioContext。
 *
 * 钩子一直挂着不摘（M9）：iOS 上接一通电话、切一次后台都会把 state 推到 interrupted，
 * 「首次手势就摘钩」的写法在那之后就再也救不回来了。
 * 监听器全部 passive + 捕获阶段，已 running 时第一行就返回，开销可忽略。
 */
function bindAutoUnlock() {
  if (autoUnlockBound || typeof window === 'undefined') return
  autoUnlockBound = true

  UNLOCK_EVENTS.forEach((ev) => {
    window.addEventListener(ev, tryUnlock, { capture: true, passive: true })
  })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', tryUnlock)
}

function onVisibility() {
  // iOS 切回前台后 state 可能是 interrupted，需要再踢一次
  if (!document.hidden) tryUnlock()
}

function tryUnlock() {
  const ac = ctx
  if (!ac) return
  if (ac.state === 'running') {
    settleUnlocked()
    return
  }

  /*
   * iOS Safari 的老规矩：光调 resume() 不算数，必须在手势的同一个调用栈里
   * 真的 start 一个节点，输出通道才会打开。一帧静音 buffer 是最便宜的敲门砖。
   */
  kickSilentSource(ac)

  ac.resume()
    .then(() => {
      if (ac.state === 'running') settleUnlocked()
    })
    .catch(() => {
      // 这次手势没成，钩子留着，下次再来
    })
}

/** 一帧静音 buffer。只在还没 running 时用，成本可忽略。 */
function kickSilentSource(ac: AudioContext) {
  try {
    const buffer = ac.createBuffer(1, 1, ac.sampleRate)
    const source = ac.createBufferSource()
    source.buffer = buffer
    source.connect(ac.destination)
    source.start(0)
  } catch {
    // 建不出来就算了，resume() 那条路还在
  }
}

/** 确认已经 running：放行所有等待者，并广播一次（且仅一次）事件。 */
function settleUnlocked() {
  if (!isAudioRunning()) return

  if (unlockWaiters.size > 0) {
    const waiters = [...unlockWaiters]
    unlockWaiters.clear()
    for (const fn of waiters) {
      try {
        fn()
      } catch {
        // 一个等待者炸了不该带走其他人
      }
    }
  }

  if (!unlockedOnce) {
    unlockedOnce = true
    window.dispatchEvent(new CustomEvent('yfy-audio-unlocked'))
  }
}

export function getAudioContext(): AudioContext | null {
  return ctx
}

const STORAGE_KEY = 'yfy_sound_enabled'
let soundEnabled = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) !== 'false' : true

export function isSoundEnabled(): boolean {
  return soundEnabled
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent('yfy-sound-change', { detail: enabled }))
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled)
  return soundEnabled
}

/**
 * 15ms 清脆高频电子晶体微音（按钮点击 / 菜单项选择）
 */
export function playClick(): void {
  if (!soundEnabled) return
  const ac = getSharedAudioContext()
  if (!ac) return

  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(1400, now)
  osc.frequency.exponentialRampToValueAtTime(2200, now + 0.015)

  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)

  osc.connect(gain)
  gain.connect(ac.destination)

  osc.start(now)
  osc.stop(now + 0.016)
}

/**
 * 45ms 双音阶高能展开音（卡片展开 3 年路线档案）
 */
export function playExpand(): void {
  if (!soundEnabled) return
  const ac = getSharedAudioContext()
  if (!ac) return

  const now = ac.currentTime
  const osc1 = ac.createOscillator()
  const osc2 = ac.createOscillator()
  const gain = ac.createGain()

  osc1.type = 'triangle'
  osc1.frequency.setValueAtTime(650, now)
  osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.045)

  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(980, now + 0.01)
  osc2.frequency.exponentialRampToValueAtTime(1650, now + 0.045)

  gain.gain.setValueAtTime(0.07, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ac.destination)

  osc1.start(now)
  osc2.start(now + 0.01)
  osc1.stop(now + 0.046)
  osc2.stop(now + 0.046)
}

/**
 * 25ms 阶梯升调晶体音（连击戳立绘时触发，音调随连击数一路清脆上扬）
 */
export function playComboPoke(step = 1): void {
  if (!soundEnabled) return
  const ac = getSharedAudioContext()
  if (!ac) return

  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  // 1击: 530Hz, 2击: 650Hz, 3击: 790Hz, 4击: 960Hz
  const clampedStep = Math.max(1, Math.min(step, 4))
  const startFreq = 420 + clampedStep * 120
  const endFreq = startFreq * 1.48

  osc.type = clampedStep >= 3 ? 'triangle' : 'sine'
  osc.frequency.setValueAtTime(startFreq, now)
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.024)

  gain.gain.setValueAtTime(0.075, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024)

  osc.connect(gain)
  gain.connect(ac.destination)

  osc.start(now)
  osc.stop(now + 0.025)
}

/**
 * 30ms 软萌微水泡音（戳立绘 / 微笑反馈）
 */
export function playPoke(): void {
  playComboPoke(1)
}

/**
 * 60ms 光环能量超频脉冲音（Halo 超频 / 5 连击 DIZZY）
 */
export function playBurst(): void {
  if (!soundEnabled) return
  const ac = getSharedAudioContext()
  if (!ac) return

  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.025)
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06)

  gain.gain.setValueAtTime(0.09, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

  osc.connect(gain)
  gain.connect(ac.destination)

  osc.start(now)
  osc.stop(now + 0.062)
}
