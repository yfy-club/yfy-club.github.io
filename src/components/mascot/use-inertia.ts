import { useEffect, useRef } from 'react'
import { MASCOT, MASCOT_MAX_OFFSET } from '@/lib/motion-tokens'
import {
  holdScrollFrames,
  onScrollFrame,
  requestScrollFrame,
  scrollY,
  viewportH,
} from '@/lib/scroll-frame'

/**
 * 立绘惯性。halo 与身体跟着鼠标与滚动甩，各自一套弹簧。
 *
 * 数值不在这里拍，全部来自 src/lib/motion-tokens.ts（规格 3.5）。
 * 这里只负责三件事：把输入归一化、积分弹簧、把结果写成 CSS 变量。
 *
 * 为什么不用 motion 的 useSpring：那会让每帧都过 React。
 * 首屏一个看板娘、方向区五个，加起来 36 条弹簧 60fps 重渲染整棵树，不划算。
 * 这里直接写 style property，React 全程不参与。
 *
 * 帧调度不自己开 rAF，而是挂在 lib/scroll-frame.ts 的共用帧上：
 * 采样在 read 相位，积分与 style 写入在 write 相位。否则它会跟导航条、刻度尺、
 * 分区判定、展台视差各自的 rAF 互相插队，单帧耗时变成锯齿状，
 * 而 lenis 的阻尼步长是按实际帧间隔算的——帧耗时不均就是步长不均。
 *
 * M8：立绘从矢量骨架换成栅格图后只剩 halo 与身体两组还有作用对象——
 * 一张 `<img>` 里的头发、领巾、瞳孔都不能单独摆。呆毛 / 后发 / 前发 / 领巾 / 视线
 * 五组弹簧因此停积分（`ACTIVE_PARTS`）。spec 3.5 那张表原样留在 motion-tokens.ts 里
 * 不动：它是规格的一部分，将来若补分层立绘要照它接回来。
 * 每实例每帧的弹簧数从 12 降到 4，方向区五张卡合计 60 → 20。
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

/** 滚动速度并进纵向目标。停手时头发还在飘，纵深就是这么来的。 */
const SCROLL_GAIN = 0.35
const SCROLL_MAX = 1.2

/** 弹簧静止判据。位移和速度都低于它就放开持帧，别空转。 */
const REST = 0.002

type PartKey = keyof typeof MASCOT

interface Axis {
  x: number
  v: number
}

interface Node {
  el: HTMLElement
  /** 立绘在文档中的绝对坐标中心。 */
  docX: number
  docY: number
  /** 立绘中心在视口里的位置。 */
  cx: number
  cy: number
  parts: Record<(typeof ACTIVE_PARTS)[number], { x: Axis; y: Axis }>
  /** 外部关掉惯性时（例如卡片没进视口）保持归零。 */
  enabled: boolean
  /** 上一帧已经写进 style 的四个量。没变就不写。 */
  written: [string, string, string, string]
}

const nodes = new Set<Node>()
/** 持帧句柄。非 null 就说明弹簧还在跑。 */
let holdRelease: (() => void) | null = null
let pointerX = 0
let pointerY = 0
let pointerSeen = false
let scrollV = 0
let lastScrollY = 0
let lastTime = 0
/**
 * 视口尺寸缓存。
 *
 * 物理循环里不能读 window.innerWidth / innerHeight：那两个属性在样式脏的时候
 * 会触发布局刷新，而这个循环自己就在往 style 上写东西——写一个读一个，
 * 每帧一次强制同步布局，方向区五张卡就是五次。
 */
let vw = 1
let vh = 1

/** 还有作用对象的部件。其余的见文件头注释。 */
const ACTIVE_PARTS = ['halo', 'body'] as const satisfies readonly PartKey[]

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
  const sx = window.scrollX || 0
  const sy = window.scrollY || 0
  node.docX = rect.left + sx + rect.width / 2
  node.docY = rect.top + sy + rect.height / 2
  node.cx = rect.left + rect.width / 2
  node.cy = rect.top + rect.height / 2
}

