/**
 * 向导问答的边缘代理。规格 3.6（M9 新增）。
 *
 * 为什么必须有这一层：前端是 GitHub Pages 上的纯静态站，
 * new-api 的 token 一旦写进包就是公开的，任何人都能刷额度。
 * token 只活在这个 Worker 的 Secret 里，浏览器永远看不到。
 *
 * 它同时承担四件事，缺一件这层就没有意义：
 *
 *   1. **持有凭据**：new-api token 走 env.NEW_API_KEY，不出边缘。
 *   2. **检索**：qa-index.json 编进产物，服务端算相关篇目。
 *      让客户端自己拼上下文等于把 system prompt 交给任何人改写。
 *   3. **锁死参数**：模型、temperature、max_tokens 全部服务端定，请求体里改不动。
 *      不锁的话这就是一个免费的通用聊天网关。
 *   4. **限流**：单 IP 时/日双闸 + 全局日闸。撞闸回 429，前端出人话 + 篇目链接。
 *
 * 部署：
 *   cd worker
 *   npm i
 *   npx wrangler kv namespace create QA_RATE
 *   # 把返回的 id 填进 wrangler.toml
 *   npx wrangler secret put NEW_API_KEY
 *   npx wrangler deploy
 */
/*
 * 索引直接 import 进产物。
 *
 * 不放 KV、不放 R2：它只有 6 KB，而且每一问都要用。
 * 放外部存储等于给每个请求加一跳，还多一个「部署了代码却忘了传索引」的失同步面。
 * 编进产物后版本跟代码绑死，/v1/health 把 version 报出来供核对。
 *
 * import attribute 写 with { type: 'json' }：Node 跑测试时强制要求它。
 */
import INDEX from './qa-index.json' with { type: 'json' }
import { buildPrompt, pickCites, type QaIndex } from './retrieve.ts'
import { RATE_RULES, checkRate } from './rate.ts'
import { searchWeb, shouldSearchWeb } from './search.ts'

export interface Env {
  /** new-api 的 token。Secret，不进 wrangler.toml。 */
  NEW_API_KEY: string
  /** new-api 的基址，例如 https://api.example.com（不带 /v1）。 */
  NEW_API_BASE: string
  /** 模型名。服务端定，请求体改不动。 */
  QA_MODEL: string
  /** 限流计数。 */
  QA_RATE: KVNamespace
  /** 允许的来源，逗号分隔。 */
  ALLOWED_ORIGINS: string
  /** 可选的 Brave Search API Key。如不配置自动使用 DuckDuckGo 零配置搜索。 */
  BRAVE_API_KEY?: string
}

const index = INDEX as unknown as QaIndex

/** 单问上限，字符。与前端 MAX_QUESTION 同一个数。 */
const MAX_QUESTION = 500

/** 历史最多几条消息（5 轮 = 10 条），每条截多长。 */
const MAX_HISTORY = 10
const MAX_HISTORY_CHARS = 1000

/** 回复上限。调至 2000 tokens，支持输出完整代码块与长篇技术解析。 */
const MAX_TOKENS = 2000

