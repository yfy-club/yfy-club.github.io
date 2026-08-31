# 向导问答代理

规格 3.6（M9）。前端是 GitHub Pages 上的纯静态站，new-api 的 token 不能进包——
这一层持有凭据、做检索、锁死模型参数、按 IP 限流。

## 部署

```bash
cd worker
npm i

# 1. 限流用的 KV，把返回的 id 填进 wrangler.toml
npx wrangler kv namespace create QA_RATE

# 2. 改 wrangler.toml：NEW_API_BASE 指向你的 new-api（不带 /v1）、QA_MODEL 选模型
#    ALLOWED_ORIGINS 已含 yfy-club.github.io 与本地端口

# 3. new-api 的 token 走 Secret，不写进任何文件
npx wrangler secret put NEW_API_KEY

npx wrangler deploy
```

部署完把 Worker 地址配给前端构建：

```bash
VITE_QA_ENDPOINT=https://yfy-qa.<你的账号>.workers.dev npm run build
```

没配这个变量时问答入口整个不渲染（规格 5.5 的「不留死按钮」），
所以本地开发不配也能跑，只是看不到那枚键。

## 契约

```
POST /v1/ask
  Origin 必须命中白名单，否则 403
  { question: string, history?: [{role, content}] }
  200 text/event-stream:
    event: cite   data: [{slug, anchor, title, heading}]
    event: delta  data: {"t":"分支"}
    event: done   data: {"chars":94,"usage":{...}}
    event: error  data: {"code":"upstream"|"rate_limited"}
  400 入参不合法 · 403 来源不在白名单 · 429 {code,retryAfter,cites}

GET /v1/health → { ok, version, docs }
```

`version` 是成稿指纹，用来核对代理与站点是不是同一份档案库目录。
站点改了成稿要重跑 `npm run docs:build` 并重新部署 Worker，
否则 AI 会指向已经改名的篇目。

## 服务端定死的东西

模型、`temperature 0.2`、`max_tokens 600`、`stream true` 全部在代理里写死，
请求体里带同名字段一律不读。不锁的话这就是一个免费的通用聊天网关。

## 限流

| 闸 | 额度 | 挡什么 |
|---|---|---|
| ip-hour | 10 问/时 | 一个人坐着刷 |
| ip-day | 40 问/天 | 一个人慢慢刷一天 |
| global-day | 800 问/天 | 换 IP 的分布式刷 + 我们自己算错成本 |

撞闸回 429，body 里仍然带 `cites`——额度用完不等于帮不上忙，
前端会显示「先看这几篇」。

来源白名单挡不住 curl（Origin 是浏览器加的），真正的兜底是这三道闸。

## 能力边界（重要）

代理只把档案库的**目录**（15 篇篇名 + 77 个节标题 + 摘要，约 2.6k 字符）
喂进 system prompt，**没有正文**。因此：

- 技术概念题（Java 是什么）：模型用自己的知识答。
- 问档案库怎么规定的：只能指路到「第几篇的哪一节」，**不许复述条款**。

`src/retrieve.ts` 的提示词把这条写死了，`test/retrieve.test.ts` 在断言它还在。
想让 AI 真能回答「分支怎么命名」，要做的是把正文切块喂进来（另一套设计），
不是放宽提示词措辞。

## 测试

```bash
npm test    # 29 条：检索命中率、出处真实性、CORS、限流、参数锁死、注入剥离
```

不需要真的 new-api key：上游用打桩的 `globalThis.fetch`，KV 用内存 Map，
跑的是 `src/` 里的真实 handler。

本地把整条链路走通（假上游 + 假代理，逐字流式）：

```bash
npm run mock                    # worker/ 下，假上游 + 真 handler，端口 8788
# 另一个终端，仓库根目录：
VITE_QA_ENDPOINT=http://localhost:8788 npx vite --port 5242
```

## 索引产物

`src/qa-index.json` 由站点的 `npm run docs:build` 一并生成，**不要手改**。
与 `src/data/docs.ts` 同一个脚本产出，保证两者永远同源——
分两个脚本就会有一天改了成稿只跑了一个，然后 AI 指向一个已经不存在的锚点。