function tick() {
  const now = performance.now()
  const dt = lastTime === 0 ? 1 / 60 : Math.min((now - lastTime) / 1000, 1 / 30)
  lastTime = now

  // 滚动速度按时间常数衰减，松手后余韵约 200ms
  scrollV *= Math.exp(-dt / 0.2)

  let moving = false

  for (const node of nodes) {
    if (!node.enabled) continue
    // 视口剔除：离屏立绘跳过物理积分与 style 写入，主线程零多余重绘
    if (node.cy < -250 || node.cy > vh + 250) continue

    // 归一化到 ±1：鼠标在画面中心是 0，到屏幕边缘是 1
    const nx = pointerSeen ? clamp((pointerX - node.cx) / (vw / 2), 1) : 0
    const ny = pointerSeen ? clamp((pointerY - node.cy) / (vh / 2), 1) : 0
    const scroll = clamp(scrollV * SCROLL_GAIN, SCROLL_MAX)

    for (const key of ACTIVE_PARTS) {
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

    const s = node.el.style
    /*
     * 只在真的变了时写。
     *
     * 弹簧静止前的最后几百毫秒里位移已经小于三位小数的精度，写进去的是同一个
     * 字符串，但 setProperty 不管值相同不同，一律作废整颗子树的样式——
     * 方向区五张卡 × 四个变量 = 每帧二十次无意义的重新计算样式，恰好叠在滚动帧上。
     */
    const next = node.written
    const hx = node.parts.halo.x.x.toFixed(3)
    const hy = node.parts.halo.y.x.toFixed(3)
    const bx = node.parts.body.x.x.toFixed(3)
    const by = node.parts.body.y.x.toFixed(3)
    if (hx !== next[0]) {
      next[0] = hx
      s.setProperty('--sway-halo-x', hx)
    }
    if (hy !== next[1]) {
      next[1] = hy
      s.setProperty('--sway-halo-y', hy)
    }
    if (bx !== next[2]) {
      next[2] = bx
      s.setProperty('--sway-body-x', bx)
    }
    if (by !== next[3]) {
      next[3] = by
      s.setProperty('--sway-body-y', by)
    }
  }

  if (moving || Math.abs(scrollV) > REST) {
    hold()
  } else {
    release()
  }
}

/**
 * 让共用滚动帧接着排下去。
 *
 * 弹簧在用户停手后还要算几百毫秒，不能只等 scroll 事件叫醒；
 * 但也不能自己另开一条 rAF 链——那就回到了多个回调互相插队、单帧耗时不均的局面。
 */
function hold() {
  if (!holdRelease) holdRelease = holdScrollFrames()
}

function release() {
  holdRelease?.()
  holdRelease = null
  lastTime = 0
}

function wake() {
  if (nodes.size > 0) hold()
}

function onPointer(e: PointerEvent) {
  pointerX = e.clientX
  pointerY = e.clientY
  pointerSeen = true
  wake()
}

/**
 * 重新采样滚动。挂在共用滚动帧的 read 相位，不直接听 scroll 事件。
 *
 * 两个理由：
 *   1. 高刷屏上 scroll 事件一帧可能派多次，按事件累加 scrollV 会把速度算大；
 *      按帧采样拿到的就是真实的单帧位移。
 *   2. 跟导航条、刻度尺、分区判定共用同一个 rAF，一帧只一次调度。
 */
function sampleScroll() {
  const y = scrollY()
  const x = window.scrollX
  const dy = y - lastScrollY
  lastScrollY = y
  vh = viewportH()
  for (const node of nodes) {
    node.cx = node.docX - x
    node.cy = node.docY - y
  }
  /*
   * 没动就不叫醒。
   *
   * 这个函数每帧都跑（read 相位），而 tick 在同一帧的 write 相位释放持帧。
   * 无条件 wake() 的话两边会每帧一拿一放，弹簧静止后帧链仍然永远醒着。
   */
  if (dy === 0) return
  scrollV += dy
  wake()
}

function onResize() {
  vw = window.innerWidth || 1
  vh = window.innerHeight || 1
  for (const node of nodes) measure(node)
  wake()
}

/** 共用滚动帧的退订句柄。 */
let offRead: (() => void) | null = null
let offWrite: (() => void) | null = null

function attach() {
  lastScrollY = window.scrollY
  vw = window.innerWidth || 1
  vh = window.innerHeight || 1
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  // 采样在 read，积分与写入在 write。两相分开才能保证整帧只一次布局。
  offRead = onScrollFrame('read', sampleScroll)
  offWrite = onScrollFrame('write', tick)
  requestScrollFrame()
}

function detach() {
  window.removeEventListener('pointermove', onPointer)
  window.removeEventListener('resize', onResize)
  offRead?.()
  offRead = null
  offWrite?.()
  offWrite = null
  release()
  pointerSeen = false
}

/**
 * 把一张立绘挂进惯性系统。
 * enabled 传 false 就归零并退出——prefers-reduced-motion 与静态截图都走这条路。
 */
export function useMascotInertia(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const nodeRef = useRef<Node | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled) {
      // 关掉时把变量清成 0，否则会停在上一帧的姿态上
      for (const name of ['--sway-halo-x', '--sway-halo-y', '--sway-body-x', '--sway-body-y']) {
        el.style.setProperty(name, '0')
      }
      return
    }

    const parts = Object.fromEntries(
      ACTIVE_PARTS.map((k) => [k, { x: axis(), y: axis() }]),
    ) as Node['parts']

    const node: Node = {
      el,
      docX: 0,
      docY: 0,
      cx: 0,
      cy: 0,
      parts,
      enabled: true,
      written: ['', '', '', ''],
    }
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
