---
category: roadmap
slug: roadmap-web-basics
title: 阶段二：Web 前端视野、现代布局与异步交互
summary: Web 前端筑基：浏览器渲染流水线、事件模型、事件循环与原生交互看板大作业。
minutes: 12
---

### 核心背景与技术定位

阶段二把视野从单机程序拉向浏览器：用户看到的每一个像素，都是浏览器把 HTML、CSS、JavaScript 三份输入加工后的产物。不理解这条加工流水线，写出的页面就会在数据一多时卡顿、在交互一密时掉帧，却说不清慢在哪里。

#### 为什么原生先行、框架在后

React、Vue 这些框架解决的是「大型界面的组织问题」，而它们封装掉的正是本阶段要学的原生能力：DOM 操作、事件模型、异步时序。跳过原生直接学框架，等于只会按按钮不会看仪表盘——框架一升级、行为一变化，就失去了判断依据。社团的顺序是：先用原生 JavaScript 把看板写出来，再进项目学框架，此时框架的每个设计你都能对上号。

#### 本阶段的能力边界

完成本阶段后应能：口述从 URL 到像素的完整链路、用 Flex 与 Grid 完成任意常规布局、解释事件三阶段与委托原理、画出事件循环的微任务宏任务调度时序。

### 浏览器渲染流水线与事件模型

浏览器把一份页面变成屏幕像素要走五道工序，每道工序都可能成为性能瓶颈：

| 工序 | 做什么 | 触发重做的典型操作 |
|---|---|---|
| DOM 树构建 | 解析 HTML 生成节点树 | `innerHTML` 整段替换 |
| 样式计算 | 解析 CSS 算出每节点最终样式 | 增删类名、改样式规则 |
| 布局（重排） | 计算每节点的位置与尺寸 | 读写 `offsetWidth`、改几何属性 |
| 绘制（重绘） | 生成绘制指令与图层 | 改颜色、阴影等外观属性 |
| 合成 | GPU 合成各图层输出画面 | `transform`、`opacity` 动画 |

#### 重排与重绘的成本差

改几何属性（宽高、位置）会让布局阶段从该节点开始重新计算，波及子孙与后续兄弟，这是最贵的操作；改外观属性（颜色、背景）只触发重绘，跳过布局；而 `transform` 与 `opacity` 的变化只发生在合成阶段，不碰布局也不碰绘制，这就是「动画优先用 transform」的物理依据。

#### 读写的隐形代价

浏览器为了性能会延迟批量执行布局，但一旦你在写操作之间插入一次几何属性读取（如 `offsetHeight`），浏览器必须立刻把布局算完给你准确值——读写交替就造成强制同步布局，这是页面卡顿最常见的隐形元凶。

#### 捕获、目标与冒泡三阶段

一次点击事件的生命周期分三段：先从 `window` 沿 DOM 树向下**捕获**，到达**处于目标**的元素，再从目标沿树向上**冒泡**。`addEventListener` 的第三个参数决定监听挂在捕获段还是冒泡段，默认冒泡。绝大多数业务只需冒泡段。

#### 事件委托：冒泡的工程红利

给一百个列表项各绑一个监听器，内存里就是一百个闭包；利用冒泡把监听器只绑在父容器上，通过 `event.target` 判断真实来源，一份监听覆盖全部子项，动态新增的子项也自动生效。这是冒泡机制换来的最实用的工程红利。

#### 单线程事件循环的调度时序

JavaScript 主线程是单线程的，靠事件循环调度任务：每执行完一个**宏任务**（脚本、`setTimeout`、事件回调），就先清空整个**微任务队列**（`Promise.then`、`queueMicrotask`），再去做渲染，然后取下一个宏任务。微任务插队能力强，宏任务之间会被渲染隔开——理解了这条时序，才能解释「为什么 `Promise.then` 总比 `setTimeout` 先打印」。

```ts
console.log('1 同步脚本本身是第一个宏任务')

setTimeout(() => console.log('5 宏任务：等微任务与渲染都结束才轮到我'), 0)

Promise.resolve()
  .then(() => console.log('3 微任务：本轮回调结束后立刻执行'))
  .then(() => console.log('4 微任务：链上下一环仍在微任务队列'))

console.log('2 同步代码按书写顺序执行完毕')
// 输出顺序：1 → 2 → 3 → 4 → 5
```

