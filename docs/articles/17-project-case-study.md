---
category: handbook
slug: project-case-study
title: 社团自研项目架构拆解
summary: 案例拆解：智学伴多模型流式会话与矩阵计算器分数域无误差算法。
minutes: 12
---

### 核心背景与技术定位

社团自研项目是最好的教材：它们诞生于真实需求，翻过真实的坑，代码就在仓库里随时可查。本篇拆解两个代表性项目的关键架构决策——智学伴的多模型流式会话与矩阵计算器的无误差算法，展示「需求如何长成架构」。

#### 读案例的方法

每读一个决策问三个问题：它解决什么问题、它拒绝了什么替代方案、它在什么规模下会失效。能回答第三问才算读懂——任何架构都有失效边界，社团项目也不例外。

### 智学伴案例：SSE 流式响应

#### 为什么是流式

大模型生成一段回答要数秒到数十秒，整段返回意味着用户干等。流式响应让回答逐字上屏：首字延迟从数十秒压到一两秒，体验从「提交表单」变成「对话」。智学伴选用 SSE（Server-Sent Events）：基于 HTTP 的单向推流，浏览器原生支持，断线自动重连，比自建 WebSocket 简单一个量级。

#### 前端流式解析的正确姿势

SSE 的数据帧可能粘包、截断，解析器必须按协议逐帧切分，而不是把到达的每个字节块当成一条完整消息：

```ts
// 正例：以空行为帧边界，累积不完整片段等待下次到达
export function parseSseBuffer(buffer: string): { events: string[]; rest: string } {
  if (!buffer) {
    return { events: [], rest: '' } // 空输入防御
  }
  const events: string[] = []
  let rest = buffer
  let sep = rest.indexOf('\n\n')
  while (sep !== -1) {
    const frame = rest.slice(0, sep)
    rest = rest.slice(sep + 2)
    // 只取 data 字段，忽略事件类型与心跳注释行
    const data = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('')
    if (data && data !== '[DONE]') {
      events.push(data)
    }
    sep = rest.indexOf('\n\n')
  }
  return { events, rest } // rest 交还调用方继续累积
}
```

反例是「收到多少渲染多少」：帧被截断时会把半条 JSON 当完整消息解析，界面上闪过乱码；心跳行不滤掉会渲染出空白气泡。

### 智学伴案例：故障转移池与会话调度

#### 多模型故障转移池

单个模型服务会限流、会超时、会挂。智学伴在服务端维护一个模型池，按「健康度 + 优先级」排序，请求依序尝试：主模型失败且错误属于可转移类别（超时、限流、服务不可用）时自动切下一个，全部失败才向用户返回明确错误。

```ts
// 故障转移的核心循环：区分「可转移错误」与「业务错误」
export async function failover<T>(
  pool: readonly ModelClient[],
  call: (client: ModelClient) => Promise<T>,
): Promise<T> {
  if (pool.length === 0) {
    throw new Error('模型池为空，无法提供服务')
  }
  let lastError: unknown = null
  for (const client of pool) {
    if (!client.isHealthy()) continue // 熔断中的节点直接跳过
    try {
      return await call(client)
    } catch (err) {
      lastError = err
      if (!isRetryable(err)) throw err // 业务错误不转移，直接上抛
      client.markFailure()             // 记一次失败，驱动熔断计数
    }
  }
  throw lastError ?? new Error('所有模型节点不可用')
}
```

关键决策：参数校验失败这类业务错误**不做转移**——换个模型重试只会把同样的错误再犯一遍，还浪费配额。

#### 粘性会话与负载打散

多轮对话必须命中同一个会话上下文：调度层按会话标识做粘性路由，同一会话始终落在持有其上下文的节点。但纯粘性会让热点会话压垮个别节点，因此粘性只在会话存活期内生效，会话过期即释放，新会话重新参与均衡——**粘性保正确，过期保均衡**，两者缺一不可。

