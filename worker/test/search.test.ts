import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldSearchWeb, searchWeb } from '../src/search.ts'

test('shouldSearchWeb: 社团专属词汇与内部制度不触发联网', () => {
  assert.equal(shouldSearchWeb('云飞扬社团有哪些项目'), false)
  assert.equal(shouldSearchWeb('陈可老师是谁'), false)
  assert.equal(shouldSearchWeb('实验室打卡要求是什么'), false)
  assert.equal(shouldSearchWeb('智光耀城是做什么的'), false)
  assert.equal(shouldSearchWeb('招新有哪五个方向'), false)
})

test('shouldSearchWeb: 外部前沿、最新版本与未知技术触发联网', () => {
  assert.equal(shouldSearchWeb('Vue 3.5 最新特性是什么'), true)
  assert.equal(shouldSearchWeb('React 19 什么时候发布'), true)
  assert.equal(shouldSearchWeb('DeepSeek V3 的架构特点'), true)
  assert.equal(shouldSearchWeb('帮我搜一下 Spring AI 的最新用法'), true)
})

test('searchWeb: 静默降级与超时兜底', async () => {
  const original = globalThis.fetch
  globalThis.fetch = (async () => {
    throw new Error('network down')
  }) as typeof fetch

  try {
    const results = await searchWeb('测试网络故障')
    assert.deepEqual(results, [], '网络异常时必须静默降级返回空列表，不抛错阻塞主流程')
  } finally {
    globalThis.fetch = original
  }
})
