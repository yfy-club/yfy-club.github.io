/**
 * 本地假上游 + 假代理，在没有 new-api 的情况下把整条链路跑通。
 *
 *   cd worker && npm run mock
 *   另一个终端：VITE_QA_ENDPOINT=http://localhost:8788 npx vite --port 5242
 *
 * 它复用 worker/src 的**真实 handler**，只把 globalThis.fetch 换成假上游、
 * KV 换成内存 Map——验的是真代码，不是另写一份。
 * 假上游逐字吐（每字 12ms），流式手感与真实模型接近。
 */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const PORT = 8788
const modUrl = new URL('../src/index.ts', import.meta.url)

// 假上游：把问题回一段中文，逐字流式吐出来
const original = globalThis.fetch
globalThis.fetch = async (url, init) => {
  if (!String(url).includes('/v1/chat/completions')) return original(url, init)

  const body = JSON.parse(init.body)
  const q = body.messages.at(-1).content
  const answer =
    `关于「${q}」：这是本地假上游的回答，用来验证流式链路。` +
    `真实回答由自建 new-api 提供。模型参数已被代理锁定为 ${body.model} / t=${body.temperature} / max=${body.max_tokens}。`

  const stream = new ReadableStream({
    async start(c) {
      const enc = new TextEncoder()
      for (const ch of answer) {
        c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: ch } }] })}\n\n`))
        await new Promise((r) => setTimeout(r, 12))
      }
      c.enqueue(enc.encode('data: [DONE]\n\n'))
      c.close()
    },
  })
  return new Response(stream, { status: 200 })
}

const worker = (await import(modUrl)).default

const store = new Map()
const env = {
  NEW_API_KEY: 'sk-local-fake',
  NEW_API_BASE: 'https://upstream.local',
  QA_MODEL: 'local-mock',
  QA_RATE: {
    get: async (k) => store.get(k) ?? null,
    put: async (k, v) => void store.set(k, v),
  },
  ALLOWED_ORIGINS: 'http://localhost:5241,http://localhost:5242,http://localhost:5173',
}
const ctx = { waitUntil: (p) => void p.catch(() => {}), passThroughOnException() {} }

createServer(async (req, res) => {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v[0] : v)
  headers.set('cf-connecting-ip', '127.0.0.1')

  const request = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  })

  const out = await worker.fetch(request, env, ctx)
  res.writeHead(out.status, Object.fromEntries(out.headers))
  if (out.body) {
    for await (const chunk of out.body) res.write(chunk)
  }
  res.end()
}).listen(PORT, () => {
  const idx = JSON.parse(readFileSync(new URL('../src/qa-index.json', import.meta.url), 'utf8'))
  console.log(`假代理 http://localhost:${PORT}  索引 ${idx.version} / ${idx.docs.length} 篇`)
})
