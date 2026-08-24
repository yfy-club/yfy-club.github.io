/**
 * 惯性滚动。规格 4.4：`lenis` 风格惯性 `lerp 0.09`，
 * **`prefers-reduced-motion` 下必须退化为原生滚动**。
 *
 * lenis 自己也认 reduced-motion（`respectReducedMotion` 默认开），但那只是把 lerp 压成 1，
 * rAF 照跑。这里更直接：reduced 下根本不 new，主线程上一帧都不烧。
 *
 * 首页与 /docs 共用这一份，两处的手感必须完全一致。
 */
import { useEffect } from 'react'
import Lenis from 'lenis'
import { setFramePrelude } from './scroll-frame'

/** 导航条固定高。锚点跳转要留出这个量，与 app.css 的 scroll-margin-top 同值。 */
export const NAV_OFFSET = 63

/**
 * 当前挂着的实例。
 *
 * 换路由时要滚回顶部，而 lenis 在跑的时候 `window.scrollTo` 会被它下一帧拽回去——
 * 必须走它自己的 scrollTo。滚动入口收在这个模块里，别处不要直接碰 window.scrollTo。
 */
let active: Lenis | null = null

export interface SmoothScrollOptions {
  lerp?: number
  wheelMultiplier?: number
}

/**
 * lenis 每帧写进 window 的滚动位置。
 *
 * 这个方法在类型声明里是 private，但它是真实的原型方法，实例上覆盖得掉。
 * 覆盖它是为了在「写进浏览器」这一步做物理像素吸附，见 snapToDevicePixel。
 */
interface ScrollWriter {
  setScroll?: (value: number) => void
}

/**
 * 把滚动位置吸附到整数物理像素。
 *
 * 这是小字发抖（subpixel hinting jitter）的根：lenis 的 lerp 每帧给出
 * 带小数的 CSS 像素位移，浏览器接受小数滚动位置，于是 11px 的 HUD 字与 13px 的
 * 中文能力名每帧都在不同的亚像素相位上被重新栅格化——同一个字形的落笔在相邻两个
 * 物理像素之间来回跳，就是所谓的 shimmering。Windows 的 DirectWrite 带水平次像素
 * 拗颜色，相位一变 RGB 三个子像素的权重一起变，所以在那里看着像彩色边缘在闪。
 *
 * 吸附到 1/dpr 而不是 1 个 CSS 像素：Windows 上 125% / 150% 缩放时 1 CSS px
 * 不是整数物理像素，按 CSS 像素取整照样留下 0.25px 的相位差。
 *
 * animatedScroll 仍然是浮点，插值该有的阻尼一点不少；被量化的只有最终写入值，
 * 步长最小 1 物理像素——原生滚轮滚动本来也是这个粒度。
 */
function snapToDevicePixel(value: number) {
  const dpr = window.devicePixelRatio || 1
  return Math.round(value * dpr) / dpr
}

export function useSmoothScroll(enabled: boolean, options: SmoothScrollOptions = {}) {
  const { lerp = 0.085, wheelMultiplier = 1 } = options

  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      lerp,
      wheelMultiplier,
      /*
       * 不让 lenis 自己排 rAF。
       *
       * 它的 raf() 要在共用滚动帧的帧头跑（下面的 setFramePrelude）：
       * 先把本帧滚动位置写进浏览器，再轮到导航条、刻度尺、分区判定、
       * 展台视差、立绘惯性。autoRaf 开着的话它自己另排一条，而 React 的 effect
       * 子先父后——订阅者的帧反而比它早，每帧读的都是上一帧的位置。
       */
      autoRaf: false,
      // 站内锚点交给 lenis 接管，否则原生跳转会和惯性打架
      anchors: { offset: -NAV_OFFSET },
    })

    /*
     * 拿不到 setScroll 就不接。
     * 升 lenis 大版本时这个内部方法可能改名，那时首页退回到「有惯性、字会抹6」，
     * 而不是整个页面报错。升版本时要回来看这里。
     */
    const writer = lenis as unknown as ScrollWriter
    if (typeof writer.setScroll === 'function') {
      const write = writer.setScroll.bind(lenis)
      writer.setScroll = (value: number) => write(snapToDevicePixel(value))
    }

    active = lenis

    // 时钟交给共用滚动帧，全页只剩一条 rAF 链
    const offPrelude = setFramePrelude(lenis.raf)

    return () => {
      offPrelude()
      active = null
      lenis.destroy()
    }
  }, [enabled, lerp, wheelMultiplier])
}

export function scrollToTop() {
  if (active) active.scrollTo(0, { immediate: true })
  else window.scrollTo({ top: 0 })
}

/**
 * 带阻尼地回顶。挂件点击走这条。
 *
 * 不能直接用 `window.scrollTo({ behavior: 'smooth' })`：浏览器的平滑滚动与 lenis 的
 * 惯性是两个互不知情的动画，两边每帧各写一次滚动位置，整段回顶路上位置来回抗——
 * 小字在那几百毫秒里抖得最厉害。首页自本次改动起也挂了 lenis，所以这条必须走它。
 */
export function smoothScrollToTop() {
  if (active) active.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function scrollToAnchor(el: HTMLElement) {
  if (active) active.scrollTo(el, { offset: -NAV_OFFSET })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
