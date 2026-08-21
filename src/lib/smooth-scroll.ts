/**
 * 惯性滚动。规格 4.4：`lenis` 风格惯性 `lerp 0.09`，
 * **`prefers-reduced-motion` 下必须退化为原生滚动**。
 *
 * lenis 自己也认 reduced-motion（`respectReducedMotion` 默认开），但那只是把 lerp 压成 1，
 * rAF 照跑。这里更直接：reduced 下根本不 new，主线程上一帧都不烧。
 *
 * 只在 /docs 挂。首页的 Hero 视差、粒子、立绘惯性都是按原生滚动调的，
 * 再叠一层阻尼会让首屏发飘。
 */
import { useEffect } from 'react'
import Lenis from 'lenis'

/** 导航条固定高。锚点跳转要留出这个量，与 app.css 的 scroll-margin-top 同值。 */
export const NAV_OFFSET = 63

/**
 * 当前挂着的实例。
 *
 * 换路由时要滚回顶部，而 lenis 在跑的时候 `window.scrollTo` 会被它下一帧拽回去——
 * 必须走它自己的 scrollTo。滚动入口收在这个模块里，别处不要直接碰 window.scrollTo。
 */
let active: Lenis | null = null

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      lerp: 0.09,
      autoRaf: true,
      // 站内锚点（目录树里的三级标题）交给 lenis 接管，否则原生跳转会和惯性打架
      anchors: { offset: -NAV_OFFSET },
    })
    active = lenis

    return () => {
      active = null
      lenis.destroy()
    }
  }, [enabled])
}

export function scrollToTop() {
  if (active) active.scrollTo(0, { immediate: true })
  else window.scrollTo({ top: 0 })
}

export function scrollToAnchor(el: HTMLElement) {
  if (active) active.scrollTo(el, { offset: -NAV_OFFSET })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
