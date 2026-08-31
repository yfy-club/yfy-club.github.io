/**
 * 问答请求与 SSE 解析。规格 3.6（M9 新增）。
 *
 * 自己解析事件流，不引 EventSource 也不引第三方 SSE 库：
 *   · EventSource 只能 GET，问题得塞进查询串，长问题会撞 URL 长度上限，
 *     而且它自带无限重连——限流场景下会把 429 变成一场雪崩。
 *   · 规格第 7 节「明确不引入任何组件库」，一个按 \n\n 切帧的循环不值得拉依赖。
 *
 * 帧格式（代理端契约）：
 *   event: cite   data: [{slug,anchor,title,heading}]   先给出处，上游超时也有链接
 *   event: delta  data: {"t":"分支"}
 *   event: done   data: {"tokens":734}
 *   event: error  data: {"code":"rate_limited"|"upstream"|"off_topic"}
 */
import {
  QA_ENDPOINT,
  appendDelta,
  beginTurn,
  failTurn,
  finishTurn,
  qaStore,
  sanitizeQuestion,
  setCites,
  type QaCite,
} from './store'

/** 错误码到人话。代理端只回码，文案留在前端，改词不用重新部署代理。 */
const MESSAGES: Record<string, string> = {
  rate_limited: '今天的问答额度用完了。下面这几篇应该能帮上忙。',
  upstream: '模型服务没有响应。稍后再试，或者直接看下面这几篇。',
  off_topic: '这个问题我答不上来——我只熟社团的档案库和技术概念。',
  timeout: '等太久了，已经取消。稍后再试。',
  network: '网络没连上。检查一下连接再试。',
}

const messageOf = (code: string) => MESSAGES[code] ?? MESSAGES.upstream!

/** 只带最近两轮上下文，各截 300 字。再多就是替访客买 token。 */
const HISTORY_TURNS = 2
const HISTORY_CHARS = 300

let inflight: AbortController | null = null

/** 取消正在跑的那一问。关面板、重新提问、组件卸载都要调。 */
export function abortAsk(): void {
  inflight?.abort()
  inflight = null
}

export async function ask(raw: string): Promise<void> {
  const q = sanitizeQuestion(raw)
  if (!q) return

  abortAsk()
  const ctl = new AbortController()
  inflight = ctl

  // history 取「这一问之前」的记录，所以要先读再 beginTurn
  const history = qaStore
    .get()
    .turns.slice(-HISTORY_TURNS)
    .flatMap((t) => [
      { role: 'user', content: t.q.slice(0, HISTORY_CHARS) },
      { role: 'assistant', content: t.a.slice(0, HISTORY_CHARS) },
    ])
    .filter((m) => m.content.length > 0)

  beginTurn(q)

  try {
    const res = await fetch(`${QA_ENDPOINT}/v1/ask`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q, history, session: qaStore.get().sessionId }),
      signal: ctl.signal,
    })

    if (res.status === 429) {
      /*
       * 代理在 429 的 body 里也给了 cites（本地算的，不花 token）。
       * 接住它：额度用完不等于帮不上忙，至少能列出「先看这几篇」。
       */
      const payload = await res.json().catch(() => null)
      const cites = (payload as { cites?: QaCite[] } | null)?.cites
      if (Array.isArray(cites) && cites.length > 0) setCites(cites)
      failTurn(messageOf('rate_limited'))
      return
    }
    if (!res.ok || !res.body) {
      failTurn(messageOf('upstream'))
      return
    }

    await consume(res.body, ctl.signal)
  } catch (err) {
    // 主动取消不是错误，别在界面上留一条红字
    if (ctl.signal.aborted) return
    failTurn(messageOf(err instanceof TypeError ? 'network' : 'upstream'))
  } finally {
    if (inflight === ctl) inflight = null
  }
}

/**
 * 逐帧消费。
 *
 * 用 TextDecoderStream 而不是自己 decode：多字节汉字会跨 chunk 边界断开，
 * 手写 TextDecoder 忘了 { stream: true } 就会在中间冒出替换字符。
 *
 * 入参写 BufferSource 而不是 Uint8Array：TextDecoderStream 的 writable 端是
 * WritableStream<BufferSource>，lib.dom 下两边的泛型对不上，pipeThrough 会报错。
 */
async function consume(body: ReadableStream<BufferSource>, signal: AbortSignal): Promise<void> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  let ended = false

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read()
      if (done) break
      buf += value

      // 帧以空行分隔。最后一段可能是半帧，留在 buf 里等下一个 chunk。
      let cut = buf.indexOf('\n\n')
      while (cut !== -1) {
        const frame = buf.slice(0, cut)
        buf = buf.slice(cut + 2)
        if (handle(frame)) ended = true
        cut = buf.indexOf('\n\n')
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }

  /*
   * 流断了却没收到 done：上游中途挂了。
   * 已经吐出来的字保留在屏上（半截答案也比清空有用），但要标成出错，
   * 免得人把截断的句子当完整结论。
   */
  if (!ended && !signal.aborted) failTurn(messageOf('upstream'))
}

/** 处理一帧。返回 true 表示这一问已经结束（done 或 error）。 */
function handle(frame: string): boolean {
  let event = 'message'
  let data = ''

  for (const line of frame.split('\n')) {
    if (line.startsWith(':')) continue // 心跳注释
    if (line.startsWith('event:')) event = line.slice(6).trim()
    // data 可以有多行，按 SSE 规范用 \n 接起来
    else if (line.startsWith('data:')) data += (data ? '\n' : '') + line.slice(5).trim()
  }

  switch (event) {
    case 'cite': {
      const cites = parse<QaCite[]>(data)
      if (Array.isArray(cites)) setCites(cites)
      return false
    }
    case 'delta': {
      const chunk = parse<{ t?: string }>(data)
      if (chunk?.t) appendDelta(chunk.t)
      return false
    }
    case 'done':
      finishTurn()
      return true
    case 'error': {
      const err = parse<{ code?: string }>(data)
      failTurn(messageOf(err?.code ?? 'upstream'))
      return true
    }
    default:
      return false
  }
}

function parse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}
