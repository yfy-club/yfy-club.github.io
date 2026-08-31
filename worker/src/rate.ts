/**
 * 限流。规格 3.6（M9 新增）。
 *
 * 三道闸一起拦，各挡一种滥用：
 *
 *   ip-hour   10 问/时   —— 挡一个人坐着刷
 *   ip-day    40 问/天   —— 挡一个人慢慢刷一整天
 *   global-day 800 问/天 —— 挡分布式刷（换 IP 绕过前两道）与我们自己算错成本
 *
 * 全局闸是最后一层保险：前两道按 IP 算，攻击者拿一批代理就能绕开，
 * 而全局闸的代价是「撞了以后所有人都被挡到明天」—— 所以它的额度要留够余量，
 * 只在真出事时才该触发。
 *
 * 存 KV 而不是 Durable Object：
 * KV 的写入是最终一致的，并发下计数会少算几次（读到旧值再 +1）。
 * 这里可以接受 —— 少算几次意味着少挡几个请求，不会漏出一个数量级。
 * 需要精确计数就得上 DO，那是每个 IP 一个对象实例，成本和复杂度都翻一档。
 */

export const RATE_RULES = {
  ipHour: { limit: 60, ttl: 3600 },
  ipDay: { limit: 200, ttl: 86400 },
  globalDay: { limit: 2000, ttl: 86400 },
} as const

export interface RateResult {
  ok: boolean
  /** 建议多久之后再来，秒。 */
  retryAfter: number
  /** 撞了哪道闸，给日志看。 */
  hit?: 'ip-hour' | 'ip-day' | 'global-day'
}

export async function checkRate(kv: KVNamespace, ip: string): Promise<RateResult> {
  const now = Date.now()
  const hour = Math.floor(now / 3_600_000)
  const day = Math.floor(now / 86_400_000)

  const checks = [
    { key: `h:${ip}:${hour}`, rule: RATE_RULES.ipHour, hit: 'ip-hour' as const, reset: 3600 },
    { key: `d:${ip}:${day}`, rule: RATE_RULES.ipDay, hit: 'ip-day' as const, reset: 86400 },
    { key: `g:${day}`, rule: RATE_RULES.globalDay, hit: 'global-day' as const, reset: 86400 },
  ]

  // 先全部读一遍再决定。任何一道满了就不写计数——被拒的请求不该占额度
  const counts = await Promise.all(checks.map((c) => readCount(kv, c.key)))

  for (let i = 0; i < checks.length; i += 1) {
    const c = checks[i]!
    if (counts[i]! >= c.rule.limit) {
      return { ok: false, retryAfter: c.reset, hit: c.hit }
    }
  }

  await Promise.all(
    checks.map((c, i) =>
      kv.put(c.key, String(counts[i]! + 1), { expirationTtl: c.rule.ttl }).catch(() => {}),
    ),
  )

  return { ok: true, retryAfter: 0 }
}

async function readCount(kv: KVNamespace, key: string): Promise<number> {
  try {
    const raw = await kv.get(key)
    const n = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    /*
     * KV 读失败时放行，不是拦住。
     *
     * 拦住的话 KV 一抖动整个问答就全挂；放行的最坏情况是限流暂时失效，
     * 而上面还有 new-api 自己的 token 配额兜底。可用性优先。
     */
    return 0
  }
}
