/* 由 scripts/build-docs.ts 生成，不要手改。改内容改 docs/articles/*.md，再跑 npm run docs:build。 */

/** 行内片段。code 走等宽，strong 走 700，link 走超链接。 */
export interface DocInline {
  t: 'text' | 'code' | 'strong' | 'link'
  v: string
  href?: string
}

/**
 * 正文块。
 *
 * para 的 lines 是「一段里的多个自然行」，不是多段：成稿里三条禁令写成三行却属于同一段，
 * 拆成三段会让聚焦滚动一行一闪。整段是一个聚焦单元。
 *
 * code 的 html 只含 tk-k / tk-s / tk-c 三个 class，颜色在 docs.css 里引令牌。
 * lang 为空串的是纯文本清单（分支命名、目录树、分层），不高亮，不给语言角标。
 */
export type DocBlock =
  | { kind: 'h3'; id: string; text: string }
  | { kind: 'para'; lines: readonly (readonly DocInline[])[] }
  | { kind: 'code'; lang: string; html: string }
  | {
      kind: 'table'
      head: readonly (readonly DocInline[])[]
      rows: readonly (readonly (readonly DocInline[])[])[]
    }
  | { kind: 'iframe'; src: string; title: string }
  | {
      kind: 'video'
      provider: 'youtube' | 'bilibili'
      id: string
      title: string
      bvid?: string
    }

export interface DocCategory {
  id: string
  label: string
  /** hud 字体的分类代号。 */
  code: string
}

export interface Doc {
  slug: string
  /** 两位序号，走 hud 字体。 */
  index: string
  category: string
  title: string
  summary: string
  /** 阅读时长，分钟。取自成稿，本站不另算。 */
  minutes: number
  /** 三级标题，目录树展开当前篇时用。 */
  headings: readonly { id: string; text: string }[]
  blocks: readonly DocBlock[]
}

export const DOC_CATEGORIES: readonly DocCategory[] = [
  { id: 'setup', label: "上手", code: 'SETUP' },
  { id: 'convention', label: "约定", code: 'CONVENTION' },
  { id: 'quality', label: "质量", code: 'QUALITY' },
]

