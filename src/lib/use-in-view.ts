/**
 * 滚动进入视口。规格 5.2：区块进入视口 15% 时启动。
 *
 * 用 IntersectionObserver，不监听 scroll——后者要在主线程上做布局查询。
 * 只报「进过一次」，不做反复进出：区块动画播完就该留在原位，
 * 来回滚动时反复重播是廉价感的主要来源。
 */
import { useEffect, useRef, useState } from 'react'

/** 规格 5.2 的 15%。 */
const ENTER_RATIO = 0.15

export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (entered) return

    // 视口比区块还矮时 15% 永远凑不满，退化为「露出一点就算进」
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setEntered(true)
            io.disconnect()
          }
        }
      },
      { threshold: ENTER_RATIO, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)

    // 首屏之上的区块在挂载时可能已经在视口里，IO 首帧就会回调，这里不用额外补
    return () => io.disconnect()
  }, [entered])

  return { ref, entered }
}
