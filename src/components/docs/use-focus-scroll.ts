/**
 * 段落虚焦聚焦。规格 4.4，全站唯一允许的 blur 动画。
 *
 * 判据与 App 的分区状态机同款：取「视口中线落在谁身上」，中线不在任何一段里时
 * 退化为「中心离中线最近」。任何时刻恰好一段实焦，不会两段同时亮。
 *
 * 值写在 DOM 属性上而不是 React state：滚动时每帧 setState 会把整篇长文重渲一遍。
 * 默认（没有 data-focus 属性）是实焦——预渲染出来的静态页没有 JS，
 * 落在虚焦上就等于无 JS 时全文糊掉，那是规格第 6 节明令要保住的场景。
 */
import { useEffect, type RefObject } from 'react'

export function useFocusScroll(root: RefObject<HTMLElement | null>, enabled: boolean, key: string) {
  useEffect(() => {
    const host = root.current
    if (!host || !enabled) return

    const units = [...host.querySelectorAll<HTMLElement>('[data-focus-unit]')]
    if (units.length === 0) return

    let frame = 0
    let last: HTMLElement | null = null

    const pick = () => {
      frame = 0
      const mid = window.innerHeight / 2
      let best: HTMLElement | null = null
      let bestDist = Number.POSITIVE_INFINITY

      for (const unit of units) {
        const r = unit.getBoundingClientRect()
        const dist =
          r.top <= mid && r.bottom >= mid ? 0 : Math.abs((r.top + r.bottom) / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = unit
        }
      }

      if (best === last) return
      last?.setAttribute('data-focus', 'false')
      best?.setAttribute('data-focus', 'true')
      last = best
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }

    for (const unit of units) unit.setAttribute('data-focus', 'false')
    pick()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      for (const unit of units) unit.removeAttribute('data-focus')
    }
  }, [root, enabled, key])
}