/** 上游超时。设为 60s，确保长文本与深度思考模型有充足的生成时间。 */
const UPSTREAM_TIMEOUT_MS = 60_000

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = req.headers.get('origin') ?? ''
    const allowed = allowOrigin(origin, env)

    if (req.method === 'OPTIONS') {
      // 预检也要过来源白名单：不然任何站点都能拿到 CORS 许可
      return allowed
        ? new Response(null, { status: 204, headers: corsHeaders(origin) })
        : new Response(null, { status: 403 })
    }

    const url = new URL(req.url)

    if (req.method === 'GET' && url.pathname === '/v1/health') {
      return json({ ok: true, version: index.version, docs: index.docs.length }, 200, origin, allowed)
    }

    if (req.method !== 'POST' || url.pathname !== '/v1/ask') {
      return json({ code: 'not_found' }, 404, origin, allowed)
    }

    /*
     * 来源白名单挡的是「拿我们的额度做自己的聊天机器人」。
     *
     * 它挡不住 curl —— Origin 是浏览器加的，命令行想写什么写什么。
     * 真正的兜底是限流：按 IP 计数，不看 Origin。两条一起才算有防护。
     */
    if (!allowed) return json({ code: 'forbidden' }, 403, origin, false)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ code: 'bad_request' }, 400, origin, allowed)
    }

    const question = normalize(pick(body, 'question'))
    if (!question) return json({ code: 'bad_request' }, 400, origin, allowed)

    const session = typeof (body as Record<string, unknown>)?.session === 'number'
      ? ((body as Record<string, unknown>).session as number)
      : 0

    const history = parseHistory(body)

    /* ---------------------------------------------------------- 限流 */

    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown'
    const rate = await checkRate(env.QA_RATE, ip)
    if (!rate.ok) {
      /*
       * 撞闸也给 cite。
       *
       * 额度用完不等于帮不上忙 —— 相关篇目是本地算的，不花一个 token。
       * 前端拿到就能列出「先看这几篇」，这是规格 5.5「不留死路」的落地。
       */
      return json(
        { code: 'rate_limited', retryAfter: rate.retryAfter, cites: pickCites(index, question) },
        429,
        origin,
        allowed,
        { 'retry-after': String(rate.retryAfter) },
      )
    }

    /* ------------------------------------------------------ 检索 + 转发 */

    const cites = pickCites(index, question)

    // 智能联网搜索：社团内部问题优先走本地知识库；外部前沿技术与未知事实触发实时搜索
    let webResults: { title: string; snippet: string }[] | undefined
    if (shouldSearchWeb(question)) {
      try {
        const results = await searchWeb(question, env.BRAVE_API_KEY)
        if (results.length > 0) webResults = results
      } catch (e) {
        console.warn('search failed, falling back:', e)
      }
    }

    const messages = [
      { role: 'system', content: buildPrompt(index, webResults) },
      ...history,
      { role: 'user', content: question },
    ]

    const stream = new TransformStream<Uint8Array, Uint8Array>()
    const writer = stream.writable.getWriter()
    const enc = new TextEncoder()
    const send = (event: string, data: unknown) =>
      writer.write(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

    /*
     * 先发 cite，再去打上游。
     *
     * 顺序是有意的：上游挂了、超时了、限流了，用户至少已经拿到三条相关篇目。
     * 把 cite 放在 done 前面一起发，等于让所有失败路径都变成一片空白。
     */
    ctx.waitUntil(
      (async () => {
        try {
          await send('cite', cites)
          await relay(env, messages, send, ip, session)
        } catch (err) {
          await send('error', { code: 'upstream', detail: String(err).slice(0, 120) }).catch(
            () => {},
          )
        } finally {
          await writer.close().catch(() => {})
        }
      })(),
    )

    return new Response(stream.readable, {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        // Cloudflare 与中间代理都不许缓冲，否则流式变成一次性吐完
        'x-accel-buffering': 'no',
      },
    })
  },
} satisfies ExportedHandler<Env>

/* ====================================================================== */

/**
 * 快速 32 位 FNV-1a 哈希，用于粘性会话与负载均衡。
 */
