/**
 * 元素当前是否在视口里。持续跟踪，不是「进过一次」。
 *
 * 与 use-in-view.ts 的区别就在这一点：那个是给区块入场动画用的，进过一次就断开观察，
 * 反复进出时不重播。这个是给「离屏就停下来」用的，必须一直报。
 *
 * 用途见 mascot.tsx：立绘的 halo 自转、节点呼吸、波纹是 SVG 内部的 transform 与
 * stroke 动画，不可合成，每帧都要重绘。六张立绘里同时只有一两张看得见，
 * 离屏的那几张的重绘是纯浪费，而它恰好落在滚动帧上。
 *
 * rootMargin 给 20%：卡片刚要进画时动画已经在跑，不会看到「突然开始转」。
 */
import { useEffect, useState } from 'react'

export function useOnScreen(ref: React.RefObject<Element | null>) {
  /*
   * 首帧一律 true。预渲染产物是同一份 HTML 发给所有人，服务端不知道谁在视口里；
   * 首帧就分叉必然注水错位。挂载后 IO 立刻回调纠正。
   */
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? true
        setOnScreen((prev) => (prev === next ? prev : next))
      },
      { rootMargin: '20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  return onScreen
}
