import { useCallback, useEffect, useRef, useState } from 'react'
import { playBurst, playComboPoke } from '@/lib/sound'
import type { MascotState } from './states'

/**
 * 差分状态机。规格 3.3 触发表与触控互动阶梯。
 *
 * 优先级从高到低：DIZZY (5连击晕眩) > POUT (3连击鼓脸) > SMILE (单点微笑) > IDLE_DAZE > base。
 * 同一时刻只有一个状态生效，新触发抢占旧状态。
 */

/** SURPRISE 持续 400ms 后回落至 SMILE。 */
const SURPRISE_HOLD = 400

/** DIZZY 持续 1800ms 后回落至 SMILE。 */
const DIZZY_HOLD = 1800

/** 单击触发短暂 SMILE 的持续时长。 */
const SMILE_HOLD = 900

/** 两次有效连击之间的最大允许间隔（450ms）。超过 450ms 未点击则连击彻底归零重新起算。 */
const COMBO_INTERVAL = 450
/** 最小连击防抖门限（60ms），过滤机械微动抖动与误触。 */
const MIN_TAP_INTERVAL = 60
const POUT_COUNT = 3
const DIZZY_COUNT = 5

/** POUT 鼓脸持续时长（1.3 秒轻微生气后自然回正）。 */
const POUT_HOLD = 1300

/** 多久没有鼠标 / 滚动 / 键盘就发呆，以及回神的延迟。 */
const IDLE_AFTER = 20000
const IDLE_RECOVER = 300

export interface MascotBehavior {
  /** 当前生效的状态。驱动整体动作。 */
  state: MascotState
  /** 戳击事件处理。 */
  poke: () => void
}

export function useMascotState(base: MascotState = 'NEUTRAL', enabled = true): MascotBehavior {
  const [pouting, setPouting] = useState(false)
  const [smiling, setSmiling] = useState(false)
  const [dizzy, setDizzy] = useState(false)
  const [dazed, setDazed] = useState(false)
  const [surpriseDone, setSurpriseDone] = useState(false)

  const lastPokeTime = useRef<number>(0)
  const lastSoundTime = useRef<number>(0)
  const comboCount = useRef<number>(0)
  const isDizzyRef = useRef<boolean>(false)
  const pokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const smileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dizzyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---------------------------------------------------- SURPRISE 回落 */

  useEffect(() => {
    setSurpriseDone(false)
    if (base !== 'SURPRISE') return
    const id = setTimeout(() => setSurpriseDone(true), SURPRISE_HOLD)
    return () => clearTimeout(id)
  }, [base])

  /* ------------------------------------------------------------ 20s 发呆 */

  useEffect(() => {
    if (!enabled) {
      setDazed(false)
      return
    }
    let toDaze: ReturnType<typeof setTimeout>
    let toWake: ReturnType<typeof setTimeout>
    let asleep = false
    /** 上一次真的重排定时器的时刻。 */
    let armedAt = 0

    const arm = () => {
      armedAt = performance.now()
      clearTimeout(toDaze)
      toDaze = setTimeout(() => {
        asleep = true
        setDazed(true)
      }, IDLE_AFTER)
    }

    const nudge = () => {
      if (asleep) {
        asleep = false
        clearTimeout(toWake)
        toWake = setTimeout(() => setDazed(false), IDLE_RECOVER)
        arm()
        return
      }
      /*
       * 重排限速。
       *
       * 这个钩子每个立绘实例一份，首页上有六份（Hero + 五张卡 + 挂件）。
       * scroll 与 wheel 在高刷屏上一秒派上百次，原本每次都要 clearTimeout + setTimeout
       * 一轮，乘六份就是滚动期间凭空多出来的定时器流量。
       * 20s 的发呆阈值对 1s 的误差不敏感。
       */
      if (performance.now() - armedAt < 1000) return
      arm()
    }

    const events = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'wheel', 'touchstart'] as const
    for (const type of events) window.addEventListener(type, nudge, { passive: true })
    arm()

    return () => {
      for (const type of events) window.removeEventListener(type, nudge)
      clearTimeout(toDaze)
      clearTimeout(toWake)
      setDazed(false)
    }
  }, [enabled])

  /* -------------------------------------------------------- 点击互动阶梯 */

  const poke = useCallback(() => {
    if (!enabled) return
    const now = performance.now()

    // 1. 防机械抖动与过快连击（< 60ms 过滤）
    if (now - lastPokeTime.current < MIN_TAP_INTERVAL) {
      return
    }

    // 2. 如果当前正处于 DIZZY 阻尼衰减演练中，不打断动画闭环
    if (isDizzyRef.current) {
      if (now - lastSoundTime.current > 80) {
        playComboPoke(1)
        lastSoundTime.current = now
      }
      lastPokeTime.current = now
      return
    }

    // 3. 连击判定：超过 450ms 重新起算
    if (now - lastPokeTime.current > COMBO_INTERVAL) {
      comboCount.current = 1
    } else {
      comboCount.current += 1
    }
    lastPokeTime.current = now

    const count = comboCount.current

    if (count >= DIZZY_COUNT) {
      // 5 连击及以上：触发晕头转向 DIZZY，播放终极暴风超频大音效
      playBurst()
      lastSoundTime.current = now
      comboCount.current = 0
      isDizzyRef.current = true
      setPouting(false)
      setDizzy(true)
      if (dizzyTimer.current) clearTimeout(dizzyTimer.current)
      dizzyTimer.current = setTimeout(() => {
        isDizzyRef.current = false
        setDizzy(false)
        setSmiling(true)
        if (smileTimer.current) clearTimeout(smileTimer.current)
        smileTimer.current = setTimeout(() => setSmiling(false), SMILE_HOLD)
      }, DIZZY_HOLD)
    } else if (count >= POUT_COUNT) {
      // 3 连击：触发短促生气鼓脸 POUT，播放阶梯高音晶体音
      if (now - lastSoundTime.current > 70) {
        playComboPoke(count)
        lastSoundTime.current = now
      }
      setPouting(true)
      if (pokeTimer.current) clearTimeout(pokeTimer.current)
      pokeTimer.current = setTimeout(() => setPouting(false), POUT_HOLD)
    } else {
      // 1 击 / 2 击：触发轻快微笑 SMILE，播放阶梯升调晶体音
      if (now - lastSoundTime.current > 70) {
        playComboPoke(count)
        lastSoundTime.current = now
      }
      setSmiling(true)
      if (smileTimer.current) clearTimeout(smileTimer.current)
      smileTimer.current = setTimeout(() => setSmiling(false), SMILE_HOLD)
    }
  }, [enabled])

  useEffect(
    () => () => {
      if (pokeTimer.current) clearTimeout(pokeTimer.current)
      if (smileTimer.current) clearTimeout(smileTimer.current)
      if (dizzyTimer.current) clearTimeout(dizzyTimer.current)
    },
    [],
  )

  /* ---------------------------------------------------------- 结算 */

  let state: MascotState = base
  if (base === 'SURPRISE' && surpriseDone) state = 'SMILE'
  if (dazed) state = 'IDLE_DAZE'
  if (smiling) state = 'SMILE'
  if (pouting) state = 'POUT'
  if (dizzy) state = 'DIZZY'

  return { state, poke }
}
