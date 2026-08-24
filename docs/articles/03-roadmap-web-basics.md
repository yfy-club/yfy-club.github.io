---
category: setup
slug: roadmap-web-basics
title: Web 视野
summary: HTML5 语义化文档、CSS 布局体系与 JavaScript 异步交互设计。
minutes: 8
---

### 推荐视频与学习路线

阶段二全员统一学习以下四套经典视频教程，配合大作业实践：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| HTML5 | [HTML5 基础精讲](https://www.bilibili.com/video/BV1BrBiYNEWg) | `BV1BrBiYNEWg` | 语义化标签、文档大纲与多媒体元素 |
| CSS | [CSS 样式与布局实战](https://www.bilibili.com/video/BV1sQeEzFEKi) | `BV1sQeEzFEKi` | 盒子模型、弹性布局与多端响应式适配 |
| JavaScript | [JavaScript 核心机制与 DOM](https://www.bilibili.com/video/BV15L4y1a7or) | `BV15L4y1a7or` | 基础语法、DOM/BOM 接口与事件驱动模型 |
| JS 进阶 | [JavaScript 深入与进阶](https://www.bilibili.com/video/BV1iHtozkEWx) | `BV1iHtozkEWx` | 闭包、原型链、异步 Promise 与函数式编程 |

### HTML5 语义化文档结构

掌握 HTML5 规范，合理使用语义化标签组织页面内容：

```html
<!-- 推荐页面层级结构 -->
<header> 导航与品牌信息 </header>
<main> 页面核心内容区 </main>
<aside> 辅助侧边栏 </aside>
<footer> 版权与页脚链接 </footer>
```

语义化结构有助于提高代码可读性，在搜索引擎抓取与无障碍辅助设备（读屏器）访问时提供清晰的语义大纲。

### CSS 盒子模型与现代布局

理解标准盒子模型与 IE 盒子模型的宽高计算差异：标准盒子模型的宽度仅包含内容区，而边框盒子模型将内容、内边距与边框合并计入总宽度。推荐全局设置 `box-sizing: border-box`，使尺寸计算符合直觉。

掌握现代两大核心布局方案：

* **弹性布局**：通过主轴（`justify-content`）与交叉轴（`align-items`）精准控制一维轴线上的元素对齐与空间伸缩；
* **网格布局**：通过二维行列划分（`grid-template-columns` 与 `fr` 弹性单位）实现复杂多列排版，结合媒体查询实现多端响应式适配。

### JavaScript 核心机制与事件流

理解文档对象模型（DOM）树形结构，掌握节点查询、属性修改与动态渲染。

深入理解 DOM 事件流的三个阶段：事件捕获阶段、处于目标阶段与事件冒泡阶段。合理使用事件委托机制，将多个子元素的事件统一挂载在父节点上监听，大幅降低内存消耗与 DOM 绑定开销。

### 事件循环与异步接口请求

理解浏览器单线程事件循环（Event Loop）机制：调用栈同步代码执行完毕后，优先清空微任务队列（如 `Promise.then`、`queueMicrotask`），再取出宏任务队列（如 `setTimeout`、I/O 事件）中的回调执行。

熟练使用 Promise 与 `async/await` 语法编排异步调用流，利用 Fetch API 发起网络请求，统一校验 HTTP 响应状态码并解析 JSON 数据结构。

### 经典组件设计实践

组件设计需兼顾业务场景契合度与视觉克制：

以轮播图组件为例，在品牌官网适合作为首页主视觉传递品牌心智，在电商页面适合用于商品多图切换，在管理后台与数据看板中则应保持克制，优先保障数据展示密度与查阅效率。
