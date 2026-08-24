/**
 * Web Audio 极简科幻微音效引擎。
 *
 * 纯代码内存合成，零网络请求、零外部音频资源依赖。
 * 遵循 Web Audio API 规范，在用户首次手势交互后按需初始化 AudioContext。
 */

let ctx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      ctx = new AudioCtx()
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
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
  const ac = getAudioContext()
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
  const ac = getAudioContext()
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
  const ac = getAudioContext()
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
  const ac = getAudioContext()
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
