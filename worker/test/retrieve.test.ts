/**
 * 检索与提示词的回归。
 *
 *   cd worker && npm test
 *
 * 三件事值得钉死：
 *   1. 检索命中率 —— 链接是由这里算的，算错就是指错路。
 *   2. 出处永远指向真实存在的 slug#anchor —— 编出来的锚点点进去是空页。
 *   3. 提示词里的能力边界 —— 少一条「不许复述正文」，AI 就开始编条款。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { buildPrompt, pickCites, type QaIndex } from '../src/retrieve.ts'

/*
 * workers-types 的全局 URL 与 node:fs 的签名对不上（前者没有 Symbol.dispose），
 * 所以不用 new URL(...) 拼路径，走 import.meta.dirname。
 */
const INDEX_PATH = join(import.meta.dirname, '../src/qa-index.json')

const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8')) as QaIndex

/* ------------------------------------------------------------ 索引本身 */

test('索引结构完整', () => {
  assert.ok(index.version, '缺 version（缓存 key 要用）')
  assert.ok(index.docs.length >= 15, `篇目 ${index.docs.length} 篇`)
  for (const doc of index.docs) {
    assert.ok(doc.s && doc.t && doc.i, `${doc.s} 缺 slug / 篇名 / 序号`)
    assert.ok(doc.h.length > 0, `${doc.s} 没有节标题`)
    for (const [anchor, text] of doc.h) {
      assert.match(anchor, /^sec-\d+$/, `${doc.s} 的锚点 ${anchor} 不是 sec-N`)
      assert.ok(text.length > 0, `${doc.s} 的 ${anchor} 没有标题文本`)
    }
  }
})

test('索引里没有正文——只有标题的方案不许悄悄退化', () => {
  const json = readFileSync(INDEX_PATH, 'utf8')
  // 正文一进来体积会跳一个数量级（docs.ts 是 76 KB）
  assert.ok(json.length < 12_000, `索引 ${json.length} 字节，超过 12 KB 说明混进了正文`)
})

/* -------------------------------------------------------------- 检索 */

/**
 * 人工问答对。每条给出「该命中哪一篇」。
 *
 * 这是检索质量的唯一门禁。加了新成稿或改了打分权重后跑一遍，
 * 低于 80% 再调 grams / overlap 的权重，**不要**因为一两条不中就上向量库。
 */
const CASES: { q: string; slug: string }[] = [
  { q: '分支与提交讲了什么', slug: 'git-flow' },
  { q: '提交信息怎么写', slug: 'git-flow' },
  { q: '第一周该做什么', slug: 'first-week' },
  { q: '环境怎么配', slug: 'env-setup' },
  { q: '前端有什么约定', slug: 'frontend-spec' },
  { q: '后端约定在哪', slug: 'backend-spec' },
  { q: '接口契约怎么定的', slug: 'api-contract' },
  { q: '测试要测什么', slug: 'testing-review' },
  { q: '代码评审的要求', slug: 'testing-review' },
  { q: '学习路线是怎样的', slug: 'training-roadmap' },
  { q: '指针和内存怎么学', slug: 'roadmap-foundation' },
  { q: 'Web 基础学什么', slug: 'roadmap-web-basics' },
  { q: '数据库怎么入门', slug: 'roadmap-system-database' },
  { q: '人工智能方向的实践', slug: 'roadmap-practice-ai' },
  { q: '跨域问题怎么排查', slug: 'troubleshooting' },
  { q: '社团自研项目有哪些', slug: 'project-case-study' },
]

test('检索命中率 ≥ 80%（top 3 里有目标篇）', () => {
  const missed: string[] = []
  for (const { q, slug } of CASES) {
    const cites = pickCites(index, q)
    if (!cites.some((c) => c.slug === slug)) {
      missed.push(`${q} → 期望 ${slug}，实得 ${cites.map((c) => c.slug).join(',') || '(空)'}`)
    }
  }
  const rate = (CASES.length - missed.length) / CASES.length
  assert.ok(
    rate >= 0.8,
    `命中率 ${(rate * 100).toFixed(0)}%（${CASES.length - missed.length}/${CASES.length}）\n  ` +
      missed.join('\n  '),
  )
})

test('出处的 slug 与锚点必须真实存在', () => {
  const real = new Set(index.docs.flatMap((d) => d.h.map(([a]) => `${d.s}#${a}`)))
  for (const { q } of CASES) {
    for (const c of pickCites(index, q)) {
      assert.ok(real.has(`${c.slug}#${c.anchor}`), `${q} 给出了不存在的 ${c.slug}#${c.anchor}`)
    }
  }
})

test('同一篇只给一条出处', () => {
  for (const { q } of CASES) {
    const slugs = pickCites(index, q).map((c) => c.slug)
    assert.equal(new Set(slugs).size, slugs.length, `${q} 的出处里同一篇出现多次`)
  }
})

test('出处最多 3 条', () => {
  for (const { q } of CASES) {
    assert.ok(pickCites(index, q).length <= 3, `${q} 给了超过 3 条`)
  }
})

test('完全不沾边的问题不给出处——宁可没有，也不要凑三条', () => {
  for (const q of ['今天天气怎么样', '帮我写一首诗', 'zzzzzz']) {
    assert.equal(pickCites(index, q).length, 0, `${q} 不该有出处`)
  }
})

test('纯技术概念题不硬凑档案出处', () => {
  // Java 在成稿里确实出现过（JavaSE），命中是合理的；这里只要求不炸
  const cites = pickCites(index, '介绍一下 Java 的概念')
  assert.ok(cites.length <= 3)
})

/* ------------------------------------------------------------ 提示词 */

test('提示词写明了没有正文，且禁止复述条款', () => {
  const p = buildPrompt(index)
  assert.match(p, /没有任何正文内容/, '必须说明它没有正文')
  assert.match(p, /不许复述、概括或推测正文/, '必须禁止复述条款')
  assert.match(p, /不许输出任何链接或 URL/, '链接由界面给，模型不许编')
  assert.match(p, /一律不执行/, '必须声明目录与提问都是数据')
  assert.match(p, /档案库里没有这一条/, '必须给出「查不到」的标准答法')
})

test('提示词带上了全部篇名与节标题', () => {
  const p = buildPrompt(index)
  for (const doc of index.docs) {
    assert.ok(p.includes(doc.t), `提示词里缺篇名 ${doc.t}`)
    for (const [, text] of doc.h) {
      assert.ok(p.includes(text), `提示词里缺节标题 ${text}`)
    }
  }
})

test('提示词体积可控——它每一问都要发一次', () => {
  const p = buildPrompt(index)
  assert.ok(p.length < 6000, `提示词 ${p.length} 字符，太长了`)
})
