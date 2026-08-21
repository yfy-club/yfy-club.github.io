import { useEffect, useRef } from 'react'
import { MASCOT, MASCOT_MAX_OFFSET } from '@/lib/motion-tokens'

/**
 * 立绘惯性。发丝、领巾、halo、身体跟着鼠标与滚动甩，各自一套弹簧。
 *
 * 数值不在这里拍，全部来自 src/lib/motion-tokens.ts（规格 3.5）。
 * 这里只负责三件事：把输入归一化、积分弹簧、把结果写成 CSS 变量。
 *
 * 为什么不用 motion 的 useSpring：那会让每帧都过 React。
 * 首屏一个看板娘、方向区五个，加起来 36 条弹簧 60fps 重渲染整棵 SVG，不划算。
 * 这里全站共用一个 RAF，直接写 style property，React 全程不参与。
 */

/**
 * 输入归一化的参照幅度，单位是 viewBox 用户单位。
 *
 * 鼠标从画面中心移到屏幕边缘算满程 1.0，乘这个数得到"鼠标位移"，
 * 再乘规格 3.5 的增益就是各部件的目标位移：
 *   呆毛 0.16 × 90 = 14.4  → 撞上 ±14 的 clamp（规格就是让它撞）
 *   后发 0.10 × 90 = 9.0
 *   前发 0.07 × 90 = 6.3
 *   领巾 0.12 × 90 = 10.8
 *   halo 0.05 × 90 = 4.5
 *   身体 0.03 × 90 = 2.7
 * 换句话说 clamp 是保险丝不是造型手段，只有甩得最狠的呆毛会碰到它。
 */
const REACH = 90

/** 视线跟随鼠标的幅度上限，规格 3.2 写死 ±3。 */
const GAZE_REACH = 3

/** 滚动速度并进纵向目标。停手时头发还在飘，纵深就是这么来的。 */
const SCROLL_GAIN = 0.35
const SCROLL_MAX = 1.2

/** 弹簧静止判据。位移和速度都低于它就停 RAF，别空转。 */
const REST = 0.002

type PartKey = keyof typeof MASCOT

interface Axis {
  x: number
  v: number
}

interface Node {
  el: SVGSVGElement
  /** 立绘中心在视口里的位置，resize 与滚动时重算。 */
  cx: number
  cy: number
  parts: Record<PartKey, { x: Axis; y: Axis }>
  gaze: { x: Axis; y: Axis }
  /** 外部关掉惯性时（例如卡片没进视口）保持归零。 */
  enabled: boolean
}

const nodes = new Set<Node>()
let raf = 0
let pointerX = 0
let pointerY = 0
let pointerSeen = false
let scrollV = 0
let lastScrollY = 0
let lastTime = 0

const PART_KEYS = Object.keys(MASCOT) as PartKey[]

const axis = (): Axis => ({ x: 0, v: 0 })

const clamp = (v: number, limit: number) => (v > limit ? limit : v < -limit ? -limit : v)

/**
 * 半隐式欧拉。和 motion 的 spring 是同一套物理模型，
 * 所以 motion-tokens 里的 stiffness / damping / mass 在这里同样成立。
 */
function integrate(a: Axis, target: number, k: number, c: number, m: number, dt: number) {
  const acc = (k * (target - a.x) - c * a.v) / m
  a.v += acc * dt
  a.x += a.v * dt
}

function measure(node: Node) {
  const rect = node.el.getBoundingClientRect()
  node.cx = rect.left + rect.width / 2
  node.cy = rect.top + rect.height / 2
}

