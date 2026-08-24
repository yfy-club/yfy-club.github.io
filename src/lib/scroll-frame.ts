/**
 * 全站共用的滚动帧。
 *
 * 首页在滚动时有五处独立的「listen scroll → 自己 requestAnimationFrame → 干活」：
 * 导航条阈值、Hero 刻度尺、分区判定、三个展台的视差、立绘惯性。再加上 lenis 自己的一条，
 * 一帧里有六个互不知情的回调。两个毛病：
 *
 *   1. 它们彼此不知道对方刚写过 style 还是刚读过布局属性。读写交替就是强制同步布局
 *      （forced synchronous layout），单帧耗时因此在 0.3ms 与 3ms 之间跳。lenis 的位移是按
 *      「上一帧到这一帧的实际时间」做 damp 的，帧耗时不均匀会直接变成步长不均匀，
 *      也就是手感上的「不够顺」。
 *
 *   2. 顺序错的。React 的 effect 子先父后，Nav / Hero / 立绘的 rAF 都注册在 Portal 里那个
 *      lenis 之前，每帧先跑，读到的是 lenis **上一帧**写进去的滚动位置。视差层于是永远
 *      慢一帧，快速滚动时看着像橡皮筋。
 *
 * 这里把整页收成一条帧链，相位写死：
 *
 *      prelude（lenis 推进并写入本帧滚动位置）
 *        → 读一次 scrollY / innerHeight
 *        → 全部 read 订阅者（只算，不写）
 *        → 全部 write 订阅者（只写，不读）
 *
 * 整帧只有第二步那一次可能触发布局，且所有订阅者读到的都是本帧的最终滚动位置。
 *
 * /docs 上除了 lenis 一个订阅者都没有（目录高亮走自己那份，档案库滚动时没人写 style），
 * 所以这套东西是首页的补救，不是全站的抽象癖。
 */

type Phase = 'read' | 'write'

const readers = new Set<() => void>()
const writers = new Set<() => void>()

let frame = 0

/**
 * 要求持续出帧的计数。
 *
 * 弹簧这类动画在用户停手后还要接着算几百毫秒，不能只等 scroll 事件叫醒。
 * 它们要的不是自己另开一个 rAF，而是「把这条帧链继续排下去」。
 */
let holds = 0

/**
 * 帧头的时钟推进钩子。平滑滚动引擎挂在这里，见 setFramePrelude。
 * 有它在就必须每帧都跑：lenis 的惯性动画是靠这个回调推进的。
 */
let prelude: ((time: number) => void) | null = null

/**
 * 本帧有没有活。
 *
 * 有 prelude 时帧链一直在转（lenis 需要），但页面静止时订阅者一律不用跑。
 * 滚动位置变了、有人持帧、或者有人显式催了一帧，才算有活。
 */
let dirty = true
let ranAtScrollY = Number.NaN

/**
 * 本帧的滚动位置与视口高。
 *
 * 订阅者一律从这里取，不要自己去读 window.scrollY / innerHeight：
 * 这两个属性在样式脏的时候会触发布局刷新，而 write 相位刚写过 style。
 */
let frameScrollY = 0
let frameViewportH = 0

export const scrollY = () => frameScrollY
export const viewportH = () => frameViewportH

function run(time: number) {
  frame = 0

  // 1. 推进滚动引擎，本帧的滚动位置在这一步落定
  prelude?.(time)

  // 2. 整帧唯一一次布局读取
  frameScrollY = window.scrollY
  frameViewportH = window.innerHeight

  // 3. 静止的页面上不跑订阅者。prelude 已经跑过了，lenis 不会因此卡住。
  if (dirty || holds > 0 || frameScrollY !== ranAtScrollY) {
    dirty = false
    ranAtScrollY = frameScrollY
    // 读在前，写在后。顺序反过来就等于每个 writer 后面都跟一次布局刷新。
    for (const fn of readers) fn()
    for (const fn of writers) fn()
  }

  // 有 prelude 就必须连续出帧，否则 lenis 的惯性推不下去
  if (prelude || holds > 0) queue()
}

/**
 * 排下一帧，不标「有活」。
 * 帧链自己的延续走这条：否则静止页面上每帧都会把自己标成脏的，订阅者永远在跑。
 */
function queue() {
  if (frame === 0) frame = requestAnimationFrame(run)
}

/** 外部催帧。跟 queue 的区别就在这一下 dirty。 */
function schedule() {
  dirty = true
  queue()
}

function bind() {
  frameScrollY = window.scrollY
  frameViewportH = window.innerHeight
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}

function unbind() {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

/** 有没有人在用这条帧链。没人就把 scroll 监听也撤了。 */
const idle = () => readers.size + writers.size === 0 && prelude === null

/**
 * 订阅滚动帧。返回退订函数。
 *
 * phase 决定在帧里的位置：
 *   read  —— 只查 scrollY() / viewportH() 与自己缓存的坐标，不写 DOM；
 *   write —— 只往 style 上写，不读任何布局属性。
 *
 * 违反这个约定（在 write 里读 getBoundingClientRect）会把整帧的好处一次抹掉。
 */
export function onScrollFrame(phase: Phase, fn: () => void) {
  const set = phase === 'read' ? readers : writers
  const wasIdle = idle()
  set.add(fn)
  if (wasIdle) bind()
  schedule()

  return () => {
    set.delete(fn)
    if (idle()) unbind()
  }
}

/** 手动催一帧。挂载时对齐初始状态用，不必等用户滚。 */
export function requestScrollFrame() {
  schedule()
}

/**
 * 让帧持续排下去，直到调用返回的释放函数。
 *
 * 给弹簧、惯性这类「停手后还要算一会儿」的动画用。释放必须成对，
 * 否则页面会永远每帧醒着。
 */
export function holdScrollFrames() {
  holds += 1
  schedule()
  let released = false
  return () => {
    if (released) return
    released = true
    holds -= 1
  }
}

/**
 * 把滚动引擎的每帧推进挂到帧头。返回撤销函数。
 *
 * 平滑滚动引擎要关掉自己的 rAF 再调这个（见 smooth-scroll.ts），
 * 这样全页只剩一条帧链，且它写完滚动位置后订阅者才开始读。
 */
export function setFramePrelude(fn: (time: number) => void) {
  const wasIdle = idle()
  prelude = fn
  if (wasIdle) bind()
  schedule()

  return () => {
    if (prelude !== fn) return
    prelude = null
    if (idle()) unbind()
  }
}
