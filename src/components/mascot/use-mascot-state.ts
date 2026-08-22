import { useCallback, useEffect, useRef, useState } from 'react'
import type { MascotState } from './states'

/**
 * 差分状态机。规格 3.3 那张触发表就是这个文件。
 *
 * 优先级从高到低：POUT > IDLE_DAZE > SURPRISE 的 400ms 回落 > 外部传进来的 base。
 * 同一时刻只有一个状态生效，新触发抢占旧状态——不做状态叠加，叠加只会互相打架。
 *
 * 滚动进区（FOCUS / SMILE / THINK）与悬停卡片这些由页面决定的触发不在这里，
 * 页面把结论算好从 base 传进来。这个 hook 只管立绘自己知道的事：发呆、被戳。
 *
 * M8：眨眼拆掉了。表情烘在栅格立绘里，眼睛睁闭不再是我们能控制的东西，
 * 而定时器照跑的话方向区五张卡就是五个每 4~7s 空转一次的 setTimeout。
 */

/** SURPRISE 持续 400ms 后回落至 SMILE。 */
const SURPRISE_HOLD = 400

/** 连点几次进 POUT，以及两次点击之间的最长间隔。 */
const POKE_COUNT = 3
const POKE_WINDOW = 900

/** POUT 之后多久没动静就放弃生气。 */
const POUT_HOLD = 5000

/** 多久没有鼠标 / 滚动 / 键盘就发呆，以及回神的延迟。 */
const IDLE_AFTER = 20000
const IDLE_RECOVER = 300

export interface MascotBehavior {
  /** 当前生效的状态。驱动整体动作，不再驱动五官。 */
  state: MascotState
  /** 立绘被点一下就调它。连点三次进 POUT。 */
  poke: () => void
}

export function useMascotState(base: MascotState = 'NEUTRAL', enabled = true): MascotBehavior {
  const [pouting, setPouting] = useState(false)
  const [dazed, setDazed] = useState(false)
  const [surpriseDone, setSurpriseDone] = useState(false)

  const pokes = useRef<number[]>([])
  const pokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    const arm = () => {
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
        // 规格 3.3：任意输入立即 300ms 回到上一状态
        toWake = setTimeout(() => setDazed(false), IDLE_RECOVER)
      }
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

  /* -------------------------------------------------------- 连点鼓脸 */

  const poke = useCallback(() => {
    const now = performance.now()
    pokes.current = [...pokes.current.filter((t) => now - t < POKE_WINDOW), now]
    if (pokes.current.length < POKE_COUNT) return

    pokes.current = []
    setPouting(true)
    if (pokeTimer.current) clearTimeout(pokeTimer.current)
    pokeTimer.current = setTimeout(() => setPouting(false), POUT_HOLD)
  }, [])

  useEffect(
    () => () => {
      if (pokeTimer.current) clearTimeout(pokeTimer.current)
    },
    [],
  )

  /* ---------------------------------------------------------- 结算 */

  let state: MascotState = base
  if (base === 'SURPRISE' && surpriseDone) state = 'SMILE'
  if (dazed) state = 'IDLE_DAZE'
  if (pouting) state = 'POUT'

  return { state, poke }
}