function tick(now: number) {
  const dt = lastTime === 0 ? 1 / 60 : Math.min((now - lastTime) / 1000, 1 / 30)
  lastTime = now

  // 滚动速度按时间常数衰减，松手后余韵约 200ms
  scrollV *= Math.exp(-dt / 0.2)

  const vw = window.innerWidth || 1
  const vh = window.innerHeight || 1
  let moving = false

  for (const node of nodes) {
    // 归一化到 ±1：鼠标在画面中心是 0，到屏幕边缘是 1
    const nx = node.enabled && pointerSeen ? clamp((pointerX - node.cx) / (vw / 2), 1) : 0
    const ny = node.enabled && pointerSeen ? clamp((pointerY - node.cy) / (vh / 2), 1) : 0
    const scroll = node.enabled ? clamp(scrollV * SCROLL_GAIN, SCROLL_MAX) : 0

    for (const key of PART_KEYS) {
      const cfg = MASCOT[key]
      const part = node.parts[key]
      const tx = clamp(nx * REACH * cfg.gain, MASCOT_MAX_OFFSET)
      // 滚动只推纵向。横向跟鼠标，纵向跟鼠标 + 滚动，两者叠加后再一起 clamp。
      const ty = clamp((ny + scroll) * REACH * cfg.gain, MASCOT_MAX_OFFSET)

      integrate(part.x, tx, cfg.stiffness, cfg.damping, cfg.mass, dt)
      integrate(part.y, ty, cfg.stiffness, cfg.damping, cfg.mass, dt)

      if (
        Math.abs(part.x.x - tx) > REST ||
        Math.abs(part.x.v) > REST ||
        Math.abs(part.y.x - ty) > REST ||
        Math.abs(part.y.v) > REST
      ) {
        moving = true
      }
    }

    // 视线用最快那档弹簧，眼睛要比头发跟得紧
    integrate(node.gaze.x, nx * GAZE_REACH, 260, 26, 1, dt)
    integrate(node.gaze.y, ny * GAZE_REACH, 260, 26, 1, dt)

    const s = node.el.style
    s.setProperty('--sway-ahoge', node.parts.ahoge.x.x.toFixed(3))
    s.setProperty('--sway-ahoge-y', node.parts.ahoge.y.x.toFixed(3))
    s.setProperty('--sway-hair-b', node.parts.hairBack.x.x.toFixed(3))
    s.setProperty('--sway-hair-f', node.parts.hairFront.x.x.toFixed(3))
    s.setProperty('--sway-scarf', node.parts.scarf.x.x.toFixed(3))
    s.setProperty('--sway-halo-x', node.parts.halo.x.x.toFixed(3))
    s.setProperty('--sway-halo-y', node.parts.halo.y.x.toFixed(3))
    s.setProperty('--sway-body-x', node.parts.body.x.x.toFixed(3))
    s.setProperty('--sway-body-y', node.parts.body.y.x.toFixed(3))
    s.setProperty('--gaze-x', node.gaze.x.x.toFixed(3))
    s.setProperty('--gaze-y', node.gaze.y.x.toFixed(3))
  }

  if (moving || Math.abs(scrollV) > REST) {
    raf = requestAnimationFrame(tick)
  } else {
    raf = 0
    lastTime = 0
  }
}

function wake() {
  if (raf === 0 && nodes.size > 0) {
    lastTime = 0
    raf = requestAnimationFrame(tick)
  }
}

function onPointer(e: PointerEvent) {
  pointerX = e.clientX
  pointerY = e.clientY
  pointerSeen = true
  wake()
}

function onScroll() {
  const y = window.scrollY
  scrollV += y - lastScrollY
  lastScrollY = y
  for (const node of nodes) measure(node)
  wake()
}

function onResize() {
  for (const node of nodes) measure(node)
  wake()
}

function attach() {
  lastScrollY = window.scrollY
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
}

function detach() {
  window.removeEventListener('pointermove', onPointer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(raf)
  raf = 0
  lastTime = 0
  pointerSeen = false
}

/**
 * 把一张立绘挂进惯性系统。
 * enabled 传 false 就归零并退出——prefers-reduced-motion 与静态截图都走这条路。
 */
export function useMascotInertia(
  ref: React.RefObject<SVGSVGElement | null>,
  enabled: boolean,
) {
  const nodeRef = useRef<Node | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled) {
      // 关掉时把变量清成 0，否则会停在上一帧的姿态上
      for (const name of [
        '--sway-ahoge',
        '--sway-ahoge-y',
        '--sway-hair-b',
        '--sway-hair-f',
        '--sway-scarf',
        '--sway-halo-x',
        '--sway-halo-y',
        '--sway-body-x',
        '--sway-body-y',
        '--gaze-x',
        '--gaze-y',
      ]) {
        el.style.setProperty(name, '0')
      }
      return
    }

    const parts = Object.fromEntries(
      PART_KEYS.map((k) => [k, { x: axis(), y: axis() }]),
    ) as Node['parts']

    const node: Node = { el, cx: 0, cy: 0, parts, gaze: { x: axis(), y: axis() }, enabled: true }
    nodeRef.current = node
    measure(node)

    const first = nodes.size === 0
    nodes.add(node)
    if (first) attach()
    wake()

    return () => {
      nodes.delete(node)
      nodeRef.current = null
      if (nodes.size === 0) detach()
    }
  }, [ref, enabled])
}