### 矩阵计算器案例：分数域无截断误差

#### 浮点误差从哪里来

浮点数以二进制科学计数法存储，`0.1` 这类十进制小数根本表示不准，矩阵运算里的乘除又会把误差逐级放大：高斯消元做几十次行变换后，理论上为零的元素可能是一串 `1e-16`，判等失败、秩判错、解全歪。教学场景要求结果与手算完全一致，浮点路线从起点就走不通。

#### 有理数分数域方案

矩阵计算器用两个大整数构成精确分数：分子分母各是 `bigint`，每次运算后约分到最简。加减乘除全部是整数运算，零误差：

```ts
// 分数域核心：一切运算落在整数上，约分防溢出
export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y !== 0n) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

export function addFrac(an: bigint, ad: bigint, bn: bigint, bd: bigint) {
  if (ad === 0n || bd === 0n) {
    throw new Error('分母不允许为零')
  }
  const n = an * bd + bn * ad
  const d = ad * bd
  const g = gcd(n, d) || 1n // 结果为零时保持分母为一
  const sign = d < 0n ? -1n : 1n // 负号统一收到分子
  return { n: (n / g) * sign, d: (d / g) * sign }
}
```

#### Bareiss 算法：整数内消元

经典高斯消元在分数域会产生爆炸的中间分子分母。Bareiss 算法利用一个优美的性质：消元过程中的每个中间值都是整数且可整除，全程只用整数乘除、不做约分，复杂度不变而中间量受控。配合分数域输入输出，从算法层消灭了「中间膨胀」问题——这是项目里最值得学习的一次「用数学换工程」的取舍。

### 矩阵计算器案例：Web Worker 异步计算

大矩阵运算可能耗时数秒，跑在主线程上界面会整体冻结。计算器把内核放进 Web Worker：主线程提交任务即返回，Worker 算完通过消息回传结果，界面全程可交互。

```ts
// 主线程侧：任务提交与超时兜底
export function computeInWorker(matrix: unknown, timeoutMs: number): Promise<unknown> {
  if (!Array.isArray(matrix)) {
    return Promise.reject(new Error('矩阵输入必须是二维数组'))
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./matrix-worker.ts', import.meta.url))
    const timer = setTimeout(() => {
      worker.terminate() // 超时强制终止，防失控任务挂死
      reject(new Error('计算超时，请减小矩阵规模'))
    }, timeoutMs)
    worker.onmessage = (e) => {
      clearTimeout(timer)
      worker.terminate() // 一次性任务，用完即释放
      resolve(e.data)
    }
    worker.onerror = (e) => {
      clearTimeout(timer)
      worker.terminate()
      reject(new Error(e.message || '计算内核异常'))
    }
    worker.postMessage(matrix) // 结构化克隆，无需手动序列化
  })
}
```

边界纪律：输入在主线程先校验再投递，Worker 内部不信任任何来自主线程的数据；任务必须有超时，失控的数学计算不允许无限占用资源。

### 案例复用清单与避坑

| 可复用模式 | 适用场景 | 失效边界 |
|---|---|---|
| SSE 流式上屏 | 任何长耗时生成类响应 | 代理层缓冲未关闭时流式失效 |
| 故障转移池 | 依赖多个同类外部服务 | 全池同源故障时无效，需跨供应商 |
| 粘性加过期 | 有会话状态的负载均衡 | 节点宕机时会话上下文丢失需重建 |
| 有理数精确域 | 教学与审计类精确计算 | 整数规模极大时性能下降 |
| Worker 卸载 | 主线程长耗时计算 | 消息传递成本高于计算本身时不值 |

验收建议：选一个案例在本地复现其核心链路——跑通一次 SSE 流式解析、手写一遍分数加法与约分、让一个任务在 Worker 里跑完并收到结果。讲得出取舍、复现得了链路，这两个案例才算读完。