export const DOCS: readonly Doc[] = [
  {
    slug: 'training-roadmap',
    index: '01',
    category: 'setup',
    title: "递进路线",
    summary: "从基础语法启蒙、方向分流到真实工程与长期进阶的全景成长蓝图。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "培养阶梯与成长链路" },
      { id: 'sec-2', text: "技术成长周期与学习闭环" },
      { id: 'sec-3', text: "代码评审与能力沉淀" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "培养阶梯与成长链路" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "技术培养依托渐进式阶段阶梯展开，注重扎实基础与工程实践的有机结合：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "阶段" }], [{ t: 'text', v: "核心任务" }], [{ t: 'text', v: "能力目标" }], [{ t: 'text', v: "推荐视频教程" }]],
      rows: [
        [[{ t: 'text', v: "编程通识必看" }], [{ t: 'text', v: "计算机科学启蒙" }], [{ t: 'text', v: "建立对二进制、算法、内存与工程全局视野" }], [{ t: 'link', v: "哈佛 CS50x 导论", href: "https://www.bilibili.com/video/BV1Ls6BYkEGk" }, { t: 'text', v: " / " }, { t: 'link', v: "YouTube 原版", href: "https://www.youtube.com/watch?v=h6lqxDwUmJQ" }]],
        [[{ t: 'text', v: "阶段一" }], [{ t: 'text', v: "语法启蒙与算法基石" }], [{ t: 'text', v: "掌握 C/C++ 语言底层逻辑、指针内存意识与基础数据结构" }], [{ t: 'link', v: "C 语言入门精讲", href: "https://www.bilibili.com/video/BV1dr4y1n7vA" }, { t: 'text', v: " / " }, { t: 'link', v: "C++ 现代体系", href: "https://www.bilibili.com/video/BV1FpWZemEMS" }, { t: 'text', v: " / " }, { t: 'link', v: "灵神算法精讲", href: "https://www.bilibili.com/video/BV1bP411c7oJ" }]],
        [[{ t: 'text', v: "阶段二" }], [{ t: 'text', v: "Web 前端视野与交互体验" }], [{ t: 'text', v: "掌握 HTML5、CSS 布局与 JavaScript 页面动态交互能力" }], [{ t: 'link', v: "HTML5 基础精讲", href: "https://www.bilibili.com/video/BV1BrBiYNEWg" }, { t: 'text', v: " / " }, { t: 'link', v: "CSS 核心实战", href: "https://www.bilibili.com/video/BV1sQeEzFEKi" }]],
        [[{ t: 'text', v: "阶段三" }], [{ t: 'text', v: "技术方向分流与工程习惯" }], [{ t: 'text', v: "进入 JavaSE 或 Python 专项学习，建立规范的 Git 提交习惯" }], [{ t: 'link', v: "JavaSE 进阶教程", href: "https://www.bilibili.com/video/BV163GGz2E8c" }, { t: 'text', v: " / " }, { t: 'link', v: "Git 协同教程", href: "https://www.bilibili.com/video/BV1ce4y1W7YB" }]],
        [[{ t: 'text', v: "阶段四" }], [{ t: 'text', v: "系统底层与数据基座" }], [{ t: 'text', v: "熟悉 Linux 服务端运维环境与 MySQL 数据库设计实战" }], [{ t: 'link', v: "小林coding 底座", href: "https://xiaolincoding.com/" }, { t: 'text', v: " / MySQL 综合练习题库" }]],
        [[{ t: 'text', v: "阶段五" }], [{ t: 'text', v: "企业级 Web 工程进阶" }], [{ t: 'text', v: "掌握 Maven 构建、MyBatis 持久层与三层架构开发规范" }], [{ t: 'link', v: "Gin/微服务实战", href: "https://www.bilibili.com/video/BV1gJ411p7xC" }, { t: 'text', v: " / 企业级三层架构模板" }]],
        [[{ t: 'text', v: "阶段六" }], [{ t: 'text', v: "真实工程实践与 AI 协作" }], [{ t: 'text', v: "参与生产级项目研发与学科竞赛，掌握智能化开发协作能力" }], [{ t: 'text', v: "智慧云杆 / 智学伴 AI 平台 / 矩阵计算器" }]],
        [[{ t: 'text', v: "进阶阶段" }], [{ t: 'text', v: "高年级深造与分流路线" }], [{ t: 'text', v: "面向就业攻坚微服务架构，或面向考研攻坚计算机 408 核心课" }], [{ t: 'link', v: "Go 项目演练", href: "https://www.bilibili.com/video/BV1BY4UefEkM" }, { t: 'text', v: " / 408 核心真题题库" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "技术成长周期与学习闭环" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "技术体系的建立是一个自底向上的螺旋上升过程。大一阶段重在筑基与建立工程视野，大二阶段重在企业级框架与业务系统实战，大三阶段则根据个人志向进入就业或考研的深化分支。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每个技术阶段均包含三个核心环节：概念认知与原理学习、大作业实战编码、以及骨干代码审查与交流。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "代码评审与能力沉淀" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每个阶段任务完成后，由高年级骨干进行代码审查与技术交流。审查重点关注代码规范性、逻辑严密性、异常健壮性与模块解耦度，帮助新成员及时发现认知盲区并持续改进。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "通过提交记录追踪与问题复盘，逐步培养对高质量代码的审美标准与工程素养。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-foundation',
    index: '02',
    category: 'setup',
    title: "语法启蒙",
    summary: "C 语言程序逻辑与指针内存控制，C++ 面向对象思想与核心数据结构。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐视频与学习资源" },
      { id: 'sec-2', text: "计算机科学通识与 CS50x 导论" },
      { id: 'sec-3', text: "C 语言逻辑与流程控制" },
      { id: 'sec-4', text: "指针运算与内存控制意识" },
      { id: 'sec-5', text: "C++ 面向对象编程思想" },
      { id: 'sec-6', text: "基础数据结构与算法训练" },
      { id: 'sec-7', text: "算法竞赛备赛与复杂度约束" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐视频与学习资源" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段一强烈推荐配合以下经典教学视频与刷题题单进行系统性练习：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "模块" }], [{ t: 'text', v: "推荐视频教程" }], [{ t: 'text', v: "BV 号 / 链接" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "编程通识必看" }], [{ t: 'link', v: "哈佛 CS50x 计算机科学通识导论", href: "https://www.bilibili.com/video/BV1Ls6BYkEGk" }], [{ t: 'code', v: "BV1Ls6BYkEGk" }, { t: 'text', v: " / " }, { t: 'link', v: "YouTube 原版", href: "https://www.youtube.com/watch?v=h6lqxDwUmJQ" }], [{ t: 'text', v: "计算机底层机制、内存管理、算法思维与问题解决模型" }]],
        [[{ t: 'text', v: "C 语言程序设计" }], [{ t: 'link', v: "C 语言入门精讲教程", href: "https://www.bilibili.com/video/BV1dr4y1n7vA" }], [{ t: 'code', v: "BV1dr4y1n7vA" }], [{ t: 'text', v: "变量作用域、函数封装、指针运算与动态内存分配" }]],
        [[{ t: 'text', v: "C++ 面向对象" }], [{ t: 'link', v: "C++ 现代面向对象与标准库", href: "https://www.bilibili.com/video/BV1FpWZemEMS" }], [{ t: 'code', v: "BV1FpWZemEMS" }], [{ t: 'text', v: "类与对象、封装继承多态、虚函数表与 STL 容器" }]],
        [[{ t: 'text', v: "算法竞赛训练" }], [{ t: 'link', v: "灵神算法基础精讲", href: "https://www.bilibili.com/video/BV1bP411c7oJ" }], [{ t: 'code', v: "BV1bP411c7oJ" }], [{ t: 'text', v: "二分查找、双指针、滑窗与动态规划经典题型" }]],
        [[{ t: 'text', v: "刷题题单" }], [{ t: 'link', v: "灵神经典算法题单", href: "https://github.com/EndlessCheng/EndlessCheng" }], [{ t: 'code', v: "开源题单" }], [{ t: 'text', v: "蓝桥杯与天梯赛高频考点分类训练" }]],
      ] },
    { kind: 'video', provider: 'youtube', id: "h6lqxDwUmJQ", title: "Harvard CS50x Introduction to Computer Science", bvid: "BV1Ls6BYkEGk" },
    { kind: 'h3', id: 'sec-2', text: "计算机科学通识与 CS50x 导论" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在深入具体语言语法之前，推荐先观看哈佛大学经典公开课 CS50x，建立对计算机科学全貌的整体认知。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "课程自底向上从二进制数据表示、硬件与 CPU 逻辑开始，引导开发者理解算法的时间复杂度、C 语言的指针内存分配，再延伸至数据结构与网络基础，培养严密的工程直觉。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "C 语言逻辑与流程控制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从 C 语言建立严密的程序设计思维，掌握变量声明、作用域、运算符优先级与分支循环控制流。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "通过函数拆分与模块化设计，将复杂业务问题拆解为可独立验证的功能子单元，形成清晰的函数调用边界。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "指针运算与内存控制意识" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解变量地址、指针变量以及直接寻址与间接寻址机制：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 概念对照：指针运算与内存地址偏移</span>\n<span class=\"tk-c\">// int* p = array; *(p + i) 等价于 array[i]</span>" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "理解栈内存与堆内存的区别：栈由系统自动分配和回收，函数调用时压栈、返回时出栈，执行效率极高但容量有限；堆由开发者通过动态分配函数手动申请与释放，生命周期由代码逻辑掌控，灵活性高但需严防内存泄漏、野指针与越界访问。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "C++ 面向对象编程思想" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从面向过程过渡到面向对象，理解类与对象的关系，掌握构造函数、析构函数与拷贝构造的生命周期管理。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握面向对象三大核心特性：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "封装" }, { t: 'text', v: "：隐藏内部数据细节，仅暴露规范的接口方法，保障对象内部状态一致性；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "继承" }, { t: 'text', v: "：通过基类派生实现逻辑复用与概念层级划分；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "多态" }, { t: 'text', v: "：通过虚函数与虚函数表实现动态绑定，使同一调用在不同派生类对象上表现出不同的具体行为。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "基础数据结构与算法训练" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "系统掌握线性结构与非线性结构：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "数据结构" }], [{ t: 'text', v: "核心操作与复杂度" }], [{ t: 'text', v: "典型应用场景" }]],
      rows: [
        [[{ t: 'text', v: "顺序表与链表" }], [{ t: 'text', v: "随机访问 O(1) 或 O(n) 插入删除" }], [{ t: 'text', v: "动态数据序列管理、LRU 缓存机制" }]],
        [[{ t: 'text', v: "栈与队列" }], [{ t: 'text', v: "O(1) 入栈出栈、先进先出排队" }], [{ t: 'text', v: "括号匹配、表达式求值、广度优先搜索" }]],
        [[{ t: 'text', v: "二叉树与哈希表" }], [{ t: 'text', v: "O(log n) 遍历查找、O(1) 哈希映射" }], [{ t: 'text', v: "目录层级检索、词频统计、高速索引查询" }]],
      ] },
    { kind: 'h3', id: 'sec-7', text: "算法竞赛备赛与复杂度约束" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "结合标准模板库容器（如 " }, { t: 'code', v: "std::vector" }, { t: 'text', v: "、" }, { t: 'code', v: "std::map" }, { t: 'text', v: "、" }, { t: 'code', v: "std::queue" }, { t: 'text', v: "）开展排序、二分查找、双指针、滑窗与动态规划专项训练。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在算法竞赛（如蓝桥杯、天梯赛）中，常规评测环境单秒允许执行操作次数约为 10 的 8 次方。在面对十万级数据规模时，算法需控制在 O(n log n) 或更低的时间复杂度，避免使用高阶嵌套循环。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-web-basics',
    index: '03',
    category: 'setup',
    title: "Web 视野",
    summary: "HTML5 语义化文档、CSS 布局体系与 JavaScript 异步交互设计。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐视频与学习路线" },
      { id: 'sec-2', text: "HTML5 语义化文档结构" },
      { id: 'sec-3', text: "CSS 盒子模型与现代布局" },
      { id: 'sec-4', text: "JavaScript 核心机制与事件流" },
      { id: 'sec-5', text: "事件循环与异步接口请求" },
      { id: 'sec-6', text: "经典组件设计实践" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐视频与学习路线" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段二全员统一学习以下四套经典视频教程，配合大作业实践：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "模块" }], [{ t: 'text', v: "推荐视频教程" }], [{ t: 'text', v: "BV 号" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "HTML5" }], [{ t: 'link', v: "HTML5 基础精讲", href: "https://www.bilibili.com/video/BV1BrBiYNEWg" }], [{ t: 'code', v: "BV1BrBiYNEWg" }], [{ t: 'text', v: "语义化标签、文档大纲与多媒体元素" }]],
        [[{ t: 'text', v: "CSS" }], [{ t: 'link', v: "CSS 样式与布局实战", href: "https://www.bilibili.com/video/BV1sQeEzFEKi" }], [{ t: 'code', v: "BV1sQeEzFEKi" }], [{ t: 'text', v: "盒子模型、弹性布局与多端响应式适配" }]],
        [[{ t: 'text', v: "JavaScript" }], [{ t: 'link', v: "JavaScript 核心机制与 DOM", href: "https://www.bilibili.com/video/BV15L4y1a7or" }], [{ t: 'code', v: "BV15L4y1a7or" }], [{ t: 'text', v: "基础语法、DOM/BOM 接口与事件驱动模型" }]],
        [[{ t: 'text', v: "JS 进阶" }], [{ t: 'link', v: "JavaScript 深入与进阶", href: "https://www.bilibili.com/video/BV1iHtozkEWx" }], [{ t: 'code', v: "BV1iHtozkEWx" }], [{ t: 'text', v: "闭包、原型链、异步 Promise 与函数式编程" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "HTML5 语义化文档结构" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握 HTML5 规范，合理使用语义化标签组织页面内容：" }],
    ] },
    { kind: 'code', lang: '', html: "&lt;!-- 推荐页面层级结构 --&gt;\n&lt;header&gt; 导航与品牌信息 &lt;/header&gt;\n&lt;main&gt; 页面核心内容区 &lt;/main&gt;\n&lt;aside&gt; 辅助侧边栏 &lt;/aside&gt;\n&lt;footer&gt; 版权与页脚链接 &lt;/footer&gt;" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "语义化结构有助于提高代码可读性，在搜索引擎抓取与无障碍辅助设备（读屏器）访问时提供清晰的语义大纲。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "CSS 盒子模型与现代布局" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "理解标准盒子模型与 IE 盒子模型的宽高计算差异：标准盒子模型的宽度仅包含内容区，而边框盒子模型将内容、内边距与边框合并计入总宽度。推荐全局设置 " }, { t: 'code', v: "box-sizing: border-box" }, { t: 'text', v: "，使尺寸计算符合直觉。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握现代两大核心布局方案：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "弹性布局" }, { t: 'text', v: "：通过主轴（" }, { t: 'code', v: "justify-content" }, { t: 'text', v: "）与交叉轴（" }, { t: 'code', v: "align-items" }, { t: 'text', v: "）精准控制一维轴线上的元素对齐与空间伸缩；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "网格布局" }, { t: 'text', v: "：通过二维行列划分（" }, { t: 'code', v: "grid-template-columns" }, { t: 'text', v: " 与 " }, { t: 'code', v: "fr" }, { t: 'text', v: " 弹性单位）实现复杂多列排版，结合媒体查询实现多端响应式适配。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "JavaScript 核心机制与事件流" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "理解文档对象模型（DOM）树形结构，掌握节点查询、属性修改与动态渲染。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解 DOM 事件流的三个阶段：事件捕获阶段、处于目标阶段与事件冒泡阶段。合理使用事件委托机制，将多个子元素的事件统一挂载在父节点上监听，大幅降低内存消耗与 DOM 绑定开销。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "事件循环与异步接口请求" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "理解浏览器单线程事件循环（Event Loop）机制：调用栈同步代码执行完毕后，优先清空微任务队列（如 " }, { t: 'code', v: "Promise.then" }, { t: 'text', v: "、" }, { t: 'code', v: "queueMicrotask" }, { t: 'text', v: "），再取出宏任务队列（如 " }, { t: 'code', v: "setTimeout" }, { t: 'text', v: "、I/O 事件）中的回调执行。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "熟练使用 Promise 与 " }, { t: 'code', v: "async/await" }, { t: 'text', v: " 语法编排异步调用流，利用 Fetch API 发起网络请求，统一校验 HTTP 响应状态码并解析 JSON 数据结构。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "经典组件设计实践" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "组件设计需兼顾业务场景契合度与视觉克制：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "以轮播图组件为例，在品牌官网适合作为首页主视觉传递品牌心智，在电商页面适合用于商品多图切换，在管理后台与数据看板中则应保持克制，优先保障数据展示密度与查阅效率。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-specialization',
    index: '04',
    category: 'setup',
    title: "方向分流",
    summary: "JavaSE 企业级面向对象与持久化设计，Python 智能脚本与数据处理。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐视频与方向学习" },
      { id: 'sec-2', text: "方向定位与分流路径" },
      { id: 'sec-3', text: "JavaSE 集合框架与底层原理" },
      { id: 'sec-4', text: "策略排序与实体解耦" },
      { id: 'sec-5', text: "自定义结构化文件持久化" },
      { id: 'sec-6', text: "业务异常分层与结构化日志" },
      { id: 'sec-7', text: "Python 脚本与数据处理" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐视频与方向学习" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段三根据选定技术路线深入学习对应核心教程：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "模块" }], [{ t: 'text', v: "推荐视频教程" }], [{ t: 'text', v: "BV 号" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "JavaSE 路线" }], [{ t: 'link', v: "JavaSE 零基础到进阶", href: "https://www.bilibili.com/video/BV163GGz2E8c" }], [{ t: 'code', v: "BV163GGz2E8c" }], [{ t: 'text', v: "类与对象、集合框架、I/O 流、异常体系与多线程" }]],
        [[{ t: 'text', v: "Go 语言拓展" }], [{ t: 'link', v: "Go 语言入门实战", href: "https://www.bilibili.com/video/BV1gf4y1r79E" }], [{ t: 'code', v: "BV1gf4y1r79E" }], [{ t: 'text', v: "协程并发、Channel 通道、接口类型与服务端开发" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "方向定位与分流路径" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "依据工程兴趣与技术发展方向进入专项攻坚：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "方向" }], [{ t: 'text', v: "核心技术栈" }], [{ t: 'text', v: "目标定位" }]],
      rows: [
        [[{ t: 'text', v: "企业级全栈" }], [{ t: 'text', v: "Java、Spring Boot、Vue 3" }], [{ t: 'text', v: "面向企业级业务系统与微服务架构" }]],
        [[{ t: 'text', v: "智能与数据" }], [{ t: 'text', v: "Python、FastAPI、PyTorch" }], [{ t: 'text', v: "面向数据处理、自动化脚本与智能体工程" }]],
      ] },
    { kind: 'h3', id: 'sec-3', text: "JavaSE 集合框架与底层原理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解 Java 集合框架三大分支：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "List 序列" }, { t: 'text', v: "：对比 " }, { t: 'code', v: "ArrayList" }, { t: 'text', v: "（连续内存数组、扩容倍率 1.5、支持 O(1) 随机访问）与 " }, { t: 'code', v: "LinkedList" }, { t: 'text', v: "（双向链表、插入删除高效）；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "Set 集" }, { t: 'text', v: "：基于哈希表实现的 " }, { t: 'code', v: "HashSet" }, { t: 'text', v: " 去重机制与不可重复特性；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "Map 映射" }, { t: 'text', v: "：深入 " }, { t: 'code', v: "HashMap" }, { t: 'text', v: " 底层数组加链表加红黑树结构，理解哈希桶取模、哈希冲突拉链法与阈值树化机制。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "策略排序与实体解耦" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握多策略排序设计规范：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "通过实体类实现 " }, { t: 'code', v: "Comparable" }, { t: 'text', v: " 接口定义默认的自然排序规则；在面对多变维度的业务排序需求时，通过向排序方法注入独立的 " }, { t: 'code', v: "Comparator" }, { t: 'text', v: " 比较器，实现排序算法策略与具体业务实体的彻底解耦。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "自定义结构化文件持久化" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在单机学习阶段掌握文件输入输出流（I/O），定义清晰的结构化文本存储格式，使用明确的分隔符区分字段，避免直接将对象的 " }, { t: 'code', v: "toString()" }, { t: 'text', v: " 写入文件。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "文件读取解析逻辑需具备健壮的异常处理与容错机制：在遇到文件缺失、行字段缺失或数值格式错误时提供安全兜底数据，避免因单行脏数据导致整个程序崩溃。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "业务异常分层与结构化日志" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "建立清晰的分层异常处理机制：在业务层主动抛出携带明确业务状态码的自定义异常，在交互层或全局异常处理器中集中捕获并转换为友好的提示信息。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对数据的新增、修改、删除等关键操作输出结构化操作日志，统一采用追加模式写入存储，并对密码与手机号等敏感信息进行脱敏过滤。" }],
    ] },
    { kind: 'h3', id: 'sec-7', text: "Python 脚本与数据处理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "学习 Python 动态类型语法、列表推导式与生成器机制，掌握标准库与数据处理模块。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "结合轻量接口框架（如 FastAPI）编写自动化数据处理、文本清洗与智能体工作流脚本。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-system-database',
    index: '05',
    category: 'setup',
    title: "系统与数据",
    summary: "Linux 服务端操作系统环境与 MySQL 关系型数据库实战。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐学习资源与八股参考" },
      { id: 'sec-2', text: "Linux 用户权限与系统运维" },
      { id: 'sec-3', text: "关系型数据库范式与表结构设计" },
      { id: 'sec-4', text: "复杂 SQL 编写与事务 ACID 特性" },
      { id: 'sec-5', text: "B+ 树索引原理与慢查询优化" },
      { id: 'sec-6', text: "参数化查询与安全防线" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐学习资源与八股参考" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段四推荐结合系统命令与数据库实战进行深度练习：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "领域" }], [{ t: 'text', v: "推荐学习资源" }], [{ t: 'text', v: "资源形式" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "底层与网络" }], [{ t: 'link', v: "小林coding 计算机底座", href: "https://xiaolincoding.com/" }], [{ t: 'text', v: "体系化图解" }], [{ t: 'text', v: "操作系统调度、进程线程、TCP/IP 网络协议与 MySQL 索引" }]],
        [[{ t: 'text', v: "数据库实战" }], [{ t: 'text', v: "社团 MySQL 综合训练题库" }], [{ t: 'text', v: "内部练习题" }], [{ t: 'text', v: "多表关联、分组聚合、子查询与事务边界控制" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "Linux 用户权限与系统运维" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "熟练掌握 Linux 权限体系与常用运维命令：" }],
    ] },
    { kind: 'code', lang: '', html: "权限三段位（rwx）：读(4)、写(2)、执行(1)\n八进制组合：755 (所有者 rwx / 群组 r-x / 其他 r-x)\n           644 (所有者 rw- / 群组 r-- / 其他 r--)" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握基于 " }, { t: 'code', v: "systemd" }, { t: 'text', v: " 的后台服务管理机制，通过 " }, { t: 'code', v: "systemctl" }, { t: 'text', v: " 控制服务启动、停止、重载与开机自启；使用 " }, { t: 'code', v: "ps" }, { t: 'text', v: " 与 " }, { t: 'code', v: "top" }, { t: 'text', v: " 监控系统进程资源，结合 " }, { t: 'code', v: "curl" }, { t: 'text', v: " 与 " }, { t: 'code', v: "ss" }, { t: 'text', v: " 排查端口占用与网络连通性。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "关系型数据库范式与表结构设计" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握关系数据库设计三大范式：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "第一范式（1NF）" }, { t: 'text', v: "：属性具有原子性，不可再拆分；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "第二范式（2NF）" }, { t: 'text', v: "：消除非主属性对主键的部分依赖；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "第三范式（3NF）" }, { t: 'text', v: "：消除非主属性对主键的传递依赖。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "合理设计字段类型（如整数、定点数 " }, { t: 'code', v: "DECIMAL" }, { t: 'text', v: "、变长字符串 " }, { t: 'code', v: "VARCHAR" }, { t: 'text', v: "），关键业务字段标注非空约束并设定合理的默认值。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "复杂 SQL 编写与事务 ACID 特性" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "熟练编写多表内连接（" }, { t: 'code', v: "INNER JOIN" }, { t: 'text', v: "）、左外连接（" }, { t: 'code', v: "LEFT JOIN" }, { t: 'text', v: "）以及嵌套子查询，灵活运用 " }, { t: 'code', v: "GROUP BY" }, { t: 'text', v: " 与 " }, { t: 'code', v: "HAVING" }, { t: 'text', v: " 过滤聚合统计结果。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解数据库事务四大特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）与持久性（Durability）。理解读未提交、读已提交、可重复读与串行化四种隔离级别，掌握脏读、不可重复读与幻读的产生机理与防范方案。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "B+ 树索引原理与慢查询优化" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解 MySQL InnoDB 存储引擎的 B+ 树索引结构：叶子节点通过双向链表串联，支持高效的高速点查与范围扫描。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "区分聚簇索引（数据行直接存放在叶子节点）与二级索引（叶子节点存放主键值）。优先利用覆盖索引减少回表开销；通过 " }, { t: 'code', v: "EXPLAIN" }, { t: 'text', v: " 分析执行计划中的 " }, { t: 'code', v: "type" }, { t: 'text', v: "、" }, { t: 'code', v: "key" }, { t: 'text', v: " 与 " }, { t: 'code', v: "rows" }, { t: 'text', v: " 字段，精准定位索引失效与慢查询瓶颈。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "参数化查询与安全防线" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在数据访问层统一采用预编译语句（PreparedStatement）或参数化查询接口，严禁直接拼接 SQL 字符串，从架构根源彻底杜绝 SQL 注入漏洞。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-enterprise-web',
    index: '06',
    category: 'setup',
    title: "企业级 Web",
    summary: "Maven 依赖构建、MyBatis 持久层与 Controller-Service-Mapper 三层架构。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐视频与框架进阶" },
      { id: 'sec-2', text: "Maven 构建与依赖仲裁机制" },
      { id: 'sec-3', text: "Controller-Service-Mapper 三层分层架构" },
      { id: 'sec-4', text: "持久层框架与动态 SQL" },
      { id: 'sec-5', text: "RESTful API 规范与统一协议封装" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐视频与框架进阶" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段五推荐结合以下主流框架与实战视频深入理解工程化 Web 架构：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "模块" }], [{ t: 'text', v: "推荐视频教程" }], [{ t: 'text', v: "BV 号" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "框架开发" }], [{ t: 'link', v: "Gin 框架与后端微服务", href: "https://www.bilibili.com/video/BV1gJ411p7xC" }], [{ t: 'code', v: "BV1gJ411p7xC" }], [{ t: 'text', v: "RESTful 路由、中间件设计与数据库连接池" }]],
        [[{ t: 'text', v: "项目演练" }], [{ t: 'link', v: "企业级后端项目开发演练", href: "https://www.bilibili.com/video/BV1BY4UefEkM" }], [{ t: 'code', v: "BV1BY4UefEkM" }], [{ t: 'text', v: "业务建模、分层架构落地与接口联合调试" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "Maven 构建与依赖仲裁机制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握 Maven 坐标体系（" }, { t: 'code', v: "GroupId" }, { t: 'text', v: "、" }, { t: 'code', v: "ArtifactId" }, { t: 'text', v: "、" }, { t: 'code', v: "Version" }, { t: 'text', v: "），通过 " }, { t: 'code', v: "pom.xml" }, { t: 'text', v: " 集中管理项目第三方组件依赖。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握 Maven 标准生命周期（" }, { t: 'code', v: "clean" }, { t: 'text', v: "、" }, { t: 'code', v: "compile" }, { t: 'text', v: "、" }, { t: 'code', v: "test" }, { t: 'text', v: "、" }, { t: 'code', v: "package" }, { t: 'text', v: "、" }, { t: 'code', v: "install" }, { t: 'text', v: "），深入理解依赖传递与版本冲突仲裁规则：遵循“路径最短优先”与“先声明优先”原则，必要时通过 " }, { t: 'code', v: "<exclusions>" }, { t: 'text', v: " 手动排除冲突依赖。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "Controller-Service-Mapper 三层分层架构" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "企业级 Web 工程采用严格的职责分层体系：" }],
    ] },
    { kind: 'code', lang: '', html: "controller   接收并校验请求入参（DTO），组装 HTTP 协议响应（VO）\nservice      封装核心业务规则，控制事务边界（@Transactional）\nmapper       执行数据库 CRUD 操作，映射数据持久化对象（Entity）" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "明确区分数据对象模型：入参传输对象（DTO）、持久化实体（Entity）以及视图呈现对象（VO）。控制层通过业务接口间接调用数据访问，避免跨层直接操作数据库。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "持久层框架与动态 SQL" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握 MyBatis / MyBatis-Plus 数据持久层开发，利用 XML 映射或注解编写类型安全的 SQL。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "熟练运用 " }, { t: 'code', v: "<if>" }, { t: 'text', v: "、" }, { t: 'code', v: "<where>" }, { t: 'text', v: "、" }, { t: 'code', v: "<foreach>" }, { t: 'text', v: " 等标签组装动态 SQL 条件。理解 MyBatis 一级缓存（SqlSession 级别）与二级缓存（Namespace 级别）的工作原理与失效条件。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "合理利用 Lombok 工具库（如 " }, { t: 'code', v: "@Getter" }, { t: 'text', v: "、" }, { t: 'code', v: "@Setter" }, { t: 'text', v: "、" }, { t: 'code', v: "@Builder" }, { t: 'text', v: "、" }, { t: 'code', v: "@RequiredArgsConstructor" }, { t: 'text', v: "）消除样板代码，提升工程整洁度。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "RESTful API 规范与统一协议封装" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "遵循 RESTful 规范组织接口 URI 资源路径与 HTTP 动词：" }],
    ] },
    { kind: 'code', lang: '', html: "GET    /api/users       查询用户列表\nPOST   /api/users       创建新用户\nPUT    /api/users/{id}  更新指定用户\nDELETE /api/users/{id}  删除指定用户" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "接口返回统一包装结构（如 " }, { t: 'code', v: "ApiResponse<T>" }, { t: 'text', v: "），明确区分传输层 HTTP 状态码（200、400、401、403、500）与业务层错误码（" }, { t: 'code', v: "code" }, { t: 'text', v: " 与 " }, { t: 'code', v: "message" }, { t: 'text', v: "），为前端提供一致的联调体验。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-practice-ai',
    index: '07',
    category: 'setup',
    title: "工程与 AI",
    summary: "真实业务项目研发、学科竞赛牵引与 AI 智能体提效原则。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐拓展与 Agent 学习" },
      { id: 'sec-2', text: "重点生产级项目实战梯队" },
      { id: 'sec-3', text: "现代研发协同与规范交付" },
      { id: 'sec-4', text: "基础先行与理解驱动原则" },
      { id: 'sec-5', text: "AI 智能体协作与认知放大" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐拓展与 Agent 学习" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段六推荐参考以下智能化开发与 Agent 学习资源：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "领域" }], [{ t: 'text', v: "推荐学习资源" }], [{ t: 'text', v: "资源形式" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "AI Agent" }], [{ t: 'link', v: "Learn Claude Code 教程", href: "https://learn.shareai.run/zh/" }], [{ t: 'text', v: "在线实践手册" }], [{ t: 'text', v: "智能体交互、Tool Use 工具调用与上下文工程" }]],
        [[{ t: 'text', v: "协同脚手架" }], [{ t: 'link', v: "AI Agent 开源脚手架", href: "https://github.com/peakxy/ai-agent-scaffold-go" }], [{ t: 'text', v: "开源工程项目" }], [{ t: 'text', v: "智能体架构搭建与工作流自动化编排" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "重点生产级项目实战梯队" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "通过真实项目承接技术训练，打通从代码语法到生产交付的完整工程链路：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目名称" }], [{ t: 'text', v: "技术栈特点" }], [{ t: 'text', v: "核心架构与业务场景" }]],
      rows: [
        [[{ t: 'text', v: "智慧云杆管理平台" }], [{ t: 'text', v: "物联网传感、设备遥测、工单流转" }], [{ t: 'text', v: "南阳试点部署，基于 MQTT 协议实现智能照明与环境传感数据实时采集与遥测流转" }]],
        [[{ t: 'text', v: "智学伴 AI 平台" }], [{ t: 'text', v: "Vue 3、TypeScript、Express、大模型 API" }], [{ t: 'text', v: "基于检索增强生成（RAG）与流式响应（SSE），为低年级成员提供个性化智能答疑辅助" }]],
        [[{ t: 'text', v: "矩阵计算器" }], [{ t: 'text', v: "BigInt 有理数内核、Bareiss 算法" }], [{ t: 'text', v: "采用高精度分数内核与 Bareiss 整数算法，实现零浮点误差的高精度线性代数运算" }]],
      ] },
    { kind: 'h3', id: 'sec-3', text: "现代研发协同与规范交付" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在新项目中体验标准工程化协同流程：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "1. " }, { t: 'strong', v: "需求拆解与接口契约" }, { t: 'text', v: "：明确功能范围与 OpenAPI 数据结构；" }],
      [{ t: 'text', v: "2. " }, { t: 'strong', v: "分支协作与增量开发" }, { t: 'text', v: "：遵循 Git 分支规范与原子提交；" }],
      [{ t: 'text', v: "3. " }, { t: 'strong', v: "自动化测试与代码评审" }, { t: 'text', v: "：核心逻辑覆盖单元测试，开展跨年级代码审查；" }],
      [{ t: 'text', v: "4. " }, { t: 'strong', v: "持续集成与部署" }, { t: 'text', v: "：打通自动化构建与线上部署流水线。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "基础先行与理解驱动原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "严格坚持“先打牢扎实基础，再引入智能工具”的协作准则：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在充分理解语言底层、网络协议、框架机制与架构设计的前提下使用 AI 工具。开发者需对智能体生成的每一行代码具备解释、调试与重构能力，严禁将未经验证的代码直接引入生产项目。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "AI 智能体协作与认知放大" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "AI 是专业知识的放大器，其产出上限取决于开发者的技术认知深度：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "结构化上下文" }, { t: 'text', v: "：清晰描述业务边界、技术栈限制与预期输入输出；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "分步推演与验证" }, { t: 'text', v: "：将复杂需求拆解为可独立验证的子步骤，引导模型逐步推导；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "主动审校与纠偏" }, { t: 'text', v: "：时刻保持审慎态度，对模型输出的边界条件与异常分支进行严格核查。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-senior-split',
    index: '08',
    category: 'setup',
    title: "高年级分流",
    summary: "大三分流规划：就业微服务高并发体系与考研计算机 408 核心课攻坚。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "推荐求职与进阶参考" },
      { id: 'sec-2', text: "大三分流双轨规划" },
      { id: 'sec-3', text: "就业工程分支：微服务与高并发中间件" },
      { id: 'sec-4', text: "考研深造分支：计算机 408 核心课攻坚" },
      { id: 'sec-5', text: "资料共享打卡与科研竞赛赋能" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐求职与进阶参考" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "高年级阶段推荐参考以下备战求职与深造资源：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "领域" }], [{ t: 'text', v: "推荐学习资源" }], [{ t: 'text', v: "资源形式" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "面试真题" }], [{ t: 'link', v: "CodeTop 面试算法真题", href: "https://codetop.cc/home" }], [{ t: 'text', v: "真题检索平台" }], [{ t: 'text', v: "大厂高频算法考察题型与解题策略" }]],
        [[{ t: 'text', v: "底层实战" }], [{ t: 'link', v: "七日实现分布式缓存", href: "https://geektutu.com/post/geecache.html" }], [{ t: 'text', v: "实战手写系列" }], [{ t: 'text', v: "一致性哈希、LRU 缓存淘汰与并发控制" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "大三分流双轨规划" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "进入大三阶段后，依据个人长远目标进入专业化发展分支：" }],
    ] },
    { kind: 'code', lang: '', html: "           ┌─── 就业方向：微服务架构、高并发中间件与分布式工程\n大三分流 ──┤\n           └─── 考研方向：计算机 408 核心专业课、科研与学科竞赛" },
    { kind: 'h3', id: 'sec-3', text: "就业工程分支：微服务与高并发中间件" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "持续深耕主流企业级高并发架构体系：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "微服务治理" }, { t: 'text', v: "：Spring Boot 与 Spring Cloud 服务注册发现、网关路由与分布式配置管理；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "Redis 分布式缓存" }, { t: 'text', v: "：深入理解缓存穿透（布隆过滤器与空值缓存）、击穿（互斥锁与逻辑过期）、雪崩（随机 TTL）应对策略；掌握基于 Redisson 的分布式锁实现与看门狗自动续期机制；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "RabbitMQ 消息中间件" }, { t: 'text', v: "：掌握生产者确认机制、消费者手动确认（ACK）、死信队列处理以及基于唯一消息 ID 的幂等消费设计；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "安全与鉴权体系" }, { t: 'text', v: "：掌握 Spring Security 框架、JWT 无状态令牌认证与基于角色的访问控制（RBAC）模型。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "考研深造分支：计算机 408 核心课攻坚" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "系统攻坚全国统考计算机学科专业基础（408）四门核心课程：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "数据结构" }, { t: 'text', v: "：深入树与图的高级算法（Dijkstra 最短路径、Kruskal 最小生成树、拓扑排序）及经典内部排序算法；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "计算机组成原理" }, { t: 'text', v: "：IEEE 754 浮点数表示、流水线冲突与冒险、Cache-主存组相联映射机制及 TLB 快表寻址；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "操作系统" }, { t: 'text', v: "：进程线程状态流转与死锁避免（银行家算法）、虚拟内存分页置换（LRU/FIFO）与文件系统 Inode 索引结构；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "计算机网络" }, { t: 'text', v: "：TCP 三次握手与四次挥手状态机、拥塞控制算法（慢启动、拥塞避免、快重传、快恢复）以及 HTTPS TLS 握手握签原理。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "资料共享打卡与科研竞赛赋能" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "建立社团内部考研资料共享库与真题交流圈，推行每日学习打卡与定期模拟研讨机制，促进跨年级经验传承。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "引导有志深造的成员参与深度学习、机器视觉等科研与学科竞赛课题（如光伏板缺陷智能检测），产出学术成果与工程原型，为研究生初试复试积累扎实背景。" }],
    ] },
    ],
  },
  {
    slug: 'env-setup',
    index: '09',
    category: 'setup',
    title: "环境与工具",
    summary: "开发环境选型、运行时矩阵与工程配置规范。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "开发工具与 IDE 选型" },
      { id: 'sec-2', text: "运行时矩阵与版本管理" },
      { id: 'sec-3', text: "依赖锁定与确定性构建" },
      { id: 'sec-4', text: "换行符跨平台一致性" },
      { id: 'sec-5', text: "敏感配置与环境变量隔离" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "开发工具与 IDE 选型" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "选择适合当前技术栈的集成开发环境：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "工具" }], [{ t: 'text', v: "适用技术栈" }], [{ t: 'text', v: "核心优势" }]],
      rows: [
        [[{ t: 'text', v: "Visual Studio Code" }], [{ t: 'text', v: "前端开发、Python 脚本、Markdown 文档" }], [{ t: 'text', v: "启动迅速、插件生态丰富、多语言支持完善" }]],
        [[{ t: 'text', v: "IntelliJ IDEA" }], [{ t: 'text', v: "JavaSE、Spring Boot 企业级开发" }], [{ t: 'text', v: "深度语法静态分析、重构支持强劲、Maven 整合完善" }]],
        [[{ t: 'text', v: "Git 客户端" }], [{ t: 'text', v: "版本控制与团队协同" }], [{ t: 'text', v: "推荐配合终端命令行或 IDE 内置 Git 树状视图使用" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "运行时矩阵与版本管理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "推荐采用主流长期支持（LTS）版本，保持开发环境与生产环境的一致性：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 推荐运行时版本</span>\n<span class=\"tk-k\">Node.js</span>   &gt;= 20.x LTS   <span class=\"tk-c\"># 前端构建与工具链</span>\n<span class=\"tk-k\">JDK</span>       &gt;= <span class=\"tk-s\">17</span> LTS     <span class=\"tk-c\"># Java 后端开发环境</span>\n<span class=\"tk-k\">Python</span>    &gt;= <span class=\"tk-s\">3.10</span>       <span class=\"tk-c\"># 智能脚本与数据处理</span>" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "推荐使用版本管理工具（如前端使用 " }, { t: 'code', v: "fnm" }, { t: 'text', v: " 或 " }, { t: 'code', v: "nvm" }, { t: 'text', v: "，Python 使用 " }, { t: 'code', v: "venv" }, { t: 'text', v: " 或 " }, { t: 'code', v: "conda" }, { t: 'text', v: "）进行多版本隔离，避免全局环境污染。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "依赖锁定与确定性构建" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "项目中必须包含依赖锁定文件（如 " }, { t: 'code', v: "package-lock.json" }, { t: 'text', v: " 或 " }, { t: 'code', v: "pom.xml" }, { t: 'text', v: "）：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "依赖锁定文件精确记录了每个依赖包的完整版本号与哈希校验和，能够确保团队所有成员以及持续集成服务器在执行安装时获得完全一致的依赖树，消除由于微版本漂移带来的不可预期缺陷。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "换行符跨平台一致性" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "为避免 Windows 系统（CRLF）与 Linux/macOS 系统（LF）之间的换行符冲突，建议在代码仓库根目录维护 " }, { t: 'code', v: ".gitattributes" }, { t: 'text', v: " 文件：" }],
    ] },
    { kind: 'code', lang: '', html: "# 统一代码换行符为 LF\n* text=auto eol=lf" },
    { kind: 'h3', id: 'sec-5', text: "敏感配置与环境变量隔离" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "项目中的数据库密码、接口密钥与私有令牌严禁直接硬编码在代码文件中。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "建议通过 " }, { t: 'code', v: ".env" }, { t: 'text', v: " 环境变量文件进行本地注入，并将 " }, { t: 'code', v: ".env" }, { t: 'text', v: " 列入 " }, { t: 'code', v: ".gitignore" }, { t: 'text', v: " 排除列表；同时在仓库中维护不包含敏感信息的 " }, { t: 'code', v: ".env.example" }, { t: 'text', v: " 模板文件，供团队成员克隆后参考配置。" }],
    ] },
    ],
  },
  {
    slug: 'first-week',
    index: '10',
    category: 'setup',
    title: "第一周",
    summary: "新人首周熟悉节奏、微型任务认领与高效提问沟通方法。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "新人首周节奏规划" },
      { id: 'sec-2', text: "项目快速上手与代码走读" },
      { id: 'sec-3', text: "认领任务与小颗粒提交" },
      { id: 'sec-4', text: "高效排错与提问三要素" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "新人首周节奏规划" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "为帮助新成员平稳融入团队工程节奏，推荐参考以下阶段规划：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "阶段" }], [{ t: 'text', v: "核心任务" }], [{ t: 'text', v: "关键交付物" }]],
      rows: [
        [[{ t: 'text', v: "第 1~2 天" }], [{ t: 'text', v: "环境配置与工程跑通" }], [{ t: 'text', v: "完成本地 IDE 与运行时配置，跑通项目本地开发服务器" }]],
        [[{ t: 'text', v: "第 3~4 天" }], [{ t: 'text', v: "代码走读与架构梳理" }], [{ t: 'text', v: "阅读模块目录与接口定义，绘制核心业务调用链路简图" }]],
        [[{ t: 'text', v: "第 5~6 天" }], [{ t: 'text', v: "认领微型任务并小步提交" }], [{ t: 'text', v: "认领初学者友好 Issue，完成小颗粒度功能或修复并提 PR" }]],
        [[{ t: 'text', v: "第 7 天" }], [{ t: 'text', v: "参与代码审查与经验复盘" }], [{ t: 'text', v: "响应评审意见并迭代修改，记录首周技术心得与踩坑笔记" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "项目快速上手与代码走读" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "克隆代码仓库后，首先阅读项目 " }, { t: 'code', v: "README.md" }, { t: 'text', v: " 与文档中心，了解技术选型与目录结构。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在本地成功执行构建与测试命令，确认基础开发环境正常。走读代码时遵循“从入口到数据层”的主线：从路由定义出发，追踪到控制层、业务逻辑层与数据持久层，梳理清晰的调用流。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "认领任务与小颗粒提交" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "优先认领标记有初学者友好（" }, { t: 'code', v: "good-first-issue" }, { t: 'text', v: "）的微型任务，如文案调整、基础参数校验或简单单元测试编写。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "开发过程中遵循“小步快跑”原则：每完成一个独立的功能点即进行一次原子提交，避免在最后阶段一次性提交大量代码，降低代码审查难度。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "高效排错与提问三要素" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在遇到技术阻碍时，鼓励先通过阅读错误日志、查阅官方文档与断点调试尝试独立排查。如需向骨干求助，建议按照以下三要素清晰组织问题：" }],
    ] },
    { kind: 'code', lang: '', html: "1. 目标与异常现象：明确预期效果与当前实际报错\n2. 最小复现路径：操作系统、运行时版本与触发步骤\n3. 已尝试排查方案：已阅读的日志、尝试过的修改与推测方向" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提供清晰的错误堆栈信息与上下文代码，能够大幅提升团队协作与问题定位效率。" }],
    ] },
    ],
  },
  {
    slug: 'git-flow',
    index: '11',
    category: 'convention',
    title: "分支与提交",
    summary: "分支命名规范、原子提交习惯与 PR 流转机制。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "推荐视频教程" },
      { id: 'sec-2', text: "Git 底层对象与状态流转模型" },
      { id: 'sec-3', text: "分支管理策略与命名规范" },
      { id: 'sec-4', text: "提交记录原子性与 Conventional Commits 规范" },
      { id: 'sec-5', text: "合并请求流程与敏感数据脱敏" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "推荐视频教程" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Git 是团队多人协同的工程基石，推荐学习以下完整视频：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "模块" }], [{ t: 'text', v: "推荐视频教程" }], [{ t: 'text', v: "BV 号" }], [{ t: 'text', v: "核心学习重点" }]],
      rows: [
        [[{ t: 'text', v: "Git 基础与协作" }], [{ t: 'link', v: "Git 版本控制与协同实战", href: "https://www.bilibili.com/video/BV1ce4y1W7YB" }], [{ t: 'code', v: "BV1ce4y1W7YB" }], [{ t: 'text', v: "工作区/暂存区模型、分支合并、冲突解决与远程推送" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "Git 底层对象与状态流转模型" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "深入理解 Git 的底层存储机制：" }],
    ] },
    { kind: 'code', lang: '', html: "Blob 对象   存储文件具体内容与哈希值\nTree 对象   记录目录树结构与文件名映射\nCommit 对象 记录快照树指针、父提交引用、作者信息与提交说明" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握代码在四大区域之间的流转：工作区（Working Directory）进行文件修改，通过 " }, { t: 'code', v: "git add" }, { t: 'text', v: " 收集至暂存区（Index），通过 " }, { t: 'code', v: "git commit" }, { t: 'text', v: " 生成本地提交历史，最终通过 " }, { t: 'code', v: "git push" }, { t: 'text', v: " 同步至远程共享仓库。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "分支管理策略与命名规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "推荐的分支命名约定：" }],
    ] },
    { kind: 'code', lang: '', html: "feat/&lt;简短模块名&gt;     新功能或特性开发\nfix/&lt;简短问题名&gt;      缺陷与 Bug 修复\nchore/&lt;维护任务名&gt;    依赖升级、构建配置调整\ndocs/&lt;文档篇目名&gt;     文档编写与更新" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "所有日常开发均应基于最新的主分支（" }, { t: 'code', v: "main" }, { t: 'text', v: "）检出特性分支进行，开发测试完成后通过发起合并请求（PR）并入主干，避免直接向主分支推送提交。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "提交记录原子性与 Conventional Commits 规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "遵循小步多次提交原则，保证每个提交记录仅包含一个独立的逻辑变更。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提交信息推荐采用 Conventional Commits 规范，结构清晰表述变更意图：" }],
    ] },
    { kind: 'code', lang: '', html: "feat(auth): 增加用户登录参数格式校验\nfix(table): 修复移动端表格数据溢出遮挡\nrefactor(user): 抽取通用权限校验中间件" },
    { kind: 'h3', id: 'sec-5', text: "合并请求流程与敏感数据脱敏" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "发起合并请求时，说明文档建议包含三项核心内容：改动内容、改动原因、验证方式与测试结果。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "涉及前端界面调整时建议附带操作录屏或前后对比截图；截图前需对真实姓名、学号、手机号及线上密钥等敏感数据进行严格脱敏处理。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "团队共享仓库的主分支建议开启分支保护，禁用强制推送（" }, { t: 'code', v: "git push --force" }, { t: 'text', v: "），保障版本演进历史的完整可追溯。" }],
    ] },
    ],
  },
  {
    slug: 'frontend',
    index: '12',
    category: 'convention',
    title: "前端约定",
    summary: "TypeScript 类型约束、目录真源、设计令牌与状态下沉规范。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "TypeScript 严格模式与类型约束" },
      { id: 'sec-2', text: "目录结构与单一真源原则" },
      { id: 'sec-3', text: "晴空设计令牌与 CSS 变量体系" },
      { id: 'sec-4', text: "URL Query 状态下沉设计" },
      { id: 'sec-5', text: "交互组件场景契合与无障碍动效" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "TypeScript 严格模式与类型约束" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "前端项目推荐开启严格类型检查（" }, { t: 'code', v: "strict: true" }, { t: 'text', v: " 与 " }, { t: 'code', v: "strictNullChecks: true" }, { t: 'text', v: "），充分发挥编译期类型系统的保护作用：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 推荐使用可辨识联合类型进行状态建模</span>\n<span class=\"tk-k\">type</span> <span class=\"tk-k\">RequestState</span>&lt;<span class=\"tk-k\">T</span>&gt; =\n  | { status: <span class=\"tk-s\">'idle'</span> }\n  | { status: <span class=\"tk-s\">'loading'</span> }\n  | { status: <span class=\"tk-s\">'success'</span>; data: <span class=\"tk-k\">T</span> }\n  | { status: <span class=\"tk-s\">'error'</span>; error: <span class=\"tk-k\">Error</span> }" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "避免滥用 " }, { t: 'code', v: "any" }, { t: 'text', v: " 或连续类型断言进行类型逃逸；对于可选字段，推荐显式声明 " }, { t: 'code', v: "undefined" }, { t: 'text', v: " 联合类型，确保类型契约严密。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "目录结构与单一真源原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "项目文件组织遵循单一真源原则，按领域或功能职责明确划分：" }],
    ] },
    { kind: 'code', lang: '', html: "src/\n├── components/   通用组件与业务组件（职责内聚）\n├── data/         静态数据源与数据转换逻辑（单一数据真源）\n├── hooks/        复用状态逻辑与生命周期钩子\n├── styles/       设计系统全局变量与字体定义" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "组件内部样式应依赖集中定义的设计系统变量，避免随处硬编码魔数颜色与尺寸。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "晴空设计令牌与 CSS 变量体系" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "项目全局采用设计系统令牌（Design Tokens）进行样式约束：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "色阶变量" }, { t: 'text', v: "：" }, { t: 'code', v: "--sky-500" }, { t: 'text', v: "、" }, { t: 'code', v: "--sky-700" }, { t: 'text', v: " 作为品牌主色，" }, { t: 'code', v: "--ink-900" }, { t: 'text', v: "、" }, { t: 'code', v: "--ink-600" }, { t: 'text', v: " 作为文本色阶；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "语义背景" }, { t: 'text', v: "：" }, { t: 'code', v: "--bg-paper" }, { t: 'text', v: "（页面底色）、" }, { t: 'code', v: "--bg-sunk" }, { t: 'text', v: "（凹槽沉降色）；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "对比度保障" }, { t: 'text', v: "：正文与背景必须满足 WCAG 2.1 AA 级对比度标准（正文文本对比度不低于 4.5:1）。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "URL Query 状态下沉设计" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对于列表筛选、分页、搜索关键字及选项卡切换等状态，推荐将其同步持久化至浏览器地址栏（" }, { t: 'code', v: "URLSearchParams" }, { t: 'text', v: "）：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "状态下沉至 URL 能够原生支持浏览器前进后退历史记录导航，并且方便用户将特定筛选视图作为链接直接分享与收藏。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "交互组件场景契合与无障碍动效" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "组件交互设计应契合真实业务场景，避免过度装饰：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "动效采用微交互原则，过渡时长控制在 150ms~300ms 以内；对于开启了系统减弱动态效果（" }, { t: 'code', v: "prefers-reduced-motion" }, { t: 'text', v: "）的用户，提供平滑的透明度过渡降级方案，保障无障碍访问体验。" }],
    ] },
    ],
  },
  {
    slug: 'backend',
    index: '13',
    category: 'convention',
    title: "后端约定",
    summary: "服务端分层规范、持久化容错、全局异常处理与审计日志。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "服务端单向依赖分层体系" },
      { id: 'sec-2', text: "业务建模与对象解耦" },
      { id: 'sec-3', text: "文件持久化与容错兜底机制" },
      { id: 'sec-4', text: "全局统一业务异常拦截" },
      { id: 'sec-5', text: "结构化操作日志与审计规范" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "服务端单向依赖分层体系" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "服务端代码架构遵循严格的单向依赖原则：" }],
    ] },
    { kind: 'code', lang: '', html: "Controller (控制层)  ──&gt;  Service (业务层)  ──&gt;  Mapper / Repository (持久层)" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "控制层仅负责 HTTP 协议参数绑定、格式校验与响应组装，禁止直接注入 Mapper 访问数据库；业务层负责核心业务规则校验与事务边界控制；持久层专注于数据持久化与 SQL 映射。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "业务建模与对象解耦" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "严格分离不同生命周期的数据对象模型：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "请求传输对象（DTO）" }, { t: 'text', v: "：接收客户端入参，结合校验注解（如 " }, { t: 'code', v: "@Valid" }, { t: 'text', v: "）校验必填项与格式；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "持久化实体（Entity）" }, { t: 'text', v: "：对应数据库表结构映射，维护数据持久化状态；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "视图响应对象（VO）" }, { t: 'text', v: "：按前端展示诉求裁剪组装数据，隐藏数据库内部物理主键与敏感字段。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "文件持久化与容错兜底机制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在执行本地文件存储或数据序列化时，必须保障底层健壮性：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "写入文件前检查父级目录是否存在；采用缓冲流提升写入效率；读取解析文件时必须包含完整的异常捕获分支，在遇到文件丢失、格式解析异常或行尾空行时提供预设的空状态或默认配置，避免阻塞整个应用程序启动。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "全局统一业务异常拦截" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "建立清晰的分层异常处理机制：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务层在检测到业务前置条件不满足时，统一抛出携带具体错误码与提示信息的自定义业务异常（如 " }, { t: 'code', v: "BusinessException" }, { t: 'text', v: "）；在 Web 层通过全局异常处理器（" }, { t: 'code', v: "@RestControllerAdvice" }, { t: 'text', v: "）统一捕获并封装为标准化 JSON 响应，生产环境下自动屏蔽底层 SQL 堆栈详情，防止系统内部结构泄露。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "结构化操作日志与审计规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对系统核心业务数据的创建、变更与删除操作，统一输出结构化审计日志：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "日志写入必须采用追加模式（Append-only），包含标准元数据：时间戳（ISO-8601）、操作人标识、操作行为、目标资源标识与操作结果；记录日志时必须对密码、密钥及手机号等敏感信息进行脱敏处理。" }],
    ] },
    ],
  },
  {
    slug: 'api-contract',
    index: '14',
    category: 'quality',
    title: "接口与数据",
    summary: "OpenAPI 契约驱动、统一响应协议、分页保护与参数化安全。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "OpenAPI 契约驱动与类型生成" },
      { id: 'sec-2', text: "统一响应协议与状态码映射" },
      { id: 'sec-3', text: "分页查询设计与上限保护" },
      { id: 'sec-4', text: "数据库实体约束与模型设计" },
      { id: 'sec-5', text: "参数化查询与安全防注入" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "OpenAPI 契约驱动与类型生成" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "推荐采用契约优先（Contract-First）的设计理念：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在前后端联调前先对齐并定义 OpenAPI 3.0 接口规范。前端可通过自动化脚本根据 OpenAPI 定义直接生成类型安全的 TypeScript 接口定义与请求客户端，从根源消除前后端字段命名与类型不一致的问题。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "统一响应协议与状态码映射" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "接口返回统一包装结构，明确区分传输层与业务层状态：" }],
    ] },
    { kind: 'code', lang: '', html: "{\n  \"code\": 0,\n  \"message\": \"success\",\n  \"data\": { ... },\n  \"timestamp\": 1700000000000\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "HTTP 传输状态码" }, { t: 'text', v: "：200（成功）、400（参数校验失败）、401（未登录）、403（无权限）、404（资源不存在）、500（服务器内部异常）；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "业务错误码" }, { t: 'text', v: "：在 HTTP 状态码为 200 或业务失败时，通过 " }, { t: 'code', v: "code" }, { t: 'text', v: " 提供细分业务含义（如 " }, { t: 'code', v: "100101: 账号已被冻结" }, { t: 'text', v: "）。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "分页查询设计与上限保护" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "分页查询接口统一采用标准化参数：当前页码（" }, { t: 'code', v: "page" }, { t: 'text', v: "）与每页条数（" }, { t: 'code', v: "pageSize" }, { t: 'text', v: "）。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "服务端必须对 " }, { t: 'code', v: "pageSize" }, { t: 'text', v: " 设置硬性上限约束（如单页最多不超过 100 条），防止客户端恶意请求超大分页导致数据库全表加载与内存溢出（OOM）。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "数据库实体约束与模型设计" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "表结构设计必须具备严密的数据完整性约束：" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "* " }, { t: 'strong', v: "主键规范" }, { t: 'text', v: "：每张表必须包含自增主键或分布式唯一 ID（如雪花算法）；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "自然唯一键" }, { t: 'text', v: "：业务唯一标识（如用户名、工号、邮箱）必须建立唯一索引（" }, { t: 'code', v: "UNIQUE INDEX" }, { t: 'text', v: "）；" }],
      [{ t: 'text', v: "* " }, { t: 'strong', v: "非空约束" }, { t: 'text', v: "：关键字段设定 " }, { t: 'code', v: "NOT NULL" }, { t: 'text', v: " 并指定合理的默认值，减少空指针与三值逻辑判断。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "参数化查询与安全防注入" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "数据持久层统一使用参数化查询（Parameterized Queries）或 PreparedStatement 预编译语句。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "严禁将客户端传入的未过滤字符串直接拼接进 SQL 查询语句中，确保输入参数仅作为字面量参与运算，彻底防范 SQL 注入攻击。" }],
    ] },
    ],
  },
  {
    slug: 'testing',
    index: '15',
    category: 'quality',
    title: "测试与评审",
    summary: "核心测试范围、单测行为命名规范与代码评审四大维度。",
    minutes: 6,
    headings: [
      { id: 'sec-1', text: "测试金字塔与重点覆盖范围" },
      { id: 'sec-2', text: "单元测试设计与行为命名规范" },
      { id: 'sec-3', text: "本地质量门禁与流水线验证" },
      { id: 'sec-4', text: "代码评审四大核心维度" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "测试金字塔与重点覆盖范围" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "团队推行轻量、高效的质量保证体系，将有限的测试精力聚焦于核心高价值区域：" }],
    ] },
    { kind: 'code', lang: '', html: "       / \\\n      / E2E \\       端到端测试：覆盖核心冒烟路径与主流程闭环\n     / 集成测试 \\     集成测试：覆盖服务接口、数据库事务与第三方集成\n    / 单元测试   \\   单元测试：覆盖核心计算、边界校验与复杂业务算法" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务逻辑中的核心计算公式（如折现算法、矩阵运算、权限判定）与数据解析器属于高风险模块，必须具备完备的单元测试用例覆盖。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "单元测试设计与行为命名规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "测试用例编写遵循行为驱动与清晰表述原则，推荐采用 Given-When-Then 或 Should-When 命名模式：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 推荐的单测命名格式：明确前置条件、触发动作与预期结果</span>\n<span class=\"tk-k\">test</span>(<span class=\"tk-s\">'应当在优惠券有效且满足门槛时正确计算折后总价'</span>, () =&gt; {\n  <span class=\"tk-c\">// Given: 准备订单金额与有效优惠券</span>\n  <span class=\"tk-c\">// When: 执行计价逻辑</span>\n  <span class=\"tk-c\">// Then: 断言返回金额精确符合折扣预期</span>\n})" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "测试用例应保持独立性与幂等性，避免依赖外部不可控的真实网络接口，推荐通过 Mock 模拟外部依赖。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "本地质量门禁与流水线验证" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在发起合并请求之前，开发者应在本地执行完整的质量检验流水线：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 本地门禁检验三步法</span>\n<span class=\"tk-k\">npm</span> run typecheck    <span class=\"tk-c\"># 1. 静态类型严格检查</span>\n<span class=\"tk-k\">npm</span> test             <span class=\"tk-c\"># 2. 自动化单元测试套件</span>\n<span class=\"tk-k\">npm</span> run build        <span class=\"tk-c\"># 3. 生产打包与预渲染构建验证</span>" },
    { kind: 'h3', id: 'sec-4', text: "代码评审四大核心维度" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "代码评审（Code Review）是保障工程质量与促进经验交流的关键环节。评审过程中重点关注以下四大维度：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "维度" }], [{ t: 'text', v: "审查关注点" }], [{ t: 'text', v: "典型排查项" }]],
      rows: [
        [[{ t: 'text', v: "正确性" }], [{ t: 'text', v: "边界条件、空指针防范与异常兜底" }], [{ t: 'text', v: "集合是否可能为空、除数是否可能为零、事务回滚边界" }]],
        [[{ t: 'text', v: "可读性" }], [{ t: 'text', v: "命名语义清晰、职责单一与模块解耦" }], [{ t: 'text', v: "变量命名是否自解释、函数长度是否适中、有无冗余死代码" }]],
        [[{ t: 'text', v: "安全性" }], [{ t: 'text', v: "参数化防注入、权限校验与数据脱敏" }], [{ t: 'text', v: "是否存在 SQL 拼接、越权访问隐患、日志有无泄露密码" }]],
        [[{ t: 'text', v: "性能与规范" }], [{ t: 'text', v: "索引命中、内存管理与资源释放" }], [{ t: 'text', v: "是否存在 N+1 查询、流对象是否安全关闭、组件有无内存泄漏" }]],
      ] },
    ],
  },
]

export const docBySlug = (slug: string): Doc | undefined => DOCS.find((d) => d.slug === slug)

export const docsByCategory = (id: string): readonly Doc[] => DOCS.filter((d) => d.category === id)
