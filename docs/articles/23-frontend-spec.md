---
category: engineering
slug: frontend-spec
title: 前端工程规范
summary: 前端约定：TypeScript 类型约束、状态单一真源、设计令牌与动效降级。
minutes: 10
---

### 核心背景与技术定位

前端工程的四大失控场景：类型靠猜导致的运行时崩溃、状态四处散落导致的界面不一致、样式硬编码导致的改版灾难、动效无视系统偏好导致的体验冒犯。本篇是社团前端项目的四条工程约定——类型、状态、设计系统、动效，各自对应一类失控。

#### 约定的执行方式

约定不靠自觉：类型约定由 `tsc` 严格模式在门禁里执行，设计令牌约定由对比度检测脚本执行，动效约定由评审清单核对。能被机器拦的约定都交给机器。

### 类型系统约定

#### 严格模式与可辨识联合

`strict` 全开是底线。在此之上，状态建模优先使用可辨识联合：用一个字面量字段区分分支，让编译器穷尽检查每个分支是否被处理——新增状态时，所有未更新的 `switch` 当场报错，而不是上线后白屏。

```ts
// 反例：一个接口同时装着成功与失败的数据，字段永远可能为空
type FetchState_bad = {
  data: unknown
  error: string
  loading: boolean
}

// 正例：可辨识联合，每个分支只带自己的字段
type FetchState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly message: string }

function render<T>(state: FetchState<T>): string {
  switch (state.status) {
    case 'idle':
    case 'loading':
      return '加载中'
    case 'success':
      return String(state.data) // 编译器保证此分支 data 必存在
    case 'error':
      return state.message
    // 若新增分支未处理，never 类型断言会在此报错
  }
}
```

#### 只读约束与泛型约束

共享状态与常量一律 `readonly` 或 `as const`：把「不许改」写进类型，而不是写进注释。泛型边界用 `extends` 约束收紧，禁止无约束的裸 `<T>` 在公共 API 上泛滥。

```ts
// 常量表用 as const 冻结，取值函数用 keyof 约束，拼错键名编译期即报错
const ERROR_CODES = {
  NETWORK: 1001,
  TIMEOUT: 1002,
} as const

function labelOf(key: keyof typeof ERROR_CODES): number {
  return ERROR_CODES[key]
}
```

#### 类型断言的禁令

`as any` 一票否决；`as unknown as X` 视同。跨越类型边界的唯一合法姿势是**校验后收窄**：先运行时校验，再让类型跟着收窄，详见各项目的数据入口层实现。

### 状态架构约定

#### 单一真源原则

同一份数据只允许有一个权威来源。界面派生数据一律现算不另存——存两份就会有一天不一致。跨组件共享状态收敛到项目唯一的 store，组件私有状态留在组件内，**状态下沉**：能放在子组件的不上提到父组件，能放局部的不进全局。

#### URL 查询参数作为状态载体

列表页的筛选、分页、排序等「值得分享与刷新后保留」的状态，以 `URLSearchParams` 为真源，而不是藏在组件内存里：

```ts
// 正例：筛选状态落在 URL 上，刷新、分享、浏览器前进后退全部自然正确
export function readFilterFromUrl(): { keyword: string; page: number } {
  const params = new URLSearchParams(window.location.search)
  const keyword = params.get('q') ?? ''
  const rawPage = Number(params.get('page') ?? '1')
  // 边界防护：非法页码回落到第一页，不信任 URL 里的任何值
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  return { keyword, page }
}

export function writeFilterToUrl(keyword: string, page: number) {
  const params = new URLSearchParams(window.location.search)
  if (keyword) params.set('q', keyword)
  else params.delete('q')
  params.set('page', String(Math.max(1, page)))
  const next = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState(null, '', next)
}
```

### 设计令牌与交互动效约定

#### 令牌是唯一取色入口

颜色、间距、圆角、字号全部来自设计令牌，组件里禁止出现裸的十六进制色值。换肤、改版与无障碍达标都建立在「取色入口唯一」这个前提上。

#### 对比度的硬指标

正文与交互元素对背景色的对比度必须达到 WCAG AA 级（正文至少 4.5:1，大号文本至少 3:1）。社团项目以对比度检测脚本作为门禁：任何新增配色组合先过脚本，再进评审。

```css
/* 令牌定义：语义命名，按用途而不是按色相命名 */
:root {
  --ink-900: #16324f;   /* 正文主色，对底色 13.21:1 */
  --ink-600: #4a6076;   /* 次要文本，6.16:1 */
  --sky-700: #0d5c8c;   /* 强调与链接，5.17:1 */
  --bg-sunk: #e8f0f6;   /* 下沉背景，代码块与徽标底 */
}

/* 组件只引令牌：换肤只动上面一段，组件零改动 */
.doc-link {
  color: var(--sky-700);
}
```

#### 微交互时长纪律

悬停、按压、展开类微交互控制在 150ms 至 300ms：低于 150ms 显得生硬，超过 300ms 用户开始等待。长流程（页面切换）可到 400ms 封顶，且必须可被打断。

#### 减弱动效的系统适配

用户系统开启「减弱动态效果」时，装饰性动画必须整体关闭，仅保留必要的状态反馈：

```ts
// 统一走这一个钩子，禁止组件各自读媒体查询
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false // 非浏览器环境（预渲染）按完整动效处理
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

```css
/* CSS 侧的总闸：一段代码关掉所有装饰动画 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 高频故障与实操避坑

| 症状 | 根因 | 修复方案 |
|---|---|---|
| 界面数据不同步 | 同一数据存了两份 | 删掉派生副本，改为现算 |
| 刷新后筛选丢失 | 状态只在组件内存里 | 迁到 URL 查询参数 |
| 对比度检测红项 | 新配色未过脚本 | 换用令牌里已有的语义色 |
| 动效被系统用户投诉 | 未适配减弱动效 | 接统一钩子与 CSS 总闸 |
| 联合类型漏分支白屏 | 没有穷尽检查 | `switch` 尾部加 `never` 断言 |

### 实操验收清单

| 项目 | 验收标准 |
|---|---|
| 类型门禁 | `tsc` 严格模式零错误；无 `as any` 与无约束裸泛型 |
| 状态纪律 | 共享状态唯一真源，筛选分页类状态可从 URL 恢复 |
| 设计令牌 | 全仓检索无裸色值；对比度门禁全绿 |
| 动效适配 | 开启系统减弱动效后装饰动画全部静止 |
| 评审抽查 | 随机抽三个组件，状态下沉与只读约束均达标 |