### 现代布局体系

#### Flex 与 Grid 的分工

Flex 解决「一条线上的排布」：导航条、工具栏、卡片内的元素对齐；Grid 解决「一张网上的排布」：整页骨架、瀑布式卡片区。口诀：**先 Grid 定骨架，再 Flex 排局部。** 两者都能做的事优先 Grid，它的行列约束声明更直白。

```css
/* 页面骨架：左栏固定 280 目录树，右栏自适应长文 */
.archive-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  min-height: 100vh;
}

/* 局部对齐：导航项水平分布，垂直居中 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 移动端收窄时允许换行，而不是溢出撑破容器 */
  flex-wrap: wrap;
  gap: 12px;
}
```

#### 响应式的断点纪律

断点不是越多越好，社团约定两档：`768px` 以下按移动端单列重排，`768px` 以上按桌面布局。移动优先意味着基础样式写给最窄屏，再用 `min-width` 媒体查询逐级增强，避免桌面样式写了三百行再逐条推翻。

### 正反例设计范式

#### 反例：循环内读写交替引发布局抖动

```ts
// 反例：每次循环都强制同步布局，一百项就触发一百次重排
function syncHeights_bad(items: HTMLElement[]) {
  for (const el of items) {
    const h = el.offsetHeight // 读：强制浏览器立刻完成布局
    el.style.height = `${h + 8}px` // 写：布局失效
  }
}
```

隐患拆解：读写交替让浏览器的批量布局优化彻底失效，列表越长卡顿越明显；在滚动或动画回调里这样写，帧率直接腰斩。

#### 正例：批量读写分离与文档片段

```ts
// 正例：先集中读、再集中写，整段只触发一次布局
function syncHeights_good(items: HTMLElement[]) {
  if (!items || items.length === 0) return // 空值防御在前

  const heights = items.map((el) => el.offsetHeight) // 批量读
  items.forEach((el, i) => {
    el.style.height = `${heights[i]! + 8}px` // 批量写
  })
}

// 正例：大批量插入先进文档片段，一次性上树，只触发一次重排
function renderList_good(list: HTMLElement, data: readonly string[]) {
  const fragment = document.createDocumentFragment()
  for (const text of data) {
    const li = document.createElement('li')
    li.textContent = text // textContent 不解析 HTML，天然防注入
    fragment.appendChild(li)
  }
  list.replaceChildren(fragment) // 原子替换，旧节点一并清理
}
```

需要按帧节流的动画与滚动处理，用 `requestAnimationFrame` 把写操作对齐到渲染时机，而不是在事件回调里随手改样式。

### 高频故障与实操避坑

| 症状 | 根因 | 修复方案 |
|---|---|---|
| 列表一多滚动就卡 | 循环内强制同步布局 | 读写分离，批量更新 |
| 监听器绑了不生效 | 元素在绑定后才插入 | 改用事件委托绑在父容器 |
| `then` 里拿到旧值 | 异步时序误解 | 画出事件循环时序再改代码 |
| 布局在某些浏览器错位 | 用了过新的 CSS 特性 | 查兼容性表，关键特性加回退 |
| 输入框打字触发海量请求 | 键盘事件直连请求 | 防抖 300ms，请求前判空 |

防抖是交互层的基本功，核心是「最后一次触发后才真正执行」：

```ts
function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: A) => {
    if (timer !== null) clearTimeout(timer) // 取消上一次未执行的调用
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, waitMs)
  }
}
```

### 阶段实战大作业与验收清单

基于原生 JavaScript 编写一块交互看板：数据列表动态渲染、顶部搜索框防抖过滤、全键盘可无障碍导航。不许引入任何框架与组件库。

| 项目 | 验收标准 |
|---|---|
| 动态渲染 | 百条数据经文档片段一次性上树，增量更新用读写分离 |
| 防抖搜索 | 输入停止 300ms 后过滤，空关键字恢复全量，过滤结果为空有提示态 |
| 无障碍 | `Tab` 可遍历全部交互项，`Enter` 可激活，焦点样式清晰可见 |
| 事件模型 | 列表项点击走事件委托，能口述捕获冒泡全流程 |
| 性能 | 浏览器 Performance 面板录制无明显强制同步布局红线 |
