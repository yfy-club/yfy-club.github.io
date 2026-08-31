/**
 * 向导问答的状态。规格 3.6（M9 新增）。
 *
 * 与弹幕 store 同一套路：模块级外部 store + useSyncExternalStore，不用 context。
 * 挂件在 / 与 /docs 是两棵树里的两个实例，换路由整个重挂——面板开合、
 * 首访提示读过没有这些结论必须活在组件之外。
 *
 * 三条硬规矩：
 *
 *   1. **模型服务的凭据永远不在前端。** 端点指向我们自己的边缘代理，代理才持有
 *      new-api 的 token。token 一旦进包就是公开的，任何人都能刷额度——
 *      受限 token 只能限制损失范围，挡不住滥用。
 *   2. **检索在代理端做，不在这里。** 前端只发一句问题。让客户端自己拼上下文
 *      等于把 system prompt 交给任何人改写，既是注入面，也让代理退化成
 *      免费的通用聊天网关。
 *   3. **端点没配置就整块功能不存在。** 不是禁用按钮，是不渲染——
 *      规格 5.5 的「不留死按钮」。
 */
import { createStore } from '@/lib/store'

/**
 * 代理端点。构建期由 VITE_QA_ENDPOINT 注入，没配就是空串。
 *
 * 不在运行时探测：探测失败会在每位访客的控制台里留一条 404，
 * 而规格 5.5 要的是「不报错、不留死按钮」。与 BGM 的构建期扫盘同一条道理。
 */
export const QA_ENDPOINT = (import.meta.env.VITE_QA_ENDPOINT ?? '').replace(/\/+$/, '')

/** 端点配好了才出问答入口。 */
export const QA_ENABLED = QA_ENDPOINT.length > 0

/** 单问上限。超出的部分在提交前截掉，代理端还会再截一次。 */
export const MAX_QUESTION = 200

/** 首访提示读过没有。 */
const KEY_TIP = 'yfy.qa.seen'

/** 出处。链接由代理按标题算好给出，模型不许输出 URL——它会编。 */
export interface QaCite {
  slug: string
  /** 三级标题锚点，与 build-docs.ts 生成的 sec-N 同一口径。 */
  anchor: string
  title: string
  heading: string
}

export type QaStatus =
  /** 面板刚开，等输入。 */
  | 'idle'
  /** 已发出，首个 token 未到。挂件演 THINK。 */
  | 'pending'
  /** 正在流式输出。挂件演 FOCUS。 */
  | 'streaming'
  /** 答完。挂件演 SMILE。 */
  | 'done'
  /** 上游错、超时、限流。挂件演 SURPRISE。 */
  | 'error'

export interface QaTurn {
  /** 用户问的（已 sanitize）。 */
  q: string
  /** 模型答的。流式期间逐段追加。 */
  a: string
  /** 相关篇目。代理在正文之前先给，所以上游超时也至少有链接。 */
  cites: readonly QaCite[]
}

export interface QaState {
  open: boolean
  status: QaStatus
  /** 会话记录。最新一条在末尾。 */
  turns: readonly QaTurn[]
  /** 人话错误文案，直接上屏。 */
  error: string | null
  /** 首访提示还该不该出。 */
  tip: boolean
}

const INITIAL: QaState = {
  open: false,
  status: 'idle',
  turns: [],
  error: null,
  /*
   * 首帧一律 false。
   * localStorage 只有浏览器有，预渲染产物里出现这条提示必然注水错位——
   * 真值由 initQa() 在 effect 里补。
   */
  tip: false,
}

export const qaStore = createStore<QaState>(INITIAL)

const patch = (next: Partial<QaState>) => qaStore.set({ ...qaStore.get(), ...next })

/** 挂载后补上只有浏览器知道的那部分。 */
export function initQa(): void {
  if (!QA_ENABLED) return
  let seen = false
  try {
    seen = localStorage.getItem(KEY_TIP) === '1'
  } catch {
    // 隐身模式禁 localStorage。当作没读过，提示出一次，收起后这一会话不再出。
  }
  patch({ tip: !seen })
}

export function dismissTip(): void {
  patch({ tip: false })
  try {
    localStorage.setItem(KEY_TIP, '1')
  } catch {
    // 存不上就下次再提示一遍。不值得为此报错。
  }
}

export function toggleQa(): void {
  const open = !qaStore.get().open
  // 开面板即算读过提示：人已经找到入口了，再提示是噪音
  if (open) dismissTip()
  patch({ open })
}

export function closeQa(): void {
  patch({ open: false })
}

/** 归一化。截长、压空白、砍掉分隔符伪造——代理端还会再校一遍。 */
export function sanitizeQuestion(raw: string): string {
  return [...raw.replace(/\s+/g, ' ').trim()].slice(0, MAX_QUESTION).join('')
}

/* ------------------------------------------------------------- 写入 */

export function beginTurn(q: string): void {
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
  const s = qaStore.get()
  qaStore.set({ ...s, status: 'pending', error: null, turns: [...s.turns, { q, a: '', cites: [] }] })
}

export function setCites(cites: readonly QaCite[]): void {
  mapLast((turn) => ({ ...turn, cites }))
}

export function appendDelta(text: string): void {
  patch({ status: 'streaming' })
  mapLast((turn) => ({ ...turn, a: turn.a + text }))
}

export function finishTurn(): void {
  patch({ status: 'done' })
  scheduleSettle()
}

export function failTurn(message: string): void {
  patch({ status: 'error', error: message })
  scheduleSettle()
}

/**
 * 答完 / 出错后把状态放回 idle。
 *
 * 不放回的话挂件会**永久停在 SMILE**：dock.tsx 的 QA_STATE 把 done 映射成 SMILE
 * 并盖住进区状态，而 useMascotState 的 SMILE_HOLD 只管它自己触发的那一次微笑，
 * 管不了外部传进来的 base。M9 实测就是这个现象——答完之后她一直在笑，
 * 滚回方向区也不切 FOCUS 了。
 *
 * 1200ms 比 SMILE_HOLD(900) 略长，让那一下「答完了」的表情演完整。
 */
const SETTLE_MS = 1200
let settleTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSettle(): void {
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = setTimeout(() => {
    settleTimer = null
    // 期间又发起了新一问就别打断它
    const s = qaStore.get()
    if (s.status === 'done' || s.status === 'error') patch({ status: 'idle' })
  }, SETTLE_MS)
}

function mapLast(fn: (turn: QaTurn) => QaTurn): void {
  const s = qaStore.get()
  if (s.turns.length === 0) return
  const turns = s.turns.slice()
  turns[turns.length - 1] = fn(turns[turns.length - 1]!)
  qaStore.set({ ...s, turns })
}
