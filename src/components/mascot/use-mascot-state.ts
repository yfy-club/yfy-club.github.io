import { useCallback, useEffect, useRef, useState } from 'react'
import type { MascotState } from './expressions'

/**
 * 差分状态机。规格 3.3 那张触发表就是这个文件。
 *
 * 优先级从高到低：POUT > IDLE_DAZE > SURPRISE 的 400ms 回落 > 外部传进来的 base。
 * 同一时刻只有一个状态生效，新触发抢占旧状态——不做状态叠加，叠加只会互相打架。
 *
 * 滚动进区（FOCUS / SMILE / THINK）与悬停卡片这些由页面决定的触发不在这里，
 * 页面把结论算好从 base 传进来。这个 hook 只管立绘自己知道的事：
 * 眨眼、发呆、被戳。
 */

/** 眨眼间隔。规格 3.3 写的 4–7s。 */
const BLINK_MIN = 4000
const BLINK_MAX = 7000

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
  /** 当前生效的状态，直接喂给差分渲染。 */
  state: MascotState
  /** 眨眼是叠加层不是状态：它不走 120ms 交叉淡入，自己 90ms 闭 60ms 张。 */
  blinking: boolean
  /** 立绘被点一下就调它。连点三次进 POUT。 */
  poke: () => void
}

export function useMascotState(base: MascotState = 'NEUTRAL', enabled = true): MascotBehavior {
  const [blinking, setBlinking] = useState(false)
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

  /* ------------------------------------------------------------ 眨眼 */

  useEffect(() => {
    if (!enabled) {
      setBlinking(false)
      return
    }
    let close: ReturnType<typeof setTimeout>
    let open: ReturnType<typeof setTimeout>

    const schedule = () => {
      close = setTimeout(
        () => {
          setBlinking(true)
          // 90ms 闭合走 CSS，这里只负责多留 40ms 再张开，免得看起来像抽搐
          open = setTimeout(() => {
            setBlinking(false)
            schedule()
          }, 130)
        },
        BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN),
      )
    }
    schedule()

    return () => {
      clearTimeout(close)
      clearTimeout(open)
      setBlinking(false)
    }
  }, [enabled])

  /* ------------------------------------------------------ 20s 发呆 */

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

  return { state, blinking: blinking && !dazed && !pouting, poke }
}
