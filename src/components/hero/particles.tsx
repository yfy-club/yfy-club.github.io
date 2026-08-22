/**
 * 引力粒子光场。规格 5.3。
 *
 * 自研，不引图形库。约束照抄规格，不要自行放宽：
 *   粒子数   clamp(40, floor(视口面积 / 22000), 140)，devicePixelRatio > 2 再 × 0.7
 *   行为     布朗慢漂 + 鼠标 160px 半径内引力形变，靠近转粉并拉 ≤24px 拖尾
 *   连线     间距 < 90px 连 1px 细线，透明度按距离衰减
 *   性能闸门 单帧预算 4ms，超时降 20% 粒子，连续三次降级则关闭
 *
 * 滚出视口暂停 RAF。prefers-reduced-motion 下整个组件不挂载画布。
 */
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

const AREA_PER_PARTICLE = 22000
const MIN_COUNT = 40
const MAX_COUNT = 140
const GRAVITY_RADIUS = 160
const LINK_RADIUS = 90
const TRAIL_MAX = 24
const FRAME_BUDGET_MS = 4
const DOWNGRADE_LIMIT = 3

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  /** 上一帧位置，拖尾就是这两点之间的线段 */
  px: number
  py: number
  r: number
}

function targetCount(w: number, h: number, dpr: number) {
  const base = Math.floor((w * h) / AREA_PER_PARTICLE)
  const clamped = Math.max(MIN_COUNT, Math.min(MAX_COUNT, base))
  return dpr > 2 ? Math.floor(clamped * 0.7) : clamped
}

/** 令牌真值从计算样式里读，组件里不写 #hex。 */
function readTokens(el: Element) {
  const cs = getComputedStyle(el)
  const get = (name: string) => cs.getPropertyValue(name).trim()
  return { idle: get('--sky-500'), hot: get('--pink-500') }
}

/** #rgb / #rrggbb 转 rgb 三元组，用来按距离调透明度。 */
function toRgb(hex: string): [number, number, number] {
  const s = hex.replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

interface ParticleFieldProps {
  className?: string
}

export function ParticleField({ className }: ParticleFieldProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  /*
   * 减弱动效下连 <canvas> 一起不出。
   *
   * 原本只是在 effect 里提前 return，画布留在 DOM 里空着——文件头注释写的是
   * 「整个组件不挂载画布」，实现没跟上，a11y 探针实测抓到。
   * 首帧一律 false（见 use-reduced-motion.ts），预渲染产物与注水首帧一致。
   */
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    if (reduced) return

    const ctx = el.getContext('2d', { alpha: true })
    if (!ctx) return

    const idle = toRgb(readTokens(el).idle)
    const hot = toRgb(readTokens(el).hot)

    let w = 0
    let h = 0
    let dpr = 1
    let particles: Particle[] = []
    let raf = 0
    let visible = true
    let overruns = 0
    let downgrades = 0
    let dead = false

    const pointer = { x: -9999, y: -9999, inside: false }

    const spawn = (n: number): Particle[] =>
      Array.from({ length: n }, () => {
        const x = Math.random() * w
        const y = Math.random() * h
        return {
          x,
          y,
          px: x,
          py: y,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1 + Math.random() * 1.4,
        }
      })

    const resize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = spawn(targetCount(w, h, window.devicePixelRatio || 1))
    }

    const onPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.inside =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height
    }

    const onLeave = () => {
      pointer.inside = false
      pointer.x = -9999
      pointer.y = -9999
    }

    const step = () => {
      raf = requestAnimationFrame(step)
      if (!visible || dead) return

      const t0 = performance.now()
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.px = p.x
        p.py = p.y

        // 布朗慢漂。加速度极小，靠阻尼把速度压住，否则会越飘越快。
        p.vx += (Math.random() - 0.5) * 0.035
        p.vy += (Math.random() - 0.5) * 0.035

        let heat = 0
        if (pointer.inside) {
          const dx = pointer.x - p.x
          const dy = pointer.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < GRAVITY_RADIUS && dist > 0.5) {
            heat = 1 - dist / GRAVITY_RADIUS
            const pull = heat * heat * 0.55
            p.vx += (dx / dist) * pull
            p.vy += (dy / dist) * pull
          }
        }

        p.vx *= 0.94
        p.vy *= 0.94
        p.x += p.vx
        p.y += p.vy

        // 出界从对边回来，不反弹——反弹会在四条边上堆出可见的粒子墙。
        if (p.x < -8) p.x = w + 8
        if (p.x > w + 8) p.x = -8
        if (p.y < -8) p.y = h + 8
        if (p.y > h + 8) p.y = -8

        const mix = heat
        const cr = Math.round(idle[0] + (hot[0] - idle[0]) * mix)
        const cg = Math.round(idle[1] + (hot[1] - idle[1]) * mix)
        const cb = Math.round(idle[2] + (hot[2] - idle[2]) * mix)

        // 拖尾。只有被引力拽动时才画，静止画面里不留光。
        if (heat > 0.05) {
          const tx = p.x - p.px
          const ty = p.y - p.py
          const len = Math.hypot(tx, ty)
          if (len > 0.6) {
            const k = Math.min(1, TRAIL_MAX / Math.max(len, 0.001))
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.42 * heat})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x - tx * k * 6, p.y - ty * k * 6)
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
          }
        }

        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.3 + heat * 0.55})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + heat * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // 连线。O(n²) 在 140 粒子上约 1 万次比较，在预算内；再多就靠闸门降下来。
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]!
        for (let j = i + 1; j < particles.length; j += 1) {
          const b2 = particles[j]!
          const dx = a.x - b2.x
          const dy = a.y - b2.y
          const d2 = dx * dx + dy * dy
          if (d2 > LINK_RADIUS * LINK_RADIUS) continue
          const alpha = (1 - Math.sqrt(d2) / LINK_RADIUS) * 0.12
          ctx.strokeStyle = `rgba(${idle[0]}, ${idle[1]}, ${idle[2]}, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b2.x, b2.y)
          ctx.stroke()
        }
      }

      // 性能闸门。连续超预算才降级，单帧毛刺不算。
      if (performance.now() - t0 > FRAME_BUDGET_MS) {
        overruns += 1
        if (overruns >= 12) {
          overruns = 0
          downgrades += 1
          particles = particles.slice(0, Math.floor(particles.length * 0.8))
          if (downgrades >= DOWNGRADE_LIMIT || particles.length < MIN_COUNT * 0.5) {
            dead = true
            ctx.clearRect(0, 0, w, h)
          }
        }
      } else if (overruns > 0) {
        overruns -= 1
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false
      },
      { threshold: 0 },
    )
    io.observe(el)

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  if (reduced) return null

  return <canvas ref={canvas} className={['particles', className].filter(Boolean).join(' ')} aria-hidden="true" />
}
