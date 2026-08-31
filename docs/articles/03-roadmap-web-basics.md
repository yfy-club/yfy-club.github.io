---
category: roadmap
slug: roadmap-web-basics
title: 阶段二：Web 前端视野、现代布局与异步交互
summary: Web 前端入门教程：HTML 标签结构、CSS 盒子与 Flex 布局、JavaScript 语法、DOM 操作与 Fetch 异步交互。
minutes: 15
---

### 推荐学习视频教程

阶段二推荐配合以下视频教程进行系统性学习与编码实战：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| HTML5 基础 | [HTML5 基础精讲](https://www.bilibili.com/video/BV1BrBiYNEWg) | `BV1BrBiYNEWg` | 语义化标签、链接、表格与表单组件 |
| CSS 布局实战 | [CSS 样式与布局实战](https://www.bilibili.com/video/BV1sQeEzFEKi) | `BV1sQeEzFEKi` | 盒子模型、选择器优先级与 Flex 弹性布局 |
| JavaScript 基础 | [JavaScript 核心机制与 DOM](https://www.bilibili.com/video/BV15L4y1a7or) | `BV15L4y1a7or` | 变量、函数、DOM 操作与事件驱动模型 |

<video-preview provider="bilibili" id="BV1BrBiYNEWg" title="HTML5 基础精讲" bvid="BV1BrBiYNEWg"></video-preview>

### HTML 核心常用标签

HTML 用于定义网页的结构与骨架。

#### 常用基础标签速查表

| 标签名 | 描述说明 | 示例 |
|---|---|---|
| `<h1> ~ <h6>` | 一级到六级标题 | `<h1>主标题</h1>` |
| `<p>` | 文本段落 | `<p>段落文本内容</p>` |
| `<a>` | 超链接（`href` 属性指定目标 URL） | `<a href="https://example.com">访问链接</a>` |
| `<img>` | 图片标签（`src` 指定路径，`alt` 替代文本） | `<img src="logo.png" alt="社团徽标">` |
| `<ul>` / `<li>` | 无序列表项 | `<ul><li>苹果</li><li>香蕉</li></ul>` |
| `<button>` | 交互按钮 | `<button type="button">点击提交</button>` |
| `<input>` | 输入框（`type="text"`、`type="password"`） | `<input type="text" placeholder="请输入姓名">` |

#### 实例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>
</head>
<body>
    <h1>欢迎来到 Web 开发的世界</h1>
    <p>这是一个基础段落，下面是一个常用功能链接：</p>
    <a href="https://www.bilibili.com" target="_blank">打开 B 站</a>

    <h2>技术学习清单</h2>
    <ul>
        <li>HTML 结构搭建</li>
        <li>CSS 美化排版</li>
        <li>JavaScript 动态交互</li>
    </ul>
</body>
</html>
```

### CSS 盒子模型与选择器

CSS 用于控制网页的排版布局与色彩外观。

#### 1. 常用选择器

| 选择器类型 | 语法格式 | 说明 | 示例 |
|---|---|---|---|
| 标签选择器 | `标签名 { ... }` | 选中页面所有指定标签 | `p { color: #333; }` |
| 类选择器 | `.类名 { ... }` | 选中带有指定 class 的元素 | `.card { padding: 16px; }` |
| ID 选择器 | `#id名 { ... }` | 选中具有唯一 id 的元素 | `#header { height: 60px; }` |

#### 2. CSS 盒子模型

每一个 HTML 元素在页面中都表现为一个矩形盒子，由内到外由四部分组成：
1. **内容区**：呈现文本与图像的实际区域（由 `width` 和 `height` 控制）。
2. **内边距**：内容与边框之间的空白区域（`padding`）。
3. **边框**：包围内边距与内容的线条（`border`）。
4. **外边距**：盒子与其他相邻元素之间的距离（`margin`）。

#### 实例代码

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* 全局将所有元素设为边框盒子模型，尺寸计算更直观 */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .card {
            width: 300px;
            padding: 20px;            /* 内边距 */
            border: 2px solid #0088cc; /* 边框 */
            margin: 20px auto;        /* 外边距：上下 20px，左右自动居中 */
            background-color: #f9fbff;
            border-radius: 8px;
        }

        .card-title {
            color: #0088cc;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h3 class="card-title">标准盒子模型卡片</h3>
        <p>内边距、边框和外边距协同控制了元素的呼吸空间。</p>
    </div>
</body>
</html>
```

### Flex 弹性布局入门

Flex 是现代 Web 最常用的单维度排版方案，通过简单的声明即可实现水平垂直居中与空间分配。

#### Flex 容器核心属性速查表

| CSS 属性 | 常用属性值 | 功能说明 |
|---|---|---|
| `display` | `flex` | 将当前元素声明为弹性容器 |
| `flex-direction` | `row`（默认） / `column` | 设置主轴方向为水平或垂直 |
| `justify-content` | `flex-start` / `center` / `space-between` | 控制子元素在**主轴**上的对齐方式 |
| `align-items` | `stretch` / `center` / `flex-start` | 控制子元素在**交叉轴**上的对齐方式 |
| `gap` | 如 `16px` | 控制子元素之间的固定间隙 |

#### 实例代码：经典导航栏与水平垂直居中

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* 导航栏：两端对齐 */
        .navbar {
            display: flex;
            justify-content: space-between; /* 左右两端撑开 */
            align-items: center;            /* 垂直居中 */
            padding: 10px 20px;
            background-color: #1a2a3a;
            color: white;
        }

        .nav-links {
            display: flex;
            gap: 15px; /* 子项间距 */
            list-style: none;
        }

        /* 水平垂直绝对居中容器 */
        .center-box {
            display: flex;
            justify-content: center; /* 主轴水平居中 */
            align-items: center;     /* 交叉轴垂直居中 */
            height: 200px;
            background-color: #eef5ff;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="brand">云飞扬社团</div>
        <ul class="nav-links">
            <li>首页</li>
            <li>档案库</li>
            <li>项目展台</li>
        </ul>
    </nav>

    <div class="center-box">
        <p>通过 display: flex 轻松实现完美居中！</p>
    </div>
</body>
</html>
```

### JavaScript 基础语法与核心 API

JavaScript 是网页的交互大脑，负责动态数据处理与用户操作响应。

#### 1. 变量与常用数据类型

```ts
// 1. 变量声明：优先使用 const（常量），需要重新赋值时使用 let
const siteName = "云飞扬开发档案库";
let visitCount = 42;
const isOnline = true;

// 2. 数组与对象
const student = {
    id: 101,
    name: "张三",
    skills: ["HTML", "CSS", "JS"]
};

// 3. 模板字符串
console.log(`网站: ${siteName}, 成员: ${student.name}`);
```

#### 2. 数组高频操作方法

```ts
const numbers = [1, 2, 3, 4, 5];

// 1. push：向末尾添加元素
numbers.push(6);

// 2. map：遍历并映射为新数组
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10, 12]

// 3. filter：按条件过滤元素
const evens = numbers.filter(n => n % 2 === 0); // [2, 4, 6]

// 4. forEach：循环遍历
numbers.forEach((num, index) => {
    console.log(`索引 ${index}: ${num}`);
});
```

### DOM 操作与事件监听

DOM 将网页解析为节点树，JavaScript 可以通过 DOM 接口查询节点、修改文本、动态增删样式与响应用户点击。

#### 常用 DOM 接口

* `document.querySelector(selector)`：按 CSS 选择器查找首个匹配元素。
* `element.textContent`：安全地获取或设置元素纯文本。
* `element.classList.add/remove/toggle`：操作元素的 class 类名。
* `element.addEventListener(event, callback)`：绑定事件监听器。

#### 实例代码：计数器与事件处理

```html
<!DOCTYPE html>
<html>
<body>
    <h2>简易计数器</h2>
    <p>当前计数值: <span id="counter-value">0</span></p>
    <button id="btn-add" type="button">点击加 1</button>
    <button id="btn-reset" type="button">重置</button>

    <script>
        // 获取 DOM 元素
        const valSpan = document.querySelector("#counter-value");
        const addBtn = document.querySelector("#btn-add");
        const resetBtn = document.querySelector("#btn-reset");

        let count = 0;

        // 绑定点击事件
        addBtn.addEventListener("click", () => {
            count += 1;
            valSpan.textContent = String(count);
        });

        resetBtn.addEventListener("click", () => {
            count = 0;
            valSpan.textContent = String(count);
        });
    </script>
</body>
</html>
```

### Fetch 异步接口请求

Fetch 用于在不刷新页面的前提下向后端发起 HTTP 网络请求并获取 JSON 数据。

#### 实例代码

```ts
// 发起 GET 请求获取远程数据
async function loadUserData(userId: number) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        
        // 检查 HTTP 状态码是否成功
        if (!response.ok) {
            throw new Error(`HTTP 错误，状态码: ${response.status}`);
        }

        // 解析 JSON 数据
        const user = await response.json();
        console.log("获取到的用户姓名:", user.name);
        console.log("用户邮箱:", user.email);
    } catch (error) {
        console.error("请求发生异常:", error);
    }
}

// 调用异步函数
loadUserData(1);
```

### 阶段实战大作业

编写一个原生待办事项交互应用：
1. 顶部提供输入框与“添加”按钮，输入文本回车或点击按钮向列表中追加待办项；
2. 每一个待办项提供“完成/未完成”勾选框与“删除”按钮；
3. 纯原生 HTML + CSS + JavaScript 编写，不引入任何外部框架。