export function hashKey(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * 计算模型起始索引：
 * - IP 哈希作为全网访客基础偏移（实现各模型流量 1:1:1 均衡负载）。
 * - 结合 session 会话序号（0, 1, 2...）：
 *   1. 同一段对话内：session 保持不变，多轮追问 100% 锁定在同一个模型（粘性会话）。
 *   2. 同一 IP 开启新对话：session +1，100% 确定性顺序轮换到下一个未调用模型（真轮询）。
 */
export function getModelStartIndex(ip: string, session: number, modelsCount: number): number {
  if (modelsCount <= 0) return 0
  const baseOffset = hashKey(`ip:${ip}`)
  return ((baseOffset + session) % modelsCount + modelsCount) % modelsCount
}

/**
 * 转发到 new-api / octopus，支持：
 * 1. 粘性会话（Sticky Session）：同会话 / 同访客多轮对话锁定同一模型，保证语义风格连贯。
 * 2. 确定性跨会话轮询（Session-based Round-Robin）：同一用户每次开启新对话时顺序轮换模型。
 * 3. 负载均衡（Load Balancing）：不同访客通过 IP 散列均匀打散。
 * 4. 故障转移（Failover Retry）：首选模型遇到限流/故障时，自动无缝重试后续备选模型。
 */
async function relay(
  env: Env,
  messages: { role: string; content: string }[],
  send: (event: string, data: unknown) => Promise<void>,
  ip = 'unknown',
  session = 0,
): Promise<void> {
  const models = (env.QA_MODEL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (models.length === 0) {
    await send('error', { code: 'upstream', detail: 'no model configured' })
    return
  }

  // 严格根据 (IP哈希 + 会话序号) 决定模型顺序
  const startIndex = getModelStartIndex(ip, session, models.length)
  const orderedModels = [
    ...models.slice(startIndex),
    ...models.slice(0, startIndex),
  ]

  let lastStatus = 500

  for (const model of orderedModels) {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), UPSTREAM_TIMEOUT_MS)

    try {
      const apiKey = (env.NEW_API_KEY || '').replace(/^\uFEFF+/, '').trim()
      const apiBase = (env.NEW_API_BASE || '').replace(/^\uFEFF+/, '').trim().replace(/\/+$/, '')

      const res = await fetch(`${apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          // 三个参数全部服务端定死。请求体里带同名字段也没用，这里不读它。
          temperature: 0.2,
          max_tokens: MAX_TOKENS,
        }),
        signal: ctl.signal,
      })

      if (!res.ok || !res.body) {
        lastStatus = res.status
        const errText = (await res.text().catch(() => '')).slice(0, 300)
        console.error(`upstream [${model}] ${res.status}: ${errText}`)
        continue
      }

      let usage: unknown = null
      let chars = 0
      let streamedAny = false

      for await (const frame of sseFrames(res.body)) {
        if (frame === '[DONE]') break
        let parsed: {
          choices?: { delta?: { content?: string } }[]
          usage?: unknown
        }
        try {
          parsed = JSON.parse(frame)
        } catch {
          continue
        }
        if (parsed.usage) usage = parsed.usage
        const t = parsed.choices?.[0]?.delta?.content
        if (t) {
          streamedAny = true
          chars += t.length
          await send('delta', { t })
        }
      }

      await send('done', { chars, usage: usage ?? null })
      return
    } catch (err) {
      console.error(`upstream [${model}] error:`, err)
      continue
    } finally {
      clearTimeout(timer)
    }
  }

  // 全部模型尝试均失败
  await send('error', { code: lastStatus === 429 ? 'rate_limited' : 'upstream' })
}

/** 从上游的 SSE 里逐帧取出 data: 后面那段。 */
async function* sseFrames(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buf += value

      let cut = buf.indexOf('\n\n')
      while (cut !== -1) {
        const frame = buf.slice(0, cut)
        buf = buf.slice(cut + 2)
        for (const line of frame.split('\n')) {
          if (line.startsWith('data:')) yield line.slice(5).trim()
        }
        cut = buf.indexOf('\n\n')
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }
}

/* ----------------------------------------------------------------- 入参 */

const pick = (body: unknown, key: string): string => {
  if (typeof body !== 'object' || body === null) return ''
  const v = (body as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : ''
}

/**
 * 归一化 + 截断。
 *
 * 一并剥掉 prompt 里用的分隔标记：用户把 `</目录>` 打进来的话，
 * 模型会以为档案段到此结束、后面是新指令。前端也做一次，但服务端这次才算数。
 */
export function normalize(raw: string): string {
  const flat = raw.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  const clean = flat.replace(/<\/?(?:目录|档案|系统|system)>/gi, ' ')
  return [...clean].slice(0, MAX_QUESTION).join('').trim()
}

function parseHistory(body: unknown): { role: string; content: string }[] {
  if (typeof body !== 'object' || body === null) return []
  const raw = (body as Record<string, unknown>).history
  if (!Array.isArray(raw)) return []

  return raw
    .slice(-MAX_HISTORY)
    .map((m) => {
      const role = pick(m, 'role')
      const content = normalize(pick(m, 'content')).slice(0, MAX_HISTORY_CHARS)
      return { role: role === 'assistant' ? 'assistant' : 'user', content }
    })
    .filter((m) => m.content.length > 0)
}

/* ----------------------------------------------------------------- CORS */

function allowOrigin(origin: string, env: Env): boolean {
  if (!origin) return false
  const list = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.includes(origin)
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    // 同一个 URL 对不同 Origin 回不同的头，不写 Vary 会被缓存串味
    vary: 'Origin',
  }
}

function json(
  payload: unknown,
  status: number,
  origin: string,
  allowed: boolean,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...(allowed ? corsHeaders(origin) : {}),
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  })
}

export { RATE_RULES }
