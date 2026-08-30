import { getSharedAudioContext, isAudioRunning, onAudioUnlocked } from './sound'
/**
 * Web Audio 极简 C418 (Sweden) 纯音乐合成引擎
 *
 * 设计理念（极简克制，去除一切杂音与频繁转调）：
 * 1. 唯一主调：固定在 D 大调（C418 最经典的《Sweden》调性）
 * 2. 只有两层干净纯粹的声音：
 *    - 暖声底垫 (Dmaj7 -> Gmaj7 -> Bm7 -> Gmaj7)，超慢速 16 秒一换，音量极轻
 *    - 干净的毛毡立式钢琴 Solo (F#4 -> A4 -> D5 -> C#5...)，自带大量宁静留白
 * 3. 零噪音层、零风声、零杂乱调制，背景极其干净通透。
 */

interface Chord {
  root: number
  pad: number[]
}

interface Note {
  f: number // 频率
  d: number // 间隔/持续 (秒)
}

// 固定 D 大调经典 4 和弦（Dmaj7 -> Gmaj7 -> Bm7 -> Gmaj7，每 16 秒一换）
const CHORDS: Chord[] = [
  { root: 73.42, pad: [185.0, 220.0, 277.18] }, // D: F#3, A3, C#4
  { root: 49.0, pad: [196.0, 246.94, 293.66] }, // G: G3, B3, D4
  { root: 61.74, pad: [185.0, 220.0, 293.66] }, // Bm: F#3, A3, D4
  { root: 49.0, pad: [196.0, 246.94, 293.66] }, // G: G3, B3, D4
]

// C418 《Sweden》经典旋律乐句（每段与和弦严格呼应）
const MELODY_SECTIONS: Note[][] = [
  // 第 1 节（在 D 和弦上）：F#4 -> A4 -> D5 -> C#5 (长音静止留白)
  [
    { f: 369.99, d: 1.3 }, // F#4
    { f: 440.0, d: 1.3 }, // A4
    { f: 587.33, d: 1.8 }, // D5
    { f: 554.37, d: 6.0 }, // C#5 (留白 6 秒)
  ],
  // 第 2 节（在 G 和弦上）：F#4 -> A4 -> D5 -> B4
  [
    { f: 369.99, d: 1.3 }, // F#4
    { f: 440.0, d: 1.3 }, // A4
    { f: 587.33, d: 1.8 }, // D5
    { f: 493.88, d: 6.0 }, // B4 (留白 6 秒)
  ],
  // 第 3 节（在 Bm 和弦上）：F#4 -> A4 -> D5 -> C#5 -> A4 -> F#4
  [
    { f: 369.99, d: 1.2 }, // F#4
    { f: 440.0, d: 1.2 }, // A4
    { f: 587.33, d: 1.6 }, // D5
    { f: 554.37, d: 1.4 }, // C#5
    { f: 440.0, d: 1.4 }, // A4
    { f: 369.99, d: 5.0 }, // F#4 (留白 5 秒)
  ],
  // 第 4 节（在 G 和弦上）：D4 -> E4 -> F#4 -> D4 (静谧收尾)
  [
    { f: 293.66, d: 1.3 }, // D4
    { f: 329.63, d: 1.3 }, // E4
    { f: 369.99, d: 1.6 }, // F#4
    { f: 293.66, d: 6.5 }, // D4 (留白 6.5 秒)
  ],
]

const CHORD_DURATION_SEC = 16.0
const FADE_MS = 1500
const DEFAULT_VOLUME = 0.35

class BgmSynthEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private delaySend: GainNode | null = null

  private isRunning = false
  private isPaused = false
  private currentStep = 0
  private loopTimer: number | null = null
  private activeTimers: number[] = []

  /** 等首次解锁的退订函数。用户在解锁前就关了 BGM 时要能取消。 */
  private pendingUnlock: (() => void) | null = null
  /** 待解锁后启动时用的目标音量。 */
  private wantedVolume = DEFAULT_VOLUME
  private stateWatcherBound = false

  // 背景暖垫（平滑淡入淡出）
  private padGain: GainNode | null = null
  private padOscs: OscillatorNode[] = []
  private bassOsc: OscillatorNode | null = null

  private ensureContext(): AudioContext | null {
    this.ctx = getSharedAudioContext()
    return this.ctx
  }

  /** 构建立体声母带与温润空间混响延迟 */
  private setupMaster(ctx: AudioContext) {
    const now = ctx.currentTime

    // 1. 主增益
    this.masterGain = ctx.createGain()
    this.masterGain.gain.setValueAtTime(0.00001, now)

    // 2. 45Hz 高通滤除杂音
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(45, now)

    this.masterGain.connect(hp)
    hp.connect(ctx.destination)

    // 3. 500ms 纯净立体声空间回响 (Space Delay)
    this.delaySend = ctx.createGain()
    this.delaySend.gain.setValueAtTime(0.24, now)

    const delayL = ctx.createDelay()
    delayL.delayTime.setValueAtTime(0.48, now)
    const delayR = ctx.createDelay()
    delayR.delayTime.setValueAtTime(0.72, now)

    const feedback = ctx.createGain()
    feedback.gain.setValueAtTime(0.28, now)

    const delayFilter = ctx.createBiquadFilter()
    delayFilter.type = 'lowpass'
    delayFilter.frequency.setValueAtTime(1000, now) // 温暖暗色回声

    const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    if (panL) panL.pan.setValueAtTime(-0.35, now)
    const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    if (panR) panR.pan.setValueAtTime(0.35, now)

    this.delaySend.connect(delayL)
    this.delaySend.connect(delayR)

    delayL.connect(delayFilter)
    delayR.connect(delayFilter)
    delayFilter.connect(feedback)
    feedback.connect(delayL)
    feedback.connect(delayR)

    if (panL && panR) {
      delayL.connect(panL)
      delayR.connect(panR)
      panL.connect(this.masterGain)
      panR.connect(this.masterGain)
    } else {
      delayL.connect(this.masterGain)
      delayR.connect(this.masterGain)
    }
  }

  /** 演奏背景和弦（极简、极轻 0.015，只作温润打底） */
  private playPadChord(chord: Chord) {
    const ctx = this.ctx
    if (!ctx || !this.isRunning) return
    // Context 被挂起时 currentTime 是冻结的，此时排包络等于把声音扔进黑洞
    if (ctx.state !== 'running') return
    const now = ctx.currentTime

    // 停止上一组和弦振荡器
    if (this.padGain) {
      this.padGain.gain.cancelScheduledValues(now)
      this.padGain.gain.setValueAtTime(this.padGain.gain.value, now)
      this.padGain.gain.linearRampToValueAtTime(0.00001, now + 3.0)
    }
    const prevOscs = this.padOscs
    const cleanup = window.setTimeout(() => {
      prevOscs.forEach((o) => {
        try {
          o.stop()
          o.disconnect()
        } catch {}
      })
    }, 3200)
    this.activeTimers.push(cleanup)

    // 创建新和弦组
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.00001, now)
    gain.gain.linearRampToValueAtTime(0.016, now + 2.5) // 极轻柔打底

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(320, now) // 320Hz 极暖低通，不抢钢琴

    gain.connect(lp)
    if (this.masterGain) lp.connect(this.masterGain)

    const newOscs: OscillatorNode[] = []
    chord.pad.forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.connect(gain)
      osc.start(now)
      newOscs.push(osc)
    })

    // 次低音微弱垫底 (49Hz ~ 73Hz)
    if (!this.bassOsc) {
      this.bassOsc = ctx.createOscillator()
      this.bassOsc.type = 'sine'
      const bassGain = ctx.createGain()
      bassGain.gain.setValueAtTime(0.012, now)
      this.bassOsc.connect(bassGain)
      if (this.masterGain) bassGain.connect(this.masterGain)
      this.bassOsc.start(now)
    }
    this.bassOsc.frequency.exponentialRampToValueAtTime(chord.root, now + 2.0)

    this.padGain = gain
    this.padOscs = newOscs
  }

  /** 演奏单颗纯净毛毡钢琴音符 (Felt Piano Note) */
  private playPianoNote(freq: number, duration: number) {
    const ctx = this.ctx
    if (!ctx || !this.isRunning || this.isPaused) return
    if (ctx.state !== 'running') return
    const now = ctx.currentTime

    // 1. 音符增益
    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0.00001, now)
    noteGain.gain.linearRampToValueAtTime(0.055, now + 0.008) // 8ms 柔和毛毡击弦
    noteGain.gain.exponentialRampToValueAtTime(0.00001, now + Math.max(0.2, duration * 1.3))

    // 2. 钢琴低通滤波 (1100Hz 温暖圆润，不刺耳)
    const pianoFilter = ctx.createBiquadFilter()
    pianoFilter.type = 'lowpass'
    pianoFilter.frequency.setValueAtTime(1100, now)

    // 基音 (1x)
    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(freq, now)

    // 柔和 2 次谐波 (2x, 快速衰减)
    const osc2 = ctx.createOscillator()
    const osc2Gain = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2, now)
    osc2Gain.gain.setValueAtTime(0.3, now)
    osc2Gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.6)
    osc2.connect(osc2Gain)

    osc1.connect(pianoFilter)
    osc2Gain.connect(pianoFilter)
    pianoFilter.connect(noteGain)

    // 接入主通道与空间延迟
    if (this.masterGain) noteGain.connect(this.masterGain)
    if (this.delaySend) noteGain.connect(this.delaySend)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + duration * 1.4)
    osc2.stop(now + duration * 1.4)
  }

  /** 演奏一整段 Sweden 旋律并留白 */
  private playMelodySection(notes: Note[]) {
    let accumulatedMs = 0

    notes.forEach((note) => {
      const timer = window.setTimeout(() => {
        if (!this.isRunning || this.isPaused) return
        this.playPianoNote(note.f, note.d)
      }, accumulatedMs)
      this.activeTimers.push(timer)
      accumulatedMs += note.d * 1000
    })
  }

  /** 调度循环：每 16 秒推进一个乐句，极致沉静 */
  private schedule() {
    const next = () => {
      if (!this.isRunning) return

      const chord = CHORDS[this.currentStep % CHORDS.length]
      const melody = MELODY_SECTIONS[this.currentStep % MELODY_SECTIONS.length]

      this.playPadChord(chord)

      // 和弦升起 1.0 秒后，缓缓落下第一颗钢琴键
      const timer = window.setTimeout(() => {
        this.playMelodySection(melody)
      }, 1000)
      this.activeTimers.push(timer)

      this.currentStep++
      this.loopTimer = window.setTimeout(next, CHORD_DURATION_SEC * 1000)
    }

    next()
  }

  /**
   * 启动。
   *
   * 关键约束（M9）：必须等 AudioContext 真的 running 了再建图、再排调度。
   * suspended 时 ctx.currentTime 是冻住的，但 setTimeout 照跑——之前的实现在锁着的
   * Context 上把前 16 秒的和弦与整段旋律全部排在同一个时间点上，
   * 等手势真的解锁时这些包络已经全部“跑完”了，于是一片寂静；
   * 而戳立绘的音效是当场新建振荡器，所以只有它能响。
   * 这就是“必须先戳立绘才发声”的真正成因。
   */
  public start(targetVolume = DEFAULT_VOLUME): Promise<void> {
    const ctx = this.ensureContext()
    if (!ctx) return Promise.reject(new Error('No Web Audio Support'))

    this.wantedVolume = targetVolume
    this.bindStateWatcher(ctx)

    // 已经在跑：对齐音量，需要时拉回暂停态
    if (this.isRunning) {
      if (this.masterGain && isAudioRunning()) {
        const now = ctx.currentTime
        this.masterGain.gain.cancelScheduledValues(now)
        this.masterGain.gain.setValueAtTime(Math.max(0.00001, this.masterGain.gain.value), now)
        this.masterGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5)
      }
      if (this.isPaused) this.resume(targetVolume)
      return Promise.resolve()
    }

    // 还没解锁：一行图都不建，只挂一个等待者，解锁那一刻再真开始
    if (!isAudioRunning()) {
      if (!this.pendingUnlock) {
        this.pendingUnlock = onAudioUnlocked(() => {
          this.pendingUnlock = null
          this.launch(this.wantedVolume)
        })
      }
      return Promise.resolve()
    }

    this.launch(targetVolume)
    return Promise.resolve()
  }

  /** 真正建图与开跑。只在 Context 已 running 时进入。 */
  private launch(targetVolume: number) {
    const ctx = this.ensureContext()
    if (!ctx || this.isRunning) return

    this.isRunning = true
    this.isPaused = false
    this.currentStep = 0

    this.setupMaster(ctx)

    if (this.masterGain) {
      const now = ctx.currentTime
      this.masterGain.gain.cancelScheduledValues(now)
      this.masterGain.gain.setValueAtTime(0.00001, now)
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, now + FADE_MS / 1000)
    }

    this.schedule()
  }

  /**
   * 监听 Context 状态。
   *
   * 用 addEventListener 而不是 onstatechange：后者是单槽位，sound.ts 里也要听同一个事件，
   * 赋值会把对方直接覆盖掉。iOS 接电话后 state 会变 interrupted，回来需要自愈。
   */
  private bindStateWatcher(ctx: AudioContext) {
    if (this.stateWatcherBound) return
    this.stateWatcherBound = true
    ctx.addEventListener('statechange', () => {
      if (ctx.state !== 'running') return
      if (!this.isRunning) return
      if (!this.isPaused) this.resume(this.wantedVolume)
      // 挂起期间被丢掉的和弦不会自己回来，重新起一轮调度而不是等下一个 16 秒
      if (this.padOscs.length === 0) this.restartSchedule()
    })
  }

  /** 清掉待执行定时器，从当前乐句重新起一轮。 */
  private restartSchedule() {
    if (this.loopTimer) clearTimeout(this.loopTimer)
    this.activeTimers.forEach((t) => clearTimeout(t))
    this.activeTimers = []
    this.schedule()
  }

  public stop(): void {
    // 还在等解锁就被关掉：取消等待，别在用户下一次点屏时突然响起来
    if (this.pendingUnlock) {
      this.pendingUnlock()
      this.pendingUnlock = null
    }
    if (!this.isRunning) return
    this.isRunning = false
    this.isPaused = false

    if (this.loopTimer) clearTimeout(this.loopTimer)
    this.activeTimers.forEach((t) => clearTimeout(t))
    this.activeTimers = []

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime
      this.masterGain.gain.cancelScheduledValues(now)
      this.masterGain.gain.setValueAtTime(Math.max(0.00001, this.masterGain.gain.value), now)
      this.masterGain.gain.exponentialRampToValueAtTime(0.00001, now + FADE_MS / 1000)
    }

    setTimeout(() => {
      this.cleanup()
    }, FADE_MS + 200)
  }

  public pause(): void {
    if (!this.isRunning || this.isPaused) return
    this.isPaused = true
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime
      this.masterGain.gain.cancelScheduledValues(now)
      this.masterGain.gain.linearRampToValueAtTime(0.00001, now + 0.3)
    }
  }

  public resume(targetVolume = DEFAULT_VOLUME): void {
    if (!this.isRunning) return
    this.wantedVolume = targetVolume
    this.isPaused = false
    if (this.ctx && this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {})
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime
      this.masterGain.gain.cancelScheduledValues(now)
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5)
    }
  }

  private cleanup(): void {
    // stop() 后 1.7s 才跑到这里；这期间用户可能已经又把 BGM 开回来了，
    // 那就不能再拆新建的那张图
    if (this.isRunning) return
    try {
      this.bassOsc?.stop()
      this.bassOsc?.disconnect()
      this.padOscs.forEach((o) => {
        try {
          o.stop()
          o.disconnect()
        } catch {}
      })
      this.masterGain?.disconnect()
      this.delaySend?.disconnect()
    } catch {}
    this.padOscs = []
    this.bassOsc = null
    this.padGain = null
    // 下一次 launch() 重建一张干净的图，别拿旧节点接着用
    this.masterGain = null
    this.delaySend = null
  }
}

export const bgmSynth = new BgmSynthEngine()
