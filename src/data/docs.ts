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
  | { kind: 'h4'; text: string }
  | { kind: 'para'; lines: readonly (readonly DocInline[])[] }
  | { kind: 'code'; lang: string; html: string; raw?: string }
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
  | {
      kind: 'details'
      title: string
      blocks: readonly DocBlock[]
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
  { id: 'roadmap', label: "阶梯路线", code: 'ROADMAP' },
  { id: 'engineering', label: "工程规范", code: 'ENGINEERING' },
  { id: 'handbook', label: "实战手册", code: 'HANDBOOK' },
]

export const DOCS: readonly Doc[] = [
  {
    slug: 'training-roadmap',
    index: '01',
    category: 'roadmap',
    title: "培养阶梯与全景成长蓝图",
    summary: "大一至大三的全周期学习路线：阶段阶梯、产出目标与代码评审沉淀机制。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "阶段阶梯全景" },
      { id: 'sec-3', text: "成长闭环与学习节奏" },
      { id: 'sec-4', text: "代码评审与导师沉淀机制" },
      { id: 'sec-5', text: "路线执行与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "技术成长最怕的不是难度，而是失序：教程看了一轮，关掉视频却写不出十行能跑的代码；热门技术追了一圈，简历上却拼不出一条完整的能力线。根因在于把「看过」当成了「会了」，把「碎片」当成了「体系」。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团的培养阶梯就是为解决这个问题而设计的：把大一到大三的成长拆成八个可验证的阶段，每个阶段都有明确的底层原理目标、可交付的大作业与强制的代码评审。成长不再是个人摸索，而是一条有检查点的工程化流水线。" }],
    ] },
    { kind: 'h4', text: "为什么必须按阶梯推进" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "底层决定上限。跳过指针与内存直接学框架，写出来的代码遇到性能问题就无从下手；跳过数据库原理直接调 ORM，慢查询只会盲目加索引。阶梯的每一层都为下一层提供「出问题时有能力向下追」的底气，这正是工程能力与调包能力的分界线。" }],
    ] },
    { kind: 'h4', text: "培养体系的演进脉络" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团培养从早期的「学长口头带教」演进为「任务书 + 大作业 + 代码评审」的三段式体系，再沉淀为本档案库的成文规范。每一次演进都源自真实的翻车复盘：评审缺位导致同类错误反复出现，于是有了审查清单；新人提问低效，于是有了第一周生存手册。这份蓝图本身就是工程沉淀机制的产物。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "阶段阶梯全景" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "八个阶段自底向上排布，前一阶段的产出是后一阶段的入场券：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "阶段" }], [{ t: 'text', v: "核心任务" }], [{ t: 'text', v: "能力目标" }], [{ t: 'text', v: "产出目标" }]],
      rows: [
        [[{ t: 'text', v: "编程通识" }], [{ t: 'text', v: "计算机科学启蒙" }], [{ t: 'text', v: "建立二进制、算法、内存与工程的全景视野" }], [{ t: 'text', v: "完成 CS50 全部实验并复盘笔记" }]],
        [[{ t: 'text', v: "阶段一" }], [{ t: 'text', v: "C/C++ 语法启蒙" }], [{ t: 'text', v: "掌握指针、内存模型与基础数据结构" }], [{ t: 'text', v: "手写动态扩容顺序表与双向链表" }]],
        [[{ t: 'text', v: "阶段二" }], [{ t: 'text', v: "Web 前端视野" }], [{ t: 'text', v: "掌握 HTML5、CSS 布局与 JS 异步交互" }], [{ t: 'text', v: "原生 JS 无障碍交互看板" }]],
        [[{ t: 'text', v: "阶段三" }], [{ t: 'text', v: "JavaSE 企业级基础" }], [{ t: 'text', v: "掌握面向对象、集合底层与异常体系" }], [{ t: 'text', v: "单机综合信息管理系统" }]],
        [[{ t: 'text', v: "阶段四" }], [{ t: 'text', v: "系统与数据底座" }], [{ t: 'text', v: "掌握 Linux 运维与 MySQL 设计调优" }], [{ t: 'text', v: "多表关联业务库与执行计划报告" }]],
        [[{ t: 'text', v: "阶段五" }], [{ t: 'text', v: "企业级 Web 工程" }], [{ t: 'text', v: "掌握 Maven、MyBatis 与三层架构" }], [{ t: 'text', v: "Spring Boot 脚手架与双 Token 认证" }]],
        [[{ t: 'text', v: "阶段六" }], [{ t: 'text', v: "真实工程与 AI 协作" }], [{ t: 'text', v: "参与生产级研发与学科竞赛" }], [{ t: 'text', v: "社团开源项目的合入特性" }]],
        [[{ t: 'text', v: "进阶阶段" }], [{ t: 'text', v: "高年级分流攻坚" }], [{ t: 'text', v: "微服务高并发或计算机 408 深造" }], [{ t: 'text', v: "就业项目集或考研真题体系" }]],
      ] },
    { kind: 'h4', text: "各阶段配套学习资源" },
    { kind: 'table',
      head: [[{ t: 'text', v: "阶段" }], [{ t: 'text', v: "推荐资源" }], [{ t: 'text', v: "学习重点" }]],
      rows: [
        [[{ t: 'text', v: "编程通识" }], [{ t: 'link', v: "哈佛 CS50x 导论", href: "https://www.bilibili.com/video/BV1Ls6BYkEGk" }], [{ t: 'text', v: "抽象思维与计算机全景" }]],
        [[{ t: 'text', v: "阶段一" }], [{ t: 'link', v: "C 语言入门精讲", href: "https://www.bilibili.com/video/BV1dr4y1n7vA" }, { t: 'text', v: " / " }, { t: 'link', v: "C++ 现代体系", href: "https://www.bilibili.com/video/BV1FpWZemEMS" }, { t: 'text', v: " / " }, { t: 'link', v: "灵神算法精讲", href: "https://www.bilibili.com/video/BV1bP411c7oJ" }], [{ t: 'text', v: "指针内存与数据结构基石" }]],
        [[{ t: 'text', v: "阶段二" }], [{ t: 'link', v: "HTML5 基础精讲", href: "https://www.bilibili.com/video/BV1BrBiYNEWg" }, { t: 'text', v: " / " }, { t: 'link', v: "CSS 核心实战", href: "https://www.bilibili.com/video/BV1sQeEzFEKi" }], [{ t: 'text', v: "语义化与现代布局" }]],
        [[{ t: 'text', v: "阶段三" }], [{ t: 'link', v: "JavaSE 进阶教程", href: "https://www.bilibili.com/video/BV163GGz2E8c" }], [{ t: 'text', v: "面向对象与集合原理" }]],
        [[{ t: 'text', v: "阶段四" }], [{ t: 'link', v: "小林 coding 底座", href: "https://xiaolincoding.com/" }], [{ t: 'text', v: "系统与数据库原理图解" }]],
        [[{ t: 'text', v: "阶段五" }], [{ t: 'link', v: "微服务实战", href: "https://www.bilibili.com/video/BV1gJ411p7xC" }], [{ t: 'text', v: "企业级架构落地" }]],
        [[{ t: 'text', v: "进阶阶段" }], [{ t: 'link', v: "Go 项目演练", href: "https://www.bilibili.com/video/BV1BY4UefEkM" }], [{ t: 'text', v: "高年级就业项目储备" }]],
      ] },
    { kind: 'h3', id: 'sec-3', text: "成长闭环与学习节奏" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每个阶段内部走同一个三步闭环，任何一步缺失都算没有完成该阶段：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "环节" }], [{ t: 'text', v: "做什么" }], [{ t: 'text', v: "通过的标志" }]],
      rows: [
        [[{ t: 'text', v: "概念认知与原理学习" }], [{ t: 'text', v: "读文档、看教程、推演底层机制" }], [{ t: 'text', v: "能不看资料向同伴讲清原理" }]],
        [[{ t: 'text', v: "大作业实战编码" }], [{ t: 'text', v: "独立完成阶段产出目标" }], [{ t: 'text', v: "功能完整且带防御性代码" }]],
        [[{ t: 'text', v: "骨干代码评审" }], [{ t: 'text', v: "提交代码接受审查与答辩" }], [{ t: 'text', v: "评审意见全部闭环销项" }]],
      ] },
    { kind: 'h4', text: "三个年级的节奏分工" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "大一是筑基年：以阶段一到阶段四为主线，重点是底层原理与编码量，考核以基础功验收为准。大二是实战年：完成阶段五与阶段六，进入真实项目与竞赛，同时承担对大一的讲课答疑与带教，教是最好的学。大三是分流年：按就业或考研进入进阶阶段，同时作为架构骨干回带项目，完成从「被带教」到「带教者」的身份闭环。" }],
    ] },
    { kind: 'h4', text: "每周最小投入基线" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "实验室考勤要求常规周打卡满 22 小时，技术投入建议遵循「三二一」节奏：每周至少三次编码会话、两次原理复盘、一次向师傅或同伴的口头讲解。连续两周没有任何产出，应主动向师傅暴露进度而不是沉默拖延。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "代码评审与导师沉淀机制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "评审不是挑错表演，而是把个人错误转化为团队资产的机制。每个阶段的大作业完成后，必须预约师傅进行一对一代码审查与创新点答辩。" }],
    ] },
    { kind: 'h4', text: "评审的四个关注面" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "审查按四个维度逐项过：代码规范性（命名、结构、格式）、逻辑严密性（边界、分支、异常路径）、异常健壮性（空值、资源、并发安全）、模块解耦度（依赖方向、职责单一）。评审意见以清单形式给出，成员逐条销项后复审，未销项不得进入下一阶段。" }],
    ] },
    { kind: 'h4', text: "提交记录自查" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "评审前先自查最近的提交记录是否干净可回溯，这是工程素养的第一道门面：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 查看最近五次提交的摘要与变更范围，确认每个提交只做一件事</span>\n<span class=\"tk-k\">git</span> log --oneline --stat -5\n\n<span class=\"tk-c\"># 提交前检查暂存内容，防止把调试代码与密钥文件带进历史</span>\n<span class=\"tk-k\">git</span> diff --cached\n\n<span class=\"tk-c\"># 提交为空或工作区不干净时先处理现场，再继续评审流程</span>\n<span class=\"tk-k\">git</span> status", raw: "# 查看最近五次提交的摘要与变更范围，确认每个提交只做一件事\ngit log --oneline --stat -5\n\n# 提交前检查暂存内容，防止把调试代码与密钥文件带进历史\ngit diff --cached\n\n# 提交为空或工作区不干净时先处理现场，再继续评审流程\ngit status" },
    { kind: 'h4', text: "沉淀的三个去向" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "评审中暴露的共性问题会沉淀到三个地方：高频错误写进《测试与评审规范》的审查清单，环境类问题写进《高频故障排查手册》，架构级结论写进对应阶段的路线篇目。你今天踩的坑，会成为下一届新人的路标。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "路线执行与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "各阶段验收均为可量化指标，不接受「我觉得我会了」式的自我认定：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "阶段" }], [{ t: 'text', v: "验收清单" }]],
      rows: [
        [[{ t: 'text', v: "阶段一" }], [{ t: 'text', v: "顺序表与链表通过师傅的边界用例集；能口述栈堆差异与虚表寻址" }]],
        [[{ t: 'text', v: "阶段二" }], [{ t: 'text', v: "看板通过键盘导航与防抖搜索验收；能口述事件循环调度时序" }]],
        [[{ t: 'text', v: "阶段三" }], [{ t: 'text', v: "信息系统通过异常注入测试；能推导 HashMap 树化阈值的由来" }]],
        [[{ t: 'text', v: "阶段四" }], [{ t: 'text', v: "业务库通过外键与索引规范检查；能解读 EXPLAIN 各字段含义" }]],
        [[{ t: 'text', v: "阶段五" }], [{ t: 'text', v: "脚手架通过接口契约门禁；能解释事务失效的三种场景" }]],
        [[{ t: 'text', v: "阶段六" }], [{ t: 'text', v: "特性代码合入主干；能独立完成从需求分析到合并请求的全流程" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "启动任何阶段前，先通读对应篇目，再到师傅处确认任务书；完成验收后，在复盘会上用十分钟讲清「这个阶段我错得最惨的一次」——能讲清失败，才算真正完成。" }],
    ] },
    ],
  },
  {
    slug: 'roadmap-foundation',
    index: '02',
    category: 'roadmap',
    title: "阶段一：C/C++ 语法启蒙与内存指针底层",
    summary: "C/C++ 语法筑基：指针与内存物理模型、对象底层机制与手写数据结构大作业。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "指针运算与内存物理模型" },
      { id: 'sec-3', text: "C++ 对象模型与虚函数机制" },
      { id: 'sec-4', text: "正反例设计范式" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "C/C++ 是社团培养阶梯的第一站，目标不是学会一门语言，而是建立「代码如何落到内存里」的物理直觉。上层语言把内存管理藏进垃圾回收，出问题时无处下手；而 C/C++ 强迫你直面每一个字节的去向，这份直面换来的底层意识，会在之后学 Java 集合、数据库索引、操作系统调度时持续复利。" }],
    ] },
    { kind: 'h4', text: "为什么从指针开始建立世界观" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "指针是 C 语言的灵魂，也是最多人劝退的地方。它的本质并不神秘：指针就是一个存着内存地址的整型变量，解引用是按这个地址去读写数据。一旦把「变量、数组、结构体都是内存上的一段区域」这件事想通，后面的链表、栈帧、虚函数表都只是同一件事的不同排布。" }],
    ] },
    { kind: 'h4', text: "本阶段的能力边界" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "完成本阶段后应能：手写动态数组与链表并保证无泄漏、口述栈与堆的分配差异、解释结构体内存对齐、说明虚函数调用的寻址过程。达不到的部分不许进入阶段二，欠的底层债会在企业级开发里加倍偿还。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "指针运算与内存物理模型" },
    { kind: 'h4', text: "指针运算就是地址偏移" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "指针加减一个整数，偏移量会自动乘以所指类型的大小。" }, { t: 'code', v: "int *p" }, { t: 'text', v: " 执行 " }, { t: 'code', v: "p + 1" }, { t: 'text', v: "，地址实际增加 " }, { t: 'code', v: "sizeof(int)" }, { t: 'text', v: " 即 4 字节；" }, { t: 'code', v: "double *p" }, { t: 'text', v: " 则增加 8 字节。这正是数组下标 " }, { t: 'code', v: "a[i]" }, { t: 'text', v: " 与 " }, { t: 'code', v: "*(a + i)" }, { t: 'text', v: " 等价的底层原因：" }],
    ] },
    { kind: 'code', lang: 'c', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdio.h&gt;</span>\n\n<span class=\"tk-k\">int</span> <span class=\"tk-k\">main</span>(<span class=\"tk-k\">void</span>) {\n    <span class=\"tk-k\">int</span> a[<span class=\"tk-s\">4</span>] = {<span class=\"tk-s\">10</span>, <span class=\"tk-s\">20</span>, <span class=\"tk-s\">30</span>, <span class=\"tk-s\">40</span>};\n    <span class=\"tk-k\">int</span> *p = a;\n\n<span class=\"tk-c\">    /* 防御：先确认数组非空语境且下标在界内，再做指针运算 */</span>\n    <span class=\"tk-k\">if</span> (p == <span class=\"tk-s\">NULL</span>) {\n        <span class=\"tk-k\">return</span> <span class=\"tk-s\">1</span>;\n    }\n    <span class=\"tk-k\">for</span> (<span class=\"tk-k\">int</span> i = <span class=\"tk-s\">0</span>; i &lt; <span class=\"tk-s\">4</span>; i += <span class=\"tk-s\">1</span>) {\n<span class=\"tk-c\">        /* *(p + i) 与 a[i] 是同一件事：基址 + i * sizeof(int) */</span>\n        <span class=\"tk-k\">printf</span>(<span class=\"tk-s\">\"a[%d] = %d, 地址差 = %ld\\n\"</span>, i, *(p + i), (<span class=\"tk-k\">long</span>)((p + i) - p) * sizeof(<span class=\"tk-k\">int</span>));\n    }\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">0</span>;\n}", raw: "#include <stdio.h>\n\nint main(void) {\n    int a[4] = {10, 20, 30, 40};\n    int *p = a;\n\n    /* 防御：先确认数组非空语境且下标在界内，再做指针运算 */\n    if (p == NULL) {\n        return 1;\n    }\n    for (int i = 0; i < 4; i += 1) {\n        /* *(p + i) 与 a[i] 是同一件事：基址 + i * sizeof(int) */\n        printf(\"a[%d] = %d, 地址差 = %ld\\n\", i, *(p + i), (long)((p + i) - p) * sizeof(int));\n    }\n    return 0;\n}" },
    { kind: 'h4', text: "栈帧压栈与堆内存生命周期" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "栈内存由编译器自动管理：函数调用时压入栈帧，局部变量随帧而生、随返回而灭，分配只是移动一下栈指针，极快但生命周期短。堆内存由 " }, { t: 'code', v: "malloc" }, { t: 'text', v: " 向操作系统申请、由 " }, { t: 'code', v: "free" }, { t: 'text', v: " 归还，生命周期跨越函数边界，代价是每一笔都要走分配器的簿记，且忘了还就是泄漏。口诀：" }, { t: 'strong', v: "栈快而短命，堆慢而长寿，谁申请谁归还。" }],
    ] },
    { kind: 'code', lang: 'c', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdio.h&gt;</span>\n#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdlib.h&gt;</span>\n\n<span class=\"tk-c\">/* 在堆上创建整型数组，调用方负责释放 */</span>\n<span class=\"tk-k\">int</span> *<span class=\"tk-k\">create_buffer</span>(<span class=\"tk-k\">size_t</span> n) {\n    <span class=\"tk-k\">if</span> (n == <span class=\"tk-s\">0</span>) {\n        <span class=\"tk-k\">return</span> <span class=\"tk-s\">NULL</span>;<span class=\"tk-c\"> /* 边界防护：零长度直接返回空 */</span>\n    }\n    <span class=\"tk-k\">int</span> *buf = (<span class=\"tk-k\">int</span> *)<span class=\"tk-k\">malloc</span>(n * sizeof(<span class=\"tk-k\">int</span>));\n    <span class=\"tk-k\">if</span> (buf == <span class=\"tk-s\">NULL</span>) {\n        <span class=\"tk-k\">return</span> <span class=\"tk-s\">NULL</span>;<span class=\"tk-c\"> /* 分配失败必须检查，不许直接使用 */</span>\n    }\n    <span class=\"tk-k\">for</span> (<span class=\"tk-k\">size_t</span> i = <span class=\"tk-s\">0</span>; i &lt; n; i += <span class=\"tk-s\">1</span>) {\n        buf[i] = <span class=\"tk-s\">0</span>;<span class=\"tk-c\"> /* 初始化，杜绝未初始化读 */</span>\n    }\n    <span class=\"tk-k\">return</span> buf;\n}", raw: "#include <stdio.h>\n#include <stdlib.h>\n\n/* 在堆上创建整型数组，调用方负责释放 */\nint *create_buffer(size_t n) {\n    if (n == 0) {\n        return NULL; /* 边界防护：零长度直接返回空 */\n    }\n    int *buf = (int *)malloc(n * sizeof(int));\n    if (buf == NULL) {\n        return NULL; /* 分配失败必须检查，不许直接使用 */\n    }\n    for (size_t i = 0; i < n; i += 1) {\n        buf[i] = 0; /* 初始化，杜绝未初始化读 */\n    }\n    return buf;\n}" },
    { kind: 'h4', text: "内存对齐与结构体填充" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "结构体的字段并非紧密排布：编译器会按各字段的对齐要求在缝隙里填字节，让每个字段落在自身大小的整数倍地址上，换取 CPU 一次访存就能读全。结果是结构体大小经常大于字段之和：" }],
    ] },
    { kind: 'code', lang: 'c', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdio.h&gt;</span>\n#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stddef.h&gt;</span>\n\n<span class=\"tk-k\">typedef</span> <span class=\"tk-k\">struct</span> {\n    <span class=\"tk-k\">char</span> flag;<span class=\"tk-c\">     /* 1 字节，其后填充 3 字节 */</span>\n    <span class=\"tk-k\">int</span> score;<span class=\"tk-c\">     /* 4 字节 */</span>\n    <span class=\"tk-k\">char</span> level;<span class=\"tk-c\">    /* 1 字节，其后填充 3 字节 */</span>\n} Student;\n\n<span class=\"tk-k\">int</span> <span class=\"tk-k\">main</span>(<span class=\"tk-k\">void</span>) {\n<span class=\"tk-c\">    /* sizeof(Student) = 12，而非 1+4+1 = 6 */</span>\n    <span class=\"tk-k\">printf</span>(<span class=\"tk-s\">\"size = %zu, flag 偏移 %zu, score 偏移 %zu, level 偏移 %zu\\n\"</span>,\n           sizeof(Student), <span class=\"tk-k\">offsetof</span>(Student, flag),\n           <span class=\"tk-k\">offsetof</span>(Student, score), <span class=\"tk-k\">offsetof</span>(Student, level));\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">0</span>;\n}", raw: "#include <stdio.h>\n#include <stddef.h>\n\ntypedef struct {\n    char flag;     /* 1 字节，其后填充 3 字节 */\n    int score;     /* 4 字节 */\n    char level;    /* 1 字节，其后填充 3 字节 */\n} Student;\n\nint main(void) {\n    /* sizeof(Student) = 12，而非 1+4+1 = 6 */\n    printf(\"size = %zu, flag 偏移 %zu, score 偏移 %zu, level 偏移 %zu\\n\",\n           sizeof(Student), offsetof(Student, flag),\n           offsetof(Student, score), offsetof(Student, level));\n    return 0;\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "调整字段声明顺序（大字段在前）或按用途拆分结构体，可以显著压低填充损耗——网络协议包与高频缓存对象尤其在乎这几个字节。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "C++ 对象模型与虚函数机制" },
    { kind: 'h4', text: "虚函数表与虚指针的寻址过程" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "含虚函数的类在编译期会生成一张虚函数表（vtable），表里按声明顺序存放各虚函数的入口地址；每个对象内部被编译器塞入一个虚指针（vptr），指向所属类的虚表。通过基类指针调用虚函数时，运行时要走三步：由对象取 vptr，由 vptr 查虚表对应槽位，再跳转执行。" }],
    ] },
    { kind: 'h4', text: "多态调用的性能开销" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "这三步间接寻址就是多态的成本：相比直接调用，多了一次指针跳转，且跳转目标在运行期才确定，编译器难以内联优化。因此高频热点循环（如每帧上万次的物理计算）慎用虚函数多态，可用模板静态多态或数据驱动的分发表替代；普通业务逻辑则完全不需要为此焦虑。" }],
    ] },
    { kind: 'h4', text: "构造与析构的资源纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "C++ 对象的核心纪律是 RAII：资源（内存、文件、锁）在构造时获取，在析构时释放。只要对象生命周期结束，资源必然归还，异常路径也不例外。这是后面学智能指针、学 Java try-with-resources 之前必须建立的思想原型。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "正反例设计范式" },
    { kind: 'h4', text: "反例：野指针与未初始化指针" },
    { kind: 'code', lang: 'c', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdlib.h&gt;</span>\n\n<span class=\"tk-k\">void</span> <span class=\"tk-k\">broken</span>(<span class=\"tk-k\">void</span>) {\n    <span class=\"tk-k\">int</span> *p;<span class=\"tk-c\">               /* 未初始化：p 指向随机地址 */</span>\n    *p = <span class=\"tk-s\">42</span>;<span class=\"tk-c\">              /* 未定义行为：随时段错误 */</span>\n\n    <span class=\"tk-k\">int</span> *q = (<span class=\"tk-k\">int</span> *)<span class=\"tk-k\">malloc</span>(sizeof(<span class=\"tk-k\">int</span>));\n    <span class=\"tk-k\">free</span>(q);\n    q = <span class=\"tk-s\">NULL</span>;<span class=\"tk-c\">             /* 若漏掉这一行，下面的二次释放与悬空读写都会发生 */</span>\n<span class=\"tk-c\">    /* free(q);  二次释放：堆元数据损坏 */</span>\n<span class=\"tk-c\">    /* *q = 1;   悬空指针读写：未定义行为 */</span>\n}", raw: "#include <stdlib.h>\n\nvoid broken(void) {\n    int *p;               /* 未初始化：p 指向随机地址 */\n    *p = 42;              /* 未定义行为：随时段错误 */\n\n    int *q = (int *)malloc(sizeof(int));\n    free(q);\n    q = NULL;             /* 若漏掉这一行，下面的二次释放与悬空读写都会发生 */\n    /* free(q);  二次释放：堆元数据损坏 */\n    /* *q = 1;   悬空指针读写：未定义行为 */\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "隐患拆解：未初始化指针的解引用是未定义行为，可能当场段错误，也可能静默破坏别处数据，后者更危险；" }, { t: 'code', v: "free" }, { t: 'text', v: " 后不置空的指针叫悬空指针，二次释放会破坏分配器簿记，读写则是经典悬空访问。这类问题往往在出错点之外的地方爆炸，排查成本极高。" }],
    ] },
    { kind: 'h4', text: "正例：现代 C++ 智能指针范式" },
    { kind: 'code', lang: 'cpp', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;memory&gt;</span>\n#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;vector&gt;</span>\n\n<span class=\"tk-k\">struct</span> <span class=\"tk-k\">Sensor</span> {\n    <span class=\"tk-k\">int</span> id = <span class=\"tk-s\">0</span>;\n    <span class=\"tk-k\">double</span> value = <span class=\"tk-s\">0.0</span>;\n};\n\nstd::<span class=\"tk-k\">unique_ptr</span>&lt;<span class=\"tk-k\">Sensor</span>&gt; <span class=\"tk-k\">make_sensor</span>(<span class=\"tk-k\">int</span> id) {\n<span class=\"tk-c\">    // make_unique 保证分配与构造的异常安全，无需手写 new</span>\n    <span class=\"tk-k\">auto</span> sensor = std::<span class=\"tk-k\">make_unique</span>&lt;<span class=\"tk-k\">Sensor</span>&gt;();\n    sensor-&gt;id = id;\n    <span class=\"tk-k\">return</span> sensor;<span class=\"tk-c\"> // 所有权转移，出作用域自动释放</span>\n}\n\n<span class=\"tk-k\">int</span> <span class=\"tk-k\">main</span>() {\n    <span class=\"tk-k\">auto</span> s = <span class=\"tk-k\">make_sensor</span>(<span class=\"tk-s\">7</span>);\n    <span class=\"tk-k\">if</span> (!s) {\n        <span class=\"tk-k\">return</span> <span class=\"tk-s\">1</span>;<span class=\"tk-c\"> // 空值检查永远在前</span>\n    }\n<span class=\"tk-c\">    // 多个观察者共享同一对象时用 shared_ptr，引用计数归零自动销毁</span>\n    std::<span class=\"tk-k\">shared_ptr</span>&lt;<span class=\"tk-k\">Sensor</span>&gt; shared = std::<span class=\"tk-k\">move</span>(std::<span class=\"tk-k\">make_unique</span>&lt;<span class=\"tk-k\">Sensor</span>&gt;());\n    std::<span class=\"tk-k\">vector</span>&lt;std::<span class=\"tk-k\">unique_ptr</span>&lt;<span class=\"tk-k\">Sensor</span>&gt;&gt; pool;\n    pool.<span class=\"tk-k\">reserve</span>(<span class=\"tk-s\">8</span>);<span class=\"tk-c\"> // 预分配，避免反复扩容搬移</span>\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">0</span>;\n}", raw: "#include <memory>\n#include <vector>\n\nstruct Sensor {\n    int id = 0;\n    double value = 0.0;\n};\n\nstd::unique_ptr<Sensor> make_sensor(int id) {\n    // make_unique 保证分配与构造的异常安全，无需手写 new\n    auto sensor = std::make_unique<Sensor>();\n    sensor->id = id;\n    return sensor; // 所有权转移，出作用域自动释放\n}\n\nint main() {\n    auto s = make_sensor(7);\n    if (!s) {\n        return 1; // 空值检查永远在前\n    }\n    // 多个观察者共享同一对象时用 shared_ptr，引用计数归零自动销毁\n    std::shared_ptr<Sensor> shared = std::move(std::make_unique<Sensor>());\n    std::vector<std::unique_ptr<Sensor>> pool;\n    pool.reserve(8); // 预分配，避免反复扩容搬移\n    return 0;\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "范式要点：独占所有权用 " }, { t: 'code', v: "unique_ptr" }, { t: 'text', v: "，共享所有权用 " }, { t: 'code', v: "shared_ptr" }, { t: 'text', v: "，裸 " }, { t: 'code', v: "new/delete" }, { t: 'text', v: " 在现代 C++ 中几乎不应出现。所有权语义写在类型里，编译器替你守住资源纪律。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "排查命令与修复" }]],
      rows: [
        [[{ t: 'code', v: "Segmentation fault" }], [{ t: 'text', v: "解引用野指针或越界写" }], [{ t: 'code', v: "gdb ./app" }, { t: 'text', v: " 后 " }, { t: 'code', v: "run" }, { t: 'text', v: "，崩溃时 " }, { t: 'code', v: "bt" }, { t: 'text', v: " 看调用栈" }]],
        [[{ t: 'text', v: "内存随时间只涨不降" }], [{ t: 'text', v: "堆内存泄漏" }], [{ t: 'code', v: "valgrind --leak-check=full ./app" }, { t: 'text', v: " 定位未释放点" }]],
        [[{ t: 'code', v: "double free detected" }], [{ t: 'text', v: "同一块内存释放两次" }], [{ t: 'text', v: "释放后立即置 " }, { t: 'code', v: "NULL" }, { t: 'text', v: "，或改用智能指针" }]],
        [[{ t: 'text', v: "结构体序列化错乱" }], [{ t: 'text', v: "直接 " }, { t: 'code', v: "fwrite" }, { t: 'text', v: " 带填充的结构体" }], [{ t: 'text', v: "逐字段序列化，禁止整块写盘或整块发网" }]],
        [[{ t: 'text', v: "大数组放局部变量崩溃" }], [{ t: 'text', v: "栈空间有限（常为 8MB）" }], [{ t: 'text', v: "大数据结构一律走堆分配" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "编译期就应打开防御开关，把尽可能多的错误提前到构建时暴露：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># -Wall -Wextra 打开常规告警，-Werror 把告警当错误，-fsanitize 运行期检测越界与泄漏</span>\n<span class=\"tk-k\">gcc</span> -Wall -Wextra -Werror -g -fsanitize=address,undefined main.c -o main\n\n<span class=\"tk-c\"># 运行一次完整用例集，AddressSanitizer 会在首个越界点给出精确行号</span>\n<span class=\"tk-k\">./main</span>\n\n<span class=\"tk-c\"># 无 sanitizer 的环境下用 valgrind 复查泄漏，退出码非 0 视为不通过</span>\n<span class=\"tk-k\">valgrind</span> --leak-check=full --error-exitcode=1 ./main", raw: "# -Wall -Wextra 打开常规告警，-Werror 把告警当错误，-fsanitize 运行期检测越界与泄漏\ngcc -Wall -Wextra -Werror -g -fsanitize=address,undefined main.c -o main\n\n# 运行一次完整用例集，AddressSanitizer 会在首个越界点给出精确行号\n./main\n\n# 无 sanitizer 的环境下用 valgrind 复查泄漏，退出码非 0 视为不通过\nvalgrind --leak-check=full --error-exitcode=1 ./main" },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "使用 C 实现通用顺序表与双向链表，再用 C++ 用智能指针重写链表版本，两套实现都必须通过师傅的边界用例集。" }],
    ] },
    { kind: 'details', title: "顺序表参考骨架：动态扩容与内存自清理", blocks: [
    { kind: 'code', lang: 'c', html: "#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdio.h&gt;</span>\n#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;stdlib.h&gt;</span>\n#<span class=\"tk-k\">include</span> <span class=\"tk-s\">&lt;string.h&gt;</span>\n\n<span class=\"tk-k\">typedef</span> <span class=\"tk-k\">struct</span> {\n    <span class=\"tk-k\">int</span> *data;\n    <span class=\"tk-k\">size_t</span> size;<span class=\"tk-c\">      /* 当前元素数 */</span>\n    <span class=\"tk-k\">size_t</span> capacity;<span class=\"tk-c\">  /* 当前容量 */</span>\n} SeqList;\n\n<span class=\"tk-c\">/* 初始化：容量为 0 视为非法 */</span>\n<span class=\"tk-k\">int</span> <span class=\"tk-k\">seq_init</span>(SeqList *list, <span class=\"tk-k\">size_t</span> capacity) {\n    <span class=\"tk-k\">if</span> (list == <span class=\"tk-s\">NULL</span> || capacity == <span class=\"tk-s\">0</span>) {\n        <span class=\"tk-k\">return</span> -<span class=\"tk-s\">1</span>;\n    }\n    list-&gt;data = (<span class=\"tk-k\">int</span> *)<span class=\"tk-k\">malloc</span>(capacity * sizeof(<span class=\"tk-k\">int</span>));\n    <span class=\"tk-k\">if</span> (list-&gt;data == <span class=\"tk-s\">NULL</span>) {\n        <span class=\"tk-k\">return</span> -<span class=\"tk-s\">1</span>;\n    }\n    list-&gt;size = <span class=\"tk-s\">0</span>;\n    list-&gt;capacity = capacity;\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">0</span>;\n}\n\n<span class=\"tk-c\">/* 追加：容量不足时按 2 倍扩容，扩容失败不破坏原表 */</span>\n<span class=\"tk-k\">int</span> <span class=\"tk-k\">seq_push</span>(SeqList *list, <span class=\"tk-k\">int</span> value) {\n    <span class=\"tk-k\">if</span> (list == <span class=\"tk-s\">NULL</span> || list-&gt;data == <span class=\"tk-s\">NULL</span>) {\n        <span class=\"tk-k\">return</span> -<span class=\"tk-s\">1</span>;\n    }\n    <span class=\"tk-k\">if</span> (list-&gt;size == list-&gt;capacity) {\n        <span class=\"tk-k\">size_t</span> next = list-&gt;capacity * <span class=\"tk-s\">2</span>;\n        <span class=\"tk-k\">int</span> *grown = (<span class=\"tk-k\">int</span> *)<span class=\"tk-k\">realloc</span>(list-&gt;data, next * sizeof(<span class=\"tk-k\">int</span>));\n        <span class=\"tk-k\">if</span> (grown == <span class=\"tk-s\">NULL</span>) {\n            <span class=\"tk-k\">return</span> -<span class=\"tk-s\">1</span>;<span class=\"tk-c\"> /* 原指针保持有效，调用方可安全重试或释放 */</span>\n        }\n        list-&gt;data = grown;\n        list-&gt;capacity = next;\n    }\n    list-&gt;data[list-&gt;size] = value;\n    list-&gt;size += <span class=\"tk-s\">1</span>;\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">0</span>;\n}\n\n<span class=\"tk-c\">/* 销毁：释放后置空，防止悬空访问 */</span>\n<span class=\"tk-k\">void</span> <span class=\"tk-k\">seq_destroy</span>(SeqList *list) {\n    <span class=\"tk-k\">if</span> (list == <span class=\"tk-s\">NULL</span>) {\n        <span class=\"tk-k\">return</span>;\n    }\n    <span class=\"tk-k\">free</span>(list-&gt;data);\n    list-&gt;data = <span class=\"tk-s\">NULL</span>;\n    list-&gt;size = <span class=\"tk-s\">0</span>;\n    list-&gt;capacity = <span class=\"tk-s\">0</span>;\n}", raw: "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\ntypedef struct {\n    int *data;\n    size_t size;      /* 当前元素数 */\n    size_t capacity;  /* 当前容量 */\n} SeqList;\n\n/* 初始化：容量为 0 视为非法 */\nint seq_init(SeqList *list, size_t capacity) {\n    if (list == NULL || capacity == 0) {\n        return -1;\n    }\n    list->data = (int *)malloc(capacity * sizeof(int));\n    if (list->data == NULL) {\n        return -1;\n    }\n    list->size = 0;\n    list->capacity = capacity;\n    return 0;\n}\n\n/* 追加：容量不足时按 2 倍扩容，扩容失败不破坏原表 */\nint seq_push(SeqList *list, int value) {\n    if (list == NULL || list->data == NULL) {\n        return -1;\n    }\n    if (list->size == list->capacity) {\n        size_t next = list->capacity * 2;\n        int *grown = (int *)realloc(list->data, next * sizeof(int));\n        if (grown == NULL) {\n            return -1; /* 原指针保持有效，调用方可安全重试或释放 */\n        }\n        list->data = grown;\n        list->capacity = next;\n    }\n    list->data[list->size] = value;\n    list->size += 1;\n    return 0;\n}\n\n/* 销毁：释放后置空，防止悬空访问 */\nvoid seq_destroy(SeqList *list) {\n    if (list == NULL) {\n        return;\n    }\n    free(list->data);\n    list->data = NULL;\n    list->size = 0;\n    list->capacity = 0;\n}" },
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "验收清单（全部满足才可进入阶段二）：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "功能完整性" }], [{ t: 'text', v: "顺序表与链表支持增删查改与遍历，链表支持头尾双向插入" }]],
        [[{ t: 'text', v: "内存安全" }], [{ t: 'code', v: "valgrind" }, { t: 'text', v: " 全绿，零泄漏零越界；释放后指针置空" }]],
        [[{ t: 'text', v: "边界防护" }], [{ t: 'text', v: "空表删除、下标越界、扩容失败均有明确返回码，不崩溃" }]],
        [[{ t: 'text', v: "原理口述" }], [{ t: 'text', v: "能讲清指针运算偏移、栈堆差异、内存对齐与虚表寻址" }]],
        [[{ t: 'text', v: "工程习惯" }], [{ t: 'text', v: "提交记录符合 Conventional Commits，每个提交单一职责" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-web-basics',
    index: '03',
    category: 'roadmap',
    title: "阶段二：Web 前端视野、现代布局与异步交互",
    summary: "Web 前端筑基：浏览器渲染流水线、事件模型、事件循环与原生交互看板大作业。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "浏览器渲染流水线与事件模型" },
      { id: 'sec-3', text: "现代布局体系" },
      { id: 'sec-4', text: "正反例设计范式" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段二把视野从单机程序拉向浏览器：用户看到的每一个像素，都是浏览器把 HTML、CSS、JavaScript 三份输入加工后的产物。不理解这条加工流水线，写出的页面就会在数据一多时卡顿、在交互一密时掉帧，却说不清慢在哪里。" }],
    ] },
    { kind: 'h4', text: "为什么原生先行、框架在后" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "React、Vue 这些框架解决的是「大型界面的组织问题」，而它们封装掉的正是本阶段要学的原生能力：DOM 操作、事件模型、异步时序。跳过原生直接学框架，等于只会按按钮不会看仪表盘——框架一升级、行为一变化，就失去了判断依据。社团的顺序是：先用原生 JavaScript 把看板写出来，再进项目学框架，此时框架的每个设计你都能对上号。" }],
    ] },
    { kind: 'h4', text: "本阶段的能力边界" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "完成本阶段后应能：口述从 URL 到像素的完整链路、用 Flex 与 Grid 完成任意常规布局、解释事件三阶段与委托原理、画出事件循环的微任务宏任务调度时序。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "浏览器渲染流水线与事件模型" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "浏览器把一份页面变成屏幕像素要走五道工序，每道工序都可能成为性能瓶颈：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "工序" }], [{ t: 'text', v: "做什么" }], [{ t: 'text', v: "触发重做的典型操作" }]],
      rows: [
        [[{ t: 'text', v: "DOM 树构建" }], [{ t: 'text', v: "解析 HTML 生成节点树" }], [{ t: 'code', v: "innerHTML" }, { t: 'text', v: " 整段替换" }]],
        [[{ t: 'text', v: "样式计算" }], [{ t: 'text', v: "解析 CSS 算出每节点最终样式" }], [{ t: 'text', v: "增删类名、改样式规则" }]],
        [[{ t: 'text', v: "布局（重排）" }], [{ t: 'text', v: "计算每节点的位置与尺寸" }], [{ t: 'text', v: "读写 " }, { t: 'code', v: "offsetWidth" }, { t: 'text', v: "、改几何属性" }]],
        [[{ t: 'text', v: "绘制（重绘）" }], [{ t: 'text', v: "生成绘制指令与图层" }], [{ t: 'text', v: "改颜色、阴影等外观属性" }]],
        [[{ t: 'text', v: "合成" }], [{ t: 'text', v: "GPU 合成各图层输出画面" }], [{ t: 'code', v: "transform" }, { t: 'text', v: "、" }, { t: 'code', v: "opacity" }, { t: 'text', v: " 动画" }]],
      ] },
    { kind: 'h4', text: "重排与重绘的成本差" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "改几何属性（宽高、位置）会让布局阶段从该节点开始重新计算，波及子孙与后续兄弟，这是最贵的操作；改外观属性（颜色、背景）只触发重绘，跳过布局；而 " }, { t: 'code', v: "transform" }, { t: 'text', v: " 与 " }, { t: 'code', v: "opacity" }, { t: 'text', v: " 的变化只发生在合成阶段，不碰布局也不碰绘制，这就是「动画优先用 transform」的物理依据。" }],
    ] },
    { kind: 'h4', text: "读写的隐形代价" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "浏览器为了性能会延迟批量执行布局，但一旦你在写操作之间插入一次几何属性读取（如 " }, { t: 'code', v: "offsetHeight" }, { t: 'text', v: "），浏览器必须立刻把布局算完给你准确值——读写交替就造成强制同步布局，这是页面卡顿最常见的隐形元凶。" }],
    ] },
    { kind: 'h4', text: "捕获、目标与冒泡三阶段" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一次点击事件的生命周期分三段：先从 " }, { t: 'code', v: "window" }, { t: 'text', v: " 沿 DOM 树向下" }, { t: 'strong', v: "捕获" }, { t: 'text', v: "，到达" }, { t: 'strong', v: "处于目标" }, { t: 'text', v: "的元素，再从目标沿树向上" }, { t: 'strong', v: "冒泡" }, { t: 'text', v: "。" }, { t: 'code', v: "addEventListener" }, { t: 'text', v: " 的第三个参数决定监听挂在捕获段还是冒泡段，默认冒泡。绝大多数业务只需冒泡段。" }],
    ] },
    { kind: 'h4', text: "事件委托：冒泡的工程红利" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "给一百个列表项各绑一个监听器，内存里就是一百个闭包；利用冒泡把监听器只绑在父容器上，通过 " }, { t: 'code', v: "event.target" }, { t: 'text', v: " 判断真实来源，一份监听覆盖全部子项，动态新增的子项也自动生效。这是冒泡机制换来的最实用的工程红利。" }],
    ] },
    { kind: 'h4', text: "单线程事件循环的调度时序" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "JavaScript 主线程是单线程的，靠事件循环调度任务：每执行完一个" }, { t: 'strong', v: "宏任务" }, { t: 'text', v: "（脚本、" }, { t: 'code', v: "setTimeout" }, { t: 'text', v: "、事件回调），就先清空整个" }, { t: 'strong', v: "微任务队列" }, { t: 'text', v: "（" }, { t: 'code', v: "Promise.then" }, { t: 'text', v: "、" }, { t: 'code', v: "queueMicrotask" }, { t: 'text', v: "），再去做渲染，然后取下一个宏任务。微任务插队能力强，宏任务之间会被渲染隔开——理解了这条时序，才能解释「为什么 " }, { t: 'code', v: "Promise.then" }, { t: 'text', v: " 总比 " }, { t: 'code', v: "setTimeout" }, { t: 'text', v: " 先打印」。" }],
    ] },
    { kind: 'code', lang: 'ts', html: "console.<span class=\"tk-k\">log</span>(<span class=\"tk-s\">'1 同步脚本本身是第一个宏任务'</span>)\n\n<span class=\"tk-k\">setTimeout</span>(() =&gt; console.<span class=\"tk-k\">log</span>(<span class=\"tk-s\">'5 宏任务：等微任务与渲染都结束才轮到我'</span>), <span class=\"tk-s\">0</span>)\n\n<span class=\"tk-k\">Promise</span>.<span class=\"tk-k\">resolve</span>()\n  .<span class=\"tk-k\">then</span>(() =&gt; console.<span class=\"tk-k\">log</span>(<span class=\"tk-s\">'3 微任务：本轮回调结束后立刻执行'</span>))\n  .<span class=\"tk-k\">then</span>(() =&gt; console.<span class=\"tk-k\">log</span>(<span class=\"tk-s\">'4 微任务：链上下一环仍在微任务队列'</span>))\n\nconsole.<span class=\"tk-k\">log</span>(<span class=\"tk-s\">'2 同步代码按书写顺序执行完毕'</span>)\n<span class=\"tk-c\">// 输出顺序：1 → 2 → 3 → 4 → 5</span>", raw: "console.log('1 同步脚本本身是第一个宏任务')\n\nsetTimeout(() => console.log('5 宏任务：等微任务与渲染都结束才轮到我'), 0)\n\nPromise.resolve()\n  .then(() => console.log('3 微任务：本轮回调结束后立刻执行'))\n  .then(() => console.log('4 微任务：链上下一环仍在微任务队列'))\n\nconsole.log('2 同步代码按书写顺序执行完毕')\n// 输出顺序：1 → 2 → 3 → 4 → 5" },
    { kind: 'h3', id: 'sec-3', text: "现代布局体系" },
    { kind: 'h4', text: "Flex 与 Grid 的分工" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Flex 解决「一条线上的排布」：导航条、工具栏、卡片内的元素对齐；Grid 解决「一张网上的排布」：整页骨架、瀑布式卡片区。口诀：" }, { t: 'strong', v: "先 Grid 定骨架，再 Flex 排局部。" }, { t: 'text', v: " 两者都能做的事优先 Grid，它的行列约束声明更直白。" }],
    ] },
    { kind: 'code', lang: 'css', html: "<span class=\"tk-c\">/* 页面骨架：左栏固定 280 目录树，右栏自适应长文 */</span>\n.<span class=\"tk-k\">archive-layout</span> {\n  <span class=\"tk-k\">display</span>: <span class=\"tk-s\">grid</span>;\n  <span class=\"tk-k\">grid-template-columns</span>: <span class=\"tk-s\">280</span><span class=\"tk-k\">px</span> <span class=\"tk-k\">minmax</span>(<span class=\"tk-s\">0</span>, <span class=\"tk-s\">1</span><span class=\"tk-k\">fr</span>);\n  <span class=\"tk-k\">gap</span>: <span class=\"tk-s\">24</span><span class=\"tk-k\">px</span>;\n  <span class=\"tk-k\">min-height</span>: <span class=\"tk-s\">100</span><span class=\"tk-k\">vh</span>;\n}\n\n<span class=\"tk-c\">/* 局部对齐：导航项水平分布，垂直居中 */</span>\n.<span class=\"tk-k\">nav-bar</span> {\n  <span class=\"tk-k\">display</span>: <span class=\"tk-s\">flex</span>;\n  <span class=\"tk-k\">align-items</span>: <span class=\"tk-s\">center</span>;\n  <span class=\"tk-k\">justify-content</span>: <span class=\"tk-s\">space-between</span>;\n  <span class=\"tk-c\">/* 移动端收窄时允许换行，而不是溢出撑破容器 */</span>\n  <span class=\"tk-k\">flex-wrap</span>: <span class=\"tk-s\">wrap</span>;\n  <span class=\"tk-k\">gap</span>: <span class=\"tk-s\">12</span><span class=\"tk-k\">px</span>;\n}", raw: "/* 页面骨架：左栏固定 280 目录树，右栏自适应长文 */\n.archive-layout {\n  display: grid;\n  grid-template-columns: 280px minmax(0, 1fr);\n  gap: 24px;\n  min-height: 100vh;\n}\n\n/* 局部对齐：导航项水平分布，垂直居中 */\n.nav-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  /* 移动端收窄时允许换行，而不是溢出撑破容器 */\n  flex-wrap: wrap;\n  gap: 12px;\n}" },
    { kind: 'h4', text: "响应式的断点纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "断点不是越多越好，社团约定两档：" }, { t: 'code', v: "768px" }, { t: 'text', v: " 以下按移动端单列重排，" }, { t: 'code', v: "768px" }, { t: 'text', v: " 以上按桌面布局。移动优先意味着基础样式写给最窄屏，再用 " }, { t: 'code', v: "min-width" }, { t: 'text', v: " 媒体查询逐级增强，避免桌面样式写了三百行再逐条推翻。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "正反例设计范式" },
    { kind: 'h4', text: "反例：循环内读写交替引发布局抖动" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 反例：每次循环都强制同步布局，一百项就触发一百次重排</span>\n<span class=\"tk-k\">function</span> <span class=\"tk-k\">syncHeights_bad</span>(items: <span class=\"tk-k\">HTMLElement</span>[]) {\n  <span class=\"tk-k\">for</span> (<span class=\"tk-k\">const</span> <span class=\"tk-s\">el</span> of items) {\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">h</span> = el.offsetHeight <span class=\"tk-c\">// 读：强制浏览器立刻完成布局</span>\n    el.style.height = <span class=\"tk-s\">`</span>${h + <span class=\"tk-s\">8</span>}px<span class=\"tk-s\">`</span> <span class=\"tk-c\">// 写：布局失效</span>\n  }\n}", raw: "// 反例：每次循环都强制同步布局，一百项就触发一百次重排\nfunction syncHeights_bad(items: HTMLElement[]) {\n  for (const el of items) {\n    const h = el.offsetHeight // 读：强制浏览器立刻完成布局\n    el.style.height = `${h + 8}px` // 写：布局失效\n  }\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "隐患拆解：读写交替让浏览器的批量布局优化彻底失效，列表越长卡顿越明显；在滚动或动画回调里这样写，帧率直接腰斩。" }],
    ] },
    { kind: 'h4', text: "正例：批量读写分离与文档片段" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 正例：先集中读、再集中写，整段只触发一次布局</span>\n<span class=\"tk-k\">function</span> <span class=\"tk-k\">syncHeights_good</span>(items: <span class=\"tk-k\">HTMLElement</span>[]) {\n  <span class=\"tk-k\">if</span> (!items || items.length === <span class=\"tk-s\">0</span>) <span class=\"tk-k\">return</span> <span class=\"tk-c\">// 空值防御在前</span>\n\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">heights</span> = items.<span class=\"tk-k\">map</span>((el) =&gt; el.offsetHeight) <span class=\"tk-c\">// 批量读</span>\n  items.<span class=\"tk-k\">forEach</span>((el, i) =&gt; {\n    el.style.height = <span class=\"tk-s\">`</span>${heights[i]! + <span class=\"tk-s\">8</span>}px<span class=\"tk-s\">`</span> <span class=\"tk-c\">// 批量写</span>\n  })\n}\n\n<span class=\"tk-c\">// 正例：大批量插入先进文档片段，一次性上树，只触发一次重排</span>\n<span class=\"tk-k\">function</span> <span class=\"tk-k\">renderList_good</span>(list: <span class=\"tk-k\">HTMLElement</span>, data: <span class=\"tk-k\">readonly</span> <span class=\"tk-k\">string</span>[]) {\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">fragment</span> = document.<span class=\"tk-k\">createDocumentFragment</span>()\n  <span class=\"tk-k\">for</span> (<span class=\"tk-k\">const</span> <span class=\"tk-s\">text</span> of data) {\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">li</span> = document.<span class=\"tk-k\">createElement</span>(<span class=\"tk-s\">'li'</span>)\n    li.textContent = text <span class=\"tk-c\">// textContent 不解析 HTML，天然防注入</span>\n    fragment.<span class=\"tk-k\">appendChild</span>(li)\n  }\n  list.<span class=\"tk-k\">replaceChildren</span>(fragment) <span class=\"tk-c\">// 原子替换，旧节点一并清理</span>\n}", raw: "// 正例：先集中读、再集中写，整段只触发一次布局\nfunction syncHeights_good(items: HTMLElement[]) {\n  if (!items || items.length === 0) return // 空值防御在前\n\n  const heights = items.map((el) => el.offsetHeight) // 批量读\n  items.forEach((el, i) => {\n    el.style.height = `${heights[i]! + 8}px` // 批量写\n  })\n}\n\n// 正例：大批量插入先进文档片段，一次性上树，只触发一次重排\nfunction renderList_good(list: HTMLElement, data: readonly string[]) {\n  const fragment = document.createDocumentFragment()\n  for (const text of data) {\n    const li = document.createElement('li')\n    li.textContent = text // textContent 不解析 HTML，天然防注入\n    fragment.appendChild(li)\n  }\n  list.replaceChildren(fragment) // 原子替换，旧节点一并清理\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "需要按帧节流的动画与滚动处理，用 " }, { t: 'code', v: "requestAnimationFrame" }, { t: 'text', v: " 把写操作对齐到渲染时机，而不是在事件回调里随手改样式。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "列表一多滚动就卡" }], [{ t: 'text', v: "循环内强制同步布局" }], [{ t: 'text', v: "读写分离，批量更新" }]],
        [[{ t: 'text', v: "监听器绑了不生效" }], [{ t: 'text', v: "元素在绑定后才插入" }], [{ t: 'text', v: "改用事件委托绑在父容器" }]],
        [[{ t: 'code', v: "then" }, { t: 'text', v: " 里拿到旧值" }], [{ t: 'text', v: "异步时序误解" }], [{ t: 'text', v: "画出事件循环时序再改代码" }]],
        [[{ t: 'text', v: "布局在某些浏览器错位" }], [{ t: 'text', v: "用了过新的 CSS 特性" }], [{ t: 'text', v: "查兼容性表，关键特性加回退" }]],
        [[{ t: 'text', v: "输入框打字触发海量请求" }], [{ t: 'text', v: "键盘事件直连请求" }], [{ t: 'text', v: "防抖 300ms，请求前判空" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "防抖是交互层的基本功，核心是「最后一次触发后才真正执行」：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">function</span> <span class=\"tk-k\">debounce</span>&lt;<span class=\"tk-k\">A</span> <span class=\"tk-k\">extends</span> <span class=\"tk-k\">unknown</span>[]&gt;(\n  <span class=\"tk-k\">fn</span>: (...args: <span class=\"tk-k\">A</span>) =&gt; <span class=\"tk-k\">void</span>,\n  waitMs: <span class=\"tk-k\">number</span>,\n): (...args: <span class=\"tk-k\">A</span>) =&gt; <span class=\"tk-k\">void</span> {\n  <span class=\"tk-k\">let</span> timer: <span class=\"tk-k\">ReturnType</span>&lt;typeof setTimeout&gt; | <span class=\"tk-k\">null</span> = <span class=\"tk-s\">null</span>\n  <span class=\"tk-k\">return</span> (...args: <span class=\"tk-k\">A</span>) =&gt; {\n    <span class=\"tk-k\">if</span> (timer !== <span class=\"tk-s\">null</span>) <span class=\"tk-k\">clearTimeout</span>(timer) <span class=\"tk-c\">// 取消上一次未执行的调用</span>\n    timer = <span class=\"tk-k\">setTimeout</span>(() =&gt; {\n      timer = <span class=\"tk-s\">null</span>\n      <span class=\"tk-k\">fn</span>(...args)\n    }, waitMs)\n  }\n}", raw: "function debounce<A extends unknown[]>(\n  fn: (...args: A) => void,\n  waitMs: number,\n): (...args: A) => void {\n  let timer: ReturnType<typeof setTimeout> | null = null\n  return (...args: A) => {\n    if (timer !== null) clearTimeout(timer) // 取消上一次未执行的调用\n    timer = setTimeout(() => {\n      timer = null\n      fn(...args)\n    }, waitMs)\n  }\n}" },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "基于原生 JavaScript 编写一块交互看板：数据列表动态渲染、顶部搜索框防抖过滤、全键盘可无障碍导航。不许引入任何框架与组件库。" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "动态渲染" }], [{ t: 'text', v: "百条数据经文档片段一次性上树，增量更新用读写分离" }]],
        [[{ t: 'text', v: "防抖搜索" }], [{ t: 'text', v: "输入停止 300ms 后过滤，空关键字恢复全量，过滤结果为空有提示态" }]],
        [[{ t: 'text', v: "无障碍" }], [{ t: 'code', v: "Tab" }, { t: 'text', v: " 可遍历全部交互项，" }, { t: 'code', v: "Enter" }, { t: 'text', v: " 可激活，焦点样式清晰可见" }]],
        [[{ t: 'text', v: "事件模型" }], [{ t: 'text', v: "列表项点击走事件委托，能口述捕获冒泡全流程" }]],
        [[{ t: 'text', v: "性能" }], [{ t: 'text', v: "浏览器 Performance 面板录制无明显强制同步布局红线" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-backend-java',
    index: '04',
    category: 'roadmap',
    title: "阶段三：JavaSE 企业级面向对象与集合底层原理",
    summary: "JavaSE 筑基：面向对象与异常体系、HashMap 底层推演与并发容器对比实战。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "HashMap 底层结构推演" },
      { id: 'sec-3', text: "并发安全与容器选型" },
      { id: 'sec-4', text: "正反例设计范式" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段三选择 Java 作为企业级方向的基石语言：它的面向对象体系、集合框架与异常模型，是后面 Spring 全家桶、MyBatis 乃至整个后端工程的地基。本阶段的目标不是背 API，而是把「集合在内存里怎么摆、并发时怎么坏」这两件事推演到能白板讲清的程度。" }],
    ] },
    { kind: 'h4', text: "为什么集合底层是必答题" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "HashMap" }, { t: 'text', v: " 是后端代码里出现频率最高的数据结构，没有之一：参数映射、缓存、会话、去重全靠它。面试官问它的底层不是刁难，而是因为线上事故的大量根因就藏在「哈希冲突怎么处理」「并发写入会怎样」这两个问题里。会用和懂底层，对应的是两种完全不同的排障能力。" }],
    ] },
    { kind: 'h4', text: "本阶段的能力边界" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "完成本阶段后应能：用面向对象拆解一个业务域、推导 HashMap 从数组到红黑树的完整演化、解释 " }, { t: 'code', v: "ConcurrentHashMap" }, { t: 'text', v: " 的并发控制手段、用设计模式替代长分支。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "HashMap 底层结构推演" },
    { kind: 'h4', text: "数组加链表加红黑树" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "HashMap" }, { t: 'text', v: " 的主体是一个 " }, { t: 'code', v: "Node" }, { t: 'text', v: " 数组（哈希桶）。放入键值对时，先算键的哈希值，再与数组长度减一做与运算定位桶下标——这要求容量始终是 2 的幂，让 " }, { t: 'code', v: "hash & (n - 1)" }, { t: 'text', v: " 等价于取模但快得多。同一桶内发生哈希冲突的条目以链表串起；JDK 8 起，链表长度达到阈值会升级为红黑树，把最坏查找从 O(n) 压到 O(log n)。" }],
    ] },
    { kind: 'h4', text: "负载因子 0.75 的权衡" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "容量达到「当前容量 × 负载因子」时触发扩容。0.75 是空间与时间的折中值：取 1，桶太挤、冲突链变长、查找变慢；取 0.5，空间浪费近半。0.75 恰好在泊松分布下让单个桶的元素数量大概率不超过 8 个。" }],
    ] },
    { kind: 'h4', text: "树化阈值 8 的泊松分布推演" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "源码注释给出依据：在负载因子 0.75 的理想散列条件下，桶内元素数量服从参数约 0.5 的泊松分布，达到 8 个的概率约为千万分之六——正常代码里根本不会发生。因此阈值 8 不是性能调参，而是「非理想散列的告警线」：真走到树化，说明哈希函数写得有问题；而当树退化到 6 个元素以下，又转回链表，避免小树浪费指针空间。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "并发安全与容器选型" },
    { kind: 'h4', text: "并发写入的灾难现场" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "多线程同时写入 " }, { t: 'code', v: "HashMap" }, { t: 'text', v: "：JDK 7 的头插法扩容会形成环形链表，取数时陷入死循环，CPU 打满；JDK 8 改为尾插法消除了成环，但并发写入仍会丢数据、扩容结果被互相覆盖。**任何场景都不许在多线程环境裸用 " }, { t: 'code', v: "HashMap" }, { t: 'text', v: "**，这不是保守，是事故清单换来的结论。" }],
    ] },
    { kind: 'h4', text: "ConcurrentHashMap 的控制手段" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "JDK 8 的 " }, { t: 'code', v: "ConcurrentHashMap" }, { t: 'text', v: " 抛弃了分段锁，改用更细的粒度：桶为空时用 CAS 直接写入，无需加锁；桶非空时只对桶头节点加 " }, { t: 'code', v: "synchronized" }, { t: 'text', v: "，锁的粒度从「段」细化到「单桶」，冲突锁竞争的概率大幅下降。计数用 " }, { t: 'code', v: "LongAdder" }, { t: 'text', v: " 风格的分段累加，避免全局锁。" }],
    ] },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-k\">import</span> <span class=\"tk-k\">java</span>.<span class=\"tk-k\">util</span>.<span class=\"tk-k\">Map</span>;\n<span class=\"tk-k\">import</span> <span class=\"tk-k\">java</span>.<span class=\"tk-k\">util</span>.<span class=\"tk-k\">concurrent</span>.<span class=\"tk-k\">ConcurrentHashMap</span>;\n\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">SessionRegistry</span> {\n    <span class=\"tk-c\">// 多线程环境必须用并发容器，禁止裸 HashMap</span>\n    <span class=\"tk-k\">private</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">Map</span>&lt;<span class=\"tk-k\">String</span>, <span class=\"tk-k\">String</span>&gt; sessions = <span class=\"tk-k\">new</span> <span class=\"tk-k\">ConcurrentHashMap</span>&lt;&gt;();\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">void</span> <span class=\"tk-k\">bind</span>(<span class=\"tk-k\">String</span> userId, <span class=\"tk-k\">String</span> token) {\n        <span class=\"tk-k\">if</span> (userId == <span class=\"tk-s\">null</span> || userId.<span class=\"tk-k\">isBlank</span>() || token == <span class=\"tk-s\">null</span>) {\n            <span class=\"tk-k\">throw</span> <span class=\"tk-k\">new</span> <span class=\"tk-k\">IllegalArgumentException</span>(<span class=\"tk-s\">\"用户与令牌均不允许为空\"</span>);\n        }\n        sessions.<span class=\"tk-k\">put</span>(userId, token);\n    }\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">String</span> <span class=\"tk-k\">tokenOf</span>(<span class=\"tk-k\">String</span> userId) {\n        <span class=\"tk-k\">if</span> (userId == <span class=\"tk-s\">null</span>) {\n            <span class=\"tk-k\">return</span> <span class=\"tk-s\">null</span>; <span class=\"tk-c\">// 空值防御：查询入参为空直接返回，不抛异常</span>\n        }\n        <span class=\"tk-k\">return</span> sessions.<span class=\"tk-k\">get</span>(userId); <span class=\"tk-c\">// 键不存在返回 null，由调用方兜底</span>\n    }\n}", raw: "import java.util.Map;\nimport java.util.concurrent.ConcurrentHashMap;\n\npublic class SessionRegistry {\n    // 多线程环境必须用并发容器，禁止裸 HashMap\n    private final Map<String, String> sessions = new ConcurrentHashMap<>();\n\n    public void bind(String userId, String token) {\n        if (userId == null || userId.isBlank() || token == null) {\n            throw new IllegalArgumentException(\"用户与令牌均不允许为空\");\n        }\n        sessions.put(userId, token);\n    }\n\n    public String tokenOf(String userId) {\n        if (userId == null) {\n            return null; // 空值防御：查询入参为空直接返回，不抛异常\n        }\n        return sessions.get(userId); // 键不存在返回 null，由调用方兜底\n    }\n}" },
    { kind: 'h3', id: 'sec-4', text: "正反例设计范式" },
    { kind: 'h4', text: "反例：多层嵌套 if-else 业务分流" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 反例：每加一种会员等级就要改这个方法，分支越嵌越深</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">double</span> <span class=\"tk-k\">price_bad</span>(<span class=\"tk-k\">double</span> base, <span class=\"tk-k\">String</span> level, <span class=\"tk-k\">boolean</span> festival) {\n    <span class=\"tk-k\">if</span> (level.<span class=\"tk-k\">equals</span>(<span class=\"tk-s\">\"gold\"</span>)) {            <span class=\"tk-c\">// 常量在后，level 为 null 时直接 NPE</span>\n        <span class=\"tk-k\">if</span> (festival) {\n            <span class=\"tk-k\">return</span> base * <span class=\"tk-s\">0.7</span>;\n        } <span class=\"tk-k\">else</span> {\n            <span class=\"tk-k\">return</span> base * <span class=\"tk-s\">0.8</span>;\n        }\n    } <span class=\"tk-k\">else</span> <span class=\"tk-k\">if</span> (level.<span class=\"tk-k\">equals</span>(<span class=\"tk-s\">\"silver\"</span>)) {\n        <span class=\"tk-k\">if</span> (festival) {\n            <span class=\"tk-k\">return</span> base * <span class=\"tk-s\">0.85</span>;\n        } <span class=\"tk-k\">else</span> {\n            <span class=\"tk-k\">return</span> base * <span class=\"tk-s\">0.9</span>;\n        }\n    } <span class=\"tk-k\">else</span> <span class=\"tk-k\">if</span> (level.<span class=\"tk-k\">equals</span>(<span class=\"tk-s\">\"normal\"</span>)) {\n        <span class=\"tk-k\">return</span> festival <span class=\"tk-k\">?</span> base * <span class=\"tk-s\">0.95</span> <span class=\"tk-k\">:</span> base;\n    }\n    <span class=\"tk-k\">return</span> base; <span class=\"tk-c\">// 未知等级静默放过，问题被掩盖</span>\n}", raw: "// 反例：每加一种会员等级就要改这个方法，分支越嵌越深\npublic double price_bad(double base, String level, boolean festival) {\n    if (level.equals(\"gold\")) {            // 常量在后，level 为 null 时直接 NPE\n        if (festival) {\n            return base * 0.7;\n        } else {\n            return base * 0.8;\n        }\n    } else if (level.equals(\"silver\")) {\n        if (festival) {\n            return base * 0.85;\n        } else {\n            return base * 0.9;\n        }\n    } else if (level.equals(\"normal\")) {\n        return festival ? base * 0.95 : base;\n    }\n    return base; // 未知等级静默放过，问题被掩盖\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "隐患拆解：等值判断用变量在前的写法埋下空指针；新增等级必须改动这个日益膨胀的方法，违反开闭原则；未知输入静默返回原价，业务错误无法被发现。" }],
    ] },
    { kind: 'h4', text: "正例：策略模式与工厂模式解耦" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 策略接口：每种定价规则一个实现，互不干扰</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">interface</span> <span class=\"tk-k\">PricePolicy</span> {\n    <span class=\"tk-k\">double</span> <span class=\"tk-k\">apply</span>(<span class=\"tk-k\">double</span> base, <span class=\"tk-k\">boolean</span> festival);\n}\n\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">GoldPolicy</span> <span class=\"tk-k\">implements</span> PricePolicy {\n    @<span class=\"tk-k\">Override</span>\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">double</span> <span class=\"tk-k\">apply</span>(<span class=\"tk-k\">double</span> base, <span class=\"tk-k\">boolean</span> festival) {\n        <span class=\"tk-k\">if</span> (base &lt; <span class=\"tk-s\">0</span>) {\n            <span class=\"tk-k\">throw</span> <span class=\"tk-k\">new</span> <span class=\"tk-k\">IllegalArgumentException</span>(<span class=\"tk-s\">\"基础价不允许为负\"</span>);\n        }\n        <span class=\"tk-k\">return</span> festival <span class=\"tk-k\">?</span> base * <span class=\"tk-s\">0.7</span> <span class=\"tk-k\">:</span> base * <span class=\"tk-s\">0.8</span>;\n    }\n}\n\n<span class=\"tk-c\">// 工厂：用不可变表注册策略，未知等级快速失败而不是静默放过</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">PricePolicyFactory</span> {\n    <span class=\"tk-k\">private</span> <span class=\"tk-k\">static</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">Map</span>&lt;<span class=\"tk-k\">String</span>, <span class=\"tk-k\">PricePolicy</span>&gt; REGISTRY =\n            Map.<span class=\"tk-k\">of</span>(<span class=\"tk-s\">\"gold\"</span>, <span class=\"tk-k\">new</span> <span class=\"tk-k\">GoldPolicy</span>());\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">static</span> <span class=\"tk-k\">PricePolicy</span> <span class=\"tk-k\">of</span>(<span class=\"tk-k\">String</span> level) {\n        <span class=\"tk-k\">PricePolicy</span> policy = REGISTRY.<span class=\"tk-k\">get</span>(level == <span class=\"tk-s\">null</span> <span class=\"tk-k\">?</span> <span class=\"tk-s\">\"\"</span> <span class=\"tk-k\">:</span> level);\n        <span class=\"tk-k\">if</span> (policy == <span class=\"tk-s\">null</span>) {\n            <span class=\"tk-k\">throw</span> <span class=\"tk-k\">new</span> <span class=\"tk-k\">IllegalArgumentException</span>(<span class=\"tk-s\">\"未知会员等级: \"</span> + level);\n        }\n        <span class=\"tk-k\">return</span> policy;\n    }\n}", raw: "// 策略接口：每种定价规则一个实现，互不干扰\npublic interface PricePolicy {\n    double apply(double base, boolean festival);\n}\n\npublic final class GoldPolicy implements PricePolicy {\n    @Override\n    public double apply(double base, boolean festival) {\n        if (base < 0) {\n            throw new IllegalArgumentException(\"基础价不允许为负\");\n        }\n        return festival ? base * 0.7 : base * 0.8;\n    }\n}\n\n// 工厂：用不可变表注册策略，未知等级快速失败而不是静默放过\npublic final class PricePolicyFactory {\n    private static final Map<String, PricePolicy> REGISTRY =\n            Map.of(\"gold\", new GoldPolicy());\n\n    public static PricePolicy of(String level) {\n        PricePolicy policy = REGISTRY.get(level == null ? \"\" : level);\n        if (policy == null) {\n            throw new IllegalArgumentException(\"未知会员等级: \" + level);\n        }\n        return policy;\n    }\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "新增等级只需增加一个实现类并注册一行，原有代码零改动——这就是面向扩展开放、面向修改关闭。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "对象存入 Map 取不出" }], [{ t: 'text', v: "重写 " }, { t: 'code', v: "equals" }, { t: 'text', v: " 忘了重写 " }, { t: 'code', v: "hashCode" }], [{ t: 'text', v: "两者必须成对重写，用 IDE 一起生成" }]],
        [[{ t: 'code', v: "foreach" }, { t: 'text', v: " 中删除抛并发修改异常" }], [{ t: 'text', v: "迭代器外直接调集合 " }, { t: 'code', v: "remove" }], [{ t: 'text', v: "用 " }, { t: 'code', v: "Iterator.remove()" }, { t: 'text', v: " 或 " }, { t: 'code', v: "removeIf" }]],
        [[{ t: 'text', v: "容器 CPU 打满死循环" }], [{ t: 'text', v: "多线程写裸 " }, { t: 'code', v: "HashMap" }, { t: 'text', v: "（JDK 7 环链）" }], [{ t: 'text', v: "换 " }, { t: 'code', v: "ConcurrentHashMap" }, { t: 'text', v: "，全量排查裸容器" }]],
        [[{ t: 'text', v: "大集合扩容卡顿" }], [{ t: 'text', v: "未预估规模反复扩容" }], [{ t: 'text', v: "构造时给出初始容量：" }, { t: 'code', v: "new HashMap<>(预估量 / 0.75 + 1)" }]],
        [[{ t: 'text', v: "金额比较不相等" }], [{ t: 'text', v: "用 " }, { t: 'code', v: "double" }, { t: 'text', v: " 存金额" }], [{ t: 'text', v: "金额一律 " }, { t: 'code', v: "BigDecimal" }, { t: 'text', v: "，比较用 " }, { t: 'code', v: "compareTo" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对象判等与哈希的正确姿势，也是评审必查项：" }],
    ] },
    { kind: 'code', lang: 'java', html: "@<span class=\"tk-k\">Override</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">boolean</span> <span class=\"tk-k\">equals</span>(<span class=\"tk-k\">Object</span> o) {\n    <span class=\"tk-k\">if</span> (<span class=\"tk-k\">this</span> == o) <span class=\"tk-k\">return</span> <span class=\"tk-s\">true</span>;                 <span class=\"tk-c\">// 同一引用快速返回</span>\n    <span class=\"tk-k\">if</span> (!(o instanceof <span class=\"tk-k\">Student</span> other)) <span class=\"tk-k\">return</span> <span class=\"tk-s\">false</span>; <span class=\"tk-c\">// 类型检查兼空值防御</span>\n    <span class=\"tk-k\">return</span> id == other.id &amp;&amp; name.<span class=\"tk-k\">equals</span>(other.name);\n}\n\n@<span class=\"tk-k\">Override</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">int</span> <span class=\"tk-k\">hashCode</span>() {\n    <span class=\"tk-k\">return</span> Objects.<span class=\"tk-k\">hash</span>(id, name);              <span class=\"tk-c\">// 与 equals 字段严格对应</span>\n}", raw: "@Override\npublic boolean equals(Object o) {\n    if (this == o) return true;                 // 同一引用快速返回\n    if (!(o instanceof Student other)) return false; // 类型检查兼空值防御\n    return id == other.id && name.equals(other.name);\n}\n\n@Override\npublic int hashCode() {\n    return Objects.hash(id, name);              // 与 equals 字段严格对应\n}" },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "实现一个单机综合信息管理系统：学生信息的多维度增删查改、自定义文件格式持久化、异常兜底全覆盖。" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "面向对象" }], [{ t: 'text', v: "领域模型至少三层：实体、仓储、服务，职责清晰不越界" }]],
        [[{ t: 'text', v: "持久化" }], [{ t: 'text', v: "自定义文本格式落盘，读入时损坏行跳过并记日志，不允许整库崩溃" }]],
        [[{ t: 'text', v: "异常兜底" }], [{ t: 'text', v: "文件不存在、格式错误、重复主键均有专属异常与友好提示" }]],
        [[{ t: 'text', v: "多维度排序" }], [{ t: 'text', v: "支持按总分、姓名、学号组合排序，比较器可插拔" }]],
        [[{ t: 'text', v: "集合规范" }], [{ t: 'text', v: "判等成对重写 " }, { t: 'code', v: "equals" }, { t: 'text', v: " 与 " }, { t: 'code', v: "hashCode" }, { t: 'text', v: "；容量给出初始预估" }]],
        [[{ t: 'text', v: "防御性代码" }], [{ t: 'text', v: "所有外部输入（文件行、控制台输入）先校验后使用" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-system-database',
    index: '05',
    category: 'roadmap',
    title: "阶段四：Linux 系统底座与 MySQL 数据库核心",
    summary: "系统与数据筑基：Linux 权限与服务管理、InnoDB 索引原理与事务并发机制。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "Linux 系统底座实操" },
      { id: 'sec-3', text: "InnoDB 索引与 B+ 树底层" },
      { id: 'sec-4', text: "事务、隔离级别与并发控制" },
      { id: 'sec-5', text: "正反例与执行计划诊断" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "后端服务从写下的第一天起就运行在 Linux 上、把数据落在 MySQL 里。不会 Linux，部署排障全依赖别人；不懂存储引擎，慢查询只会盲目加索引碰运气。本阶段把「系统底座」与「数据基座」一次打齐，是阶段五企业级开发的前置条件。" }],
    ] },
    { kind: 'h4', text: "为什么先原理后命令" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Linux 命令与 SQL 语法都容易速成，但真正拉开差距的是原理：权限位怎么读、服务为什么起不来、索引为什么没生效。本阶段每学一组命令，都要落到「它改动了系统的哪个状态」，拒绝无理解的复制粘贴。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "Linux 系统底座实操" },
    { kind: 'h4', text: "用户权限体系" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "文件权限以三组三位的结构表达：属主、属组、其他人各占读（r=4）、写（w=2）、执行（x=1）三位。" }, { t: 'code', v: "-rw-r--r--" }, { t: 'text', v: " 即 644：属主可读写，其余人只读。生产纪律：应用进程一律用低权限专属用户运行，禁止 root 直跑；密钥文件收敛到 600。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 查看权限与属主，确认服务账号与密钥位是否符合基线</span>\n<span class=\"tk-k\">ls</span> -l /opt/app/app.jar\n\n<span class=\"tk-c\"># 授权目录给服务账号，避免用 777 这种彻底放权的写法</span>\n<span class=\"tk-k\">sudo</span> chown -R appuser:appgroup /opt/app\n<span class=\"tk-k\">chmod</span> <span class=\"tk-s\">750</span> /opt/app\n<span class=\"tk-k\">chmod</span> <span class=\"tk-s\">600</span> /opt/app/.env   <span class=\"tk-c\"># 含密钥的配置文件必须只有属主可读</span>\n\n<span class=\"tk-c\"># 切换服务账号验证权限最小化是否成立</span>\n<span class=\"tk-k\">sudo</span> -u appuser whoami", raw: "# 查看权限与属主，确认服务账号与密钥位是否符合基线\nls -l /opt/app/app.jar\n\n# 授权目录给服务账号，避免用 777 这种彻底放权的写法\nsudo chown -R appuser:appgroup /opt/app\nchmod 750 /opt/app\nchmod 600 /opt/app/.env   # 含密钥的配置文件必须只有属主可读\n\n# 切换服务账号验证权限最小化是否成立\nsudo -u appuser whoami" },
    { kind: 'h4', text: "systemd 服务管理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "生产服务一律注册为 " }, { t: 'code', v: "systemd" }, { t: 'text', v: " 单元，获得开机自启、崩溃拉起与统一日志三件套。核心命令四件：" }, { t: 'code', v: "systemctl start|stop|restart|status 服务名" }, { t: 'text', v: "；排障先看 " }, { t: 'code', v: "systemctl status" }, { t: 'text', v: " 的最近日志，再看 " }, { t: 'code', v: "journalctl -u 服务名 -n 100" }, { t: 'text', v: " 的全量输出。" }],
    ] },
    { kind: 'h4', text: "进程与资源排查三板斧" },
    { kind: 'table',
      head: [[{ t: 'text', v: "工具" }], [{ t: 'text', v: "回答的问题" }], [{ t: 'text', v: "常用姿势" }]],
      rows: [
        [[{ t: 'code', v: "top" }], [{ t: 'text', v: "谁在吃 CPU 与内存" }], [{ t: 'text', v: "按 " }, { t: 'code', v: "M" }, { t: 'text', v: " 按内存排序，盯 " }, { t: 'code', v: "load average" }]],
        [[{ t: 'code', v: "ps" }], [{ t: 'text', v: "进程在不在、以谁的身份在跑" }], [{ t: 'text', v: "`ps -ef" }], [{ t: 'text', v: "grep java`" }]],
        [[{ t: 'code', v: "ss" }], [{ t: 'text', v: "端口被谁监听、连接堵在哪" }], [{ t: 'code', v: "ss -lntp" }, { t: 'text', v: " 看监听" }]],
      ] },
    { kind: 'h3', id: 'sec-3', text: "InnoDB 索引与 B+ 树底层" },
    { kind: 'h4', text: "为什么是 B+ 树" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "数据库索引要解决的是「磁盘上千万行里快速定位」的问题。B+ 树是多路平衡查找树：一个节点占一个磁盘页（16KB），扇出极大，三层树高即可索引两千万行级别的表，定位一行最多三次磁盘 IO。B+ 树相比 B 树的关键差异在叶子层：" }, { t: 'strong', v: "所有数据都落在叶子节点，且叶子之间以双向链表串起" }, { t: 'text', v: "——范围查询只需定位到起点，然后沿链表顺序扫描，不必回树。" }],
    ] },
    { kind: 'h4', text: "聚簇索引与二级索引" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "InnoDB 的表数据本身就按主键组织成 B+ 树，这棵树叫聚簇索引：叶子节点直接存整行数据。其他索引（二级索引）的叶子里存的不是行，而是主键值。因此走二级索引查整行要两步：先在二级索引树里拿到主键，再回聚簇索引树里按主键取行——第二步就是" }, { t: 'strong', v: "回表" }, { t: 'text', v: "，它是一次完整的二次查找，回表次数多，查询就慢。" }],
    ] },
    { kind: 'h4', text: "覆盖索引消灭回表" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "如果查询需要的列恰好都在二级索引里，就不必回表，这叫覆盖索引。" }, { t: 'code', v: "EXPLAIN" }, { t: 'text', v: " 输出里出现 " }, { t: 'code', v: "Using index" }, { t: 'text', v: " 即命中。大结果集的分页与列表页查询，应优先设计覆盖索引，或改为游标式分页。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "事务、隔离级别与并发控制" },
    { kind: 'h4', text: "ACID 的实现支柱" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "原子性（A）靠 undo log：事务回滚时按反向日志撤销修改。持久性（D）靠 redo log：修改先写日志再刷数据页，崩溃后可重放。隔离性（I）靠锁与 MVCC 的组合。一致性（C）是前三者共同达成的业务目标。" }],
    ] },
    { kind: 'h4', text: "四种隔离级别与副作用" },
    { kind: 'table',
      head: [[{ t: 'text', v: "隔离级别" }], [{ t: 'text', v: "脏读" }], [{ t: 'text', v: "不可重复读" }], [{ t: 'text', v: "幻读" }], [{ t: 'text', v: "说明" }]],
      rows: [
        [[{ t: 'text', v: "读未提交" }], [{ t: 'text', v: "可能" }], [{ t: 'text', v: "可能" }], [{ t: 'text', v: "可能" }], [{ t: 'text', v: "几乎不用" }]],
        [[{ t: 'text', v: "读已提交（RC）" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "可能" }], [{ t: 'text', v: "可能" }], [{ t: 'text', v: "Oracle 默认" }]],
        [[{ t: 'text', v: "可重复读（RR）" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "InnoDB 基本消除" }], [{ t: 'text', v: "MySQL 默认" }]],
        [[{ t: 'text', v: "串行化" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "不会" }], [{ t: 'text', v: "全加锁，并发最差" }]],
      ] },
    { kind: 'h4', text: "MVCC 与 Next-Key Lock" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "MVCC（多版本并发控制）让读不加锁：每行数据带隐藏的事务版本号与回滚指针，事务按自己的一致性视图读取历史版本，读写互不阻塞，这是 InnoDB 高并发的根基。写与写的冲突则靠锁：RR 级别下的" }, { t: 'strong', v: "Next-Key Lock" }, { t: 'text', v: " 锁住记录与其前一段间隙，既防并发改同行，又堵住间隙插入造成的幻读。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "正反例与执行计划诊断" },
    { kind: 'h4', text: "反例：三种典型索引失效写法" },
    { kind: 'code', lang: 'sql', html: "<span class=\"tk-c\">-- 反例一：对索引列做函数包装，索引树无法定位，全表扫描</span>\n<span class=\"tk-k\">SELECT</span> * <span class=\"tk-k\">FROM</span> student <span class=\"tk-k\">WHERE</span> <span class=\"tk-k\">YEAR</span>(create_time) = <span class=\"tk-s\">2026</span>;\n\n<span class=\"tk-c\">-- 反例二：隐式类型转换，phone 是字符串列，传数字触发列上隐式转换</span>\n<span class=\"tk-k\">SELECT</span> * <span class=\"tk-k\">FROM</span> student <span class=\"tk-k\">WHERE</span> phone = <span class=\"tk-s\">13800138000</span>;\n\n<span class=\"tk-c\">-- 反例三：联合索引 (grade, class_id) 跳过最左列直接查 class_id</span>\n<span class=\"tk-k\">SELECT</span> * <span class=\"tk-k\">FROM</span> student <span class=\"tk-k\">WHERE</span> class_id = <span class=\"tk-s\">3</span>;", raw: "-- 反例一：对索引列做函数包装，索引树无法定位，全表扫描\nSELECT * FROM student WHERE YEAR(create_time) = 2026;\n\n-- 反例二：隐式类型转换，phone 是字符串列，传数字触发列上隐式转换\nSELECT * FROM student WHERE phone = 13800138000;\n\n-- 反例三：联合索引 (grade, class_id) 跳过最左列直接查 class_id\nSELECT * FROM student WHERE class_id = 3;" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "隐患拆解：函数与运算让索引树的有序性失去意义；隐式类型转换等价于在列上套了转换函数；最左前缀缺失则根本没有可用的有序起点。三者的共同症状是 " }, { t: 'code', v: "EXPLAIN" }, { t: 'text', v: " 中 " }, { t: 'code', v: "type" }, { t: 'text', v: " 掉到 " }, { t: 'code', v: "ALL" }, { t: 'text', v: "，行数扫满全表。" }],
    ] },
    { kind: 'h4', text: "正例：可索引写法与覆盖分页" },
    { kind: 'code', lang: 'sql', html: "<span class=\"tk-c\">-- 正例一：范围改写成索引列裸奔的形式</span>\n<span class=\"tk-k\">SELECT</span> * <span class=\"tk-k\">FROM</span> student\n<span class=\"tk-k\">WHERE</span> create_time &gt;= <span class=\"tk-s\">'2026-01-01'</span> <span class=\"tk-k\">AND</span> create_time &lt; <span class=\"tk-s\">'2027-01-01'</span>;\n\n<span class=\"tk-c\">-- 正例二：类型严格匹配，字符串列配字符串字面量</span>\n<span class=\"tk-k\">SELECT</span> * <span class=\"tk-k\">FROM</span> student <span class=\"tk-k\">WHERE</span> phone = <span class=\"tk-s\">'13800138000'</span>;\n\n<span class=\"tk-c\">-- 正例三：深分页不用 LIMIT 100000, 20（前十万行读了又丢），</span>\n<span class=\"tk-c\">-- 改为主键游标：上一页最后一行的主键作为起点，回表量恒定</span>\n<span class=\"tk-k\">SELECT</span> id, <span class=\"tk-k\">name</span>, score <span class=\"tk-k\">FROM</span> student\n<span class=\"tk-k\">WHERE</span> id &gt; <span class=\"tk-s\">86000</span> <span class=\"tk-k\">ORDER BY</span> id <span class=\"tk-k\">LIMIT</span> <span class=\"tk-s\">20</span>;", raw: "-- 正例一：范围改写成索引列裸奔的形式\nSELECT * FROM student\nWHERE create_time >= '2026-01-01' AND create_time < '2027-01-01';\n\n-- 正例二：类型严格匹配，字符串列配字符串字面量\nSELECT * FROM student WHERE phone = '13800138000';\n\n-- 正例三：深分页不用 LIMIT 100000, 20（前十万行读了又丢），\n-- 改为主键游标：上一页最后一行的主键作为起点，回表量恒定\nSELECT id, name, score FROM student\nWHERE id > 86000 ORDER BY id LIMIT 20;" },
    { kind: 'h4', text: "EXPLAIN 读图要点" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "诊断先看三列：" }, { t: 'code', v: "type" }, { t: 'text', v: " 从好到差大致为 " }, { t: 'code', v: "const > eq_ref > ref > range > index > ALL" }, { t: 'text', v: "，线上查询不允许出现 " }, { t: 'code', v: "ALL" }, { t: 'text', v: "；" }, { t: 'code', v: "key" }, { t: 'text', v: " 显示真正用到的索引，为空说明优化器放弃了索引；" }, { t: 'code', v: "Extra" }, { t: 'text', v: " 出现 " }, { t: 'code', v: "Using filesort" }, { t: 'text', v: " 或 " }, { t: 'code', v: "Using temporary" }, { t: 'text', v: " 说明有额外排序或临时表，是重点优化对象。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "设计一套多表关联业务库（学生、课程、选课、成绩），提交建库脚本与执行计划诊断报告。" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "表结构规范" }], [{ t: 'text', v: "主键明确、外键约束完整、唯一索引覆盖业务唯一性（如学号）" }]],
        [[{ t: 'text', v: "索引设计" }], [{ t: 'text', v: "高频查询均有覆盖索引或最左前缀匹配，能讲清每条索引的依据" }]],
        [[{ t: 'text', v: "统计查询" }], [{ t: 'text', v: "完成按班级、课程的多维分组统计与排名窗口函数练习" }]],
        [[{ t: 'text', v: "执行计划" }], [{ t: 'text', v: "核心查询 " }, { t: 'code', v: "EXPLAIN" }, { t: 'text', v: " 无 " }, { t: 'code', v: "ALL" }, { t: 'text', v: " 与 " }, { t: 'code', v: "Using filesort" }, { t: 'text', v: "，报告附优化前后对比" }]],
        [[{ t: 'text', v: "事务实践" }], [{ t: 'text', v: "手写一个转账式事务脚本，演示回滚与隔离级别差异" }]],
        [[{ t: 'text', v: "Linux 配套" }], [{ t: 'text', v: "数据库部署在 Linux 虚拟机，以服务方式运行并能用三板斧排查" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-enterprise-web',
    index: '06',
    category: 'roadmap',
    title: "阶段五：Maven 构建、MyBatis 与企业级三层架构",
    summary: "企业级筑基：Maven 依赖治理、三层分层纪律、MyBatis 持久层与声明式事务。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "Maven 依赖仲裁与构建模型" },
      { id: 'sec-3', text: "三层架构的单向分层纪律" },
      { id: 'sec-4', text: "MyBatis 持久层实战" },
      { id: 'sec-5', text: "声明式事务与失效场景" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "阶段五是从「写程序」跨到「做工程」的分水岭。单体脚本能跑不叫工程：依赖要可仲裁、模块要可分工、事务要可追责、接口要可契约。本阶段以 Maven、Spring Boot、MyBatis 三件套为载体，建立企业级后端的骨架认知。" }],
    ] },
    { kind: 'h4', text: "三件套各管一层" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Maven 管「构建与依赖」：谁的包、什么版本、冲突听谁的。Spring Boot 管「组装与运行时」：对象生命周期、事务代理、Web 容器。MyBatis 管「数据进出」：SQL 与对象之间的映射。三者边界清晰，学的时候也按这个边界分开学，不要搅成一锅。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "Maven 依赖仲裁与构建模型" },
    { kind: 'h4', text: "依赖冲突的最短路径原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Maven 解析依赖树时，同一个构件出现多个版本，按两条规则仲裁：" }, { t: 'strong', v: "路径最短优先" }, { t: 'text', v: "——离根节点传递层数少的版本胜出；层数相同时" }, { t: 'strong', v: "先声明者胜" }, { t: 'text', v: "。仲裁结果不可靠猜，必须显式查验：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 打印完整依赖树，定位冲突构件的两条来源路径</span>\n<span class=\"tk-k\">mvn</span> dependency:tree -Dverbose\n\n<span class=\"tk-c\"># 只过滤关心的构件，确认最终仲裁到的版本</span>\n<span class=\"tk-k\">mvn</span> dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind", raw: "# 打印完整依赖树，定位冲突构件的两条来源路径\nmvn dependency:tree -Dverbose\n\n# 只过滤关心的构件，确认最终仲裁到的版本\nmvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind" },
    { kind: 'h4', text: "依赖排除与版本锁定" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "确认冲突后，在引入方的 " }, { t: 'code', v: "<dependency>" }, { t: 'text', v: " 里用 " }, { t: 'code', v: "<exclusions>" }, { t: 'text', v: " 排除旧版本路径；多模块项目中，统一在父 POM 的 " }, { t: 'code', v: "<dependencyManagement>" }, { t: 'text', v: " 锁版本——子模块只写 " }, { t: 'code', v: "groupId" }, { t: 'text', v: " 与 " }, { t: 'code', v: "artifactId" }, { t: 'text', v: "，版本全局唯一来源，杜绝各模块版本漂移。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "三层架构的单向分层纪律" },
    { kind: 'h4', text: "Controller-Service-Mapper 的职责分界" },
    { kind: 'table',
      head: [[{ t: 'text', v: "层" }], [{ t: 'text', v: "职责" }], [{ t: 'text', v: "禁止事项" }]],
      rows: [
        [[{ t: 'text', v: "Controller" }], [{ t: 'text', v: "参数校验、协议转换、调用 Service" }], [{ t: 'text', v: "不写业务逻辑，不碰 Mapper" }]],
        [[{ t: 'text', v: "Service" }], [{ t: 'text', v: "业务编排、事务边界、对象转换" }], [{ t: 'text', v: "不处理 HTTP 细节，不拼 SQL" }]],
        [[{ t: 'text', v: "Mapper" }], [{ t: 'text', v: "单表或简单关联的 SQL 访问" }], [{ t: 'text', v: "不含任何业务判断" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "依赖方向必须单向：Controller → Service → Mapper。反向依赖或跨层调用（Controller 直连 Mapper）会让事务边界、日志切面与参数校验全部绕过，是评审一票否决项。" }],
    ] },
    { kind: 'h4', text: "反例与正例：跨层调用 vs 对象流转" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 反例：控制器直连 Mapper，事务、校验、日志全被绕过</span>\n@<span class=\"tk-k\">RestController</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">BadUserController</span> {\n    @<span class=\"tk-k\">Autowired</span>\n    <span class=\"tk-k\">private</span> <span class=\"tk-k\">UserMapper</span> userMapper;\n\n    @<span class=\"tk-k\">PostMapping</span>(<span class=\"tk-s\">\"/users\"</span>)\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">Object</span> <span class=\"tk-k\">save</span>(@<span class=\"tk-k\">RequestBody</span> <span class=\"tk-k\">Map</span>&lt;<span class=\"tk-k\">String</span>, <span class=\"tk-k\">Object</span>&gt; raw) {\n        <span class=\"tk-k\">User</span> u = <span class=\"tk-k\">new</span> <span class=\"tk-k\">User</span>();\n        u.<span class=\"tk-k\">setName</span>((String) raw.<span class=\"tk-k\">get</span>(<span class=\"tk-s\">\"name\"</span>)); <span class=\"tk-c\">// 裸 Map 取值，无校验无类型</span>\n        userMapper.<span class=\"tk-k\">insert</span>(u);                <span class=\"tk-c\">// 无事务边界，出错无兜底</span>\n        <span class=\"tk-k\">return</span> u;                            <span class=\"tk-c\">// 实体直出，密码字段也漏给前端</span>\n    }\n}", raw: "// 反例：控制器直连 Mapper，事务、校验、日志全被绕过\n@RestController\npublic class BadUserController {\n    @Autowired\n    private UserMapper userMapper;\n\n    @PostMapping(\"/users\")\n    public Object save(@RequestBody Map<String, Object> raw) {\n        User u = new User();\n        u.setName((String) raw.get(\"name\")); // 裸 Map 取值，无校验无类型\n        userMapper.insert(u);                // 无事务边界，出错无兜底\n        return u;                            // 实体直出，密码字段也漏给前端\n    }\n}" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 正例：DTO 进、校验、Service 事务、VO 出，对象各司其职</span>\n@<span class=\"tk-k\">RestController</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">UserController</span> {\n    <span class=\"tk-k\">private</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">UserService</span> userService;\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">UserController</span>(<span class=\"tk-k\">UserService</span> userService) { <span class=\"tk-c\">// 构造器注入，依赖显式可见</span>\n        <span class=\"tk-k\">this</span>.userService = userService;\n    }\n\n    @<span class=\"tk-k\">PostMapping</span>(<span class=\"tk-s\">\"/users\"</span>)\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">Result</span>&lt;<span class=\"tk-k\">UserVO</span>&gt; <span class=\"tk-k\">save</span>(@<span class=\"tk-k\">Valid</span> @<span class=\"tk-k\">RequestBody</span> <span class=\"tk-k\">UserDTO</span> dto) {\n        <span class=\"tk-k\">return</span> Result.<span class=\"tk-k\">ok</span>(userService.<span class=\"tk-k\">register</span>(dto)); <span class=\"tk-c\">// 返回 VO，绝不外泄实体</span>\n    }\n}\n\n@<span class=\"tk-k\">Service</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">UserServiceImpl</span> <span class=\"tk-k\">implements</span> UserService {\n    <span class=\"tk-k\">private</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">UserMapper</span> userMapper;\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">UserServiceImpl</span>(<span class=\"tk-k\">UserMapper</span> userMapper) {\n        <span class=\"tk-k\">this</span>.userMapper = userMapper;\n    }\n\n    @<span class=\"tk-k\">Override</span>\n    @<span class=\"tk-k\">Transactional</span>(rollbackFor = Exception.class) <span class=\"tk-c\">// 事务只落在 Service 层</span>\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">UserVO</span> <span class=\"tk-k\">register</span>(<span class=\"tk-k\">UserDTO</span> dto) {\n        <span class=\"tk-k\">if</span> (userMapper.<span class=\"tk-k\">existsByName</span>(dto.<span class=\"tk-k\">name</span>())) {\n            <span class=\"tk-k\">throw</span> <span class=\"tk-k\">new</span> <span class=\"tk-k\">BizException</span>(ErrorCode.NAME_TAKEN); <span class=\"tk-c\">// 业务异常枚举</span>\n        }\n        <span class=\"tk-k\">User</span> entity = UserConvert.<span class=\"tk-k\">toEntity</span>(dto);\n        userMapper.<span class=\"tk-k\">insert</span>(entity);\n        <span class=\"tk-k\">return</span> UserConvert.<span class=\"tk-k\">toVO</span>(entity);\n    }\n}", raw: "// 正例：DTO 进、校验、Service 事务、VO 出，对象各司其职\n@RestController\npublic class UserController {\n    private final UserService userService;\n\n    public UserController(UserService userService) { // 构造器注入，依赖显式可见\n        this.userService = userService;\n    }\n\n    @PostMapping(\"/users\")\n    public Result<UserVO> save(@Valid @RequestBody UserDTO dto) {\n        return Result.ok(userService.register(dto)); // 返回 VO，绝不外泄实体\n    }\n}\n\n@Service\npublic class UserServiceImpl implements UserService {\n    private final UserMapper userMapper;\n\n    public UserServiceImpl(UserMapper userMapper) {\n        this.userMapper = userMapper;\n    }\n\n    @Override\n    @Transactional(rollbackFor = Exception.class) // 事务只落在 Service 层\n    public UserVO register(UserDTO dto) {\n        if (userMapper.existsByName(dto.name())) {\n            throw new BizException(ErrorCode.NAME_TAKEN); // 业务异常枚举\n        }\n        User entity = UserConvert.toEntity(dto);\n        userMapper.insert(entity);\n        return UserConvert.toVO(entity);\n    }\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "三类对象的铁律：" }, { t: 'strong', v: "DTO 只装请求参数、Entity 只映射表结构、VO 只装响应字段" }, { t: 'text', v: "。密码、内部状态等字段永远不出现在 VO 里。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "MyBatis 持久层实战" },
    { kind: 'h4', text: "动态 SQL 三件套" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "<if>" }, { t: 'text', v: " 做条件拼接，" }, { t: 'code', v: "<where>" }, { t: 'text', v: " 自动处理首个条件的 " }, { t: 'code', v: "AND" }, { t: 'text', v: " 前缀，" }, { t: 'code', v: "<foreach>" }, { t: 'text', v: " 展开集合。参数一律走 " }, { t: 'code', v: "#{}" }, { t: 'text', v: " 预编译占位符，" }, { t: 'code', v: "${}" }, { t: 'text', v: " 是字符串直接拼接，只允许用于无法参数化的表名排序字段且必须白名单校验。" }],
    ] },
    { kind: 'details', title: "动态条件查询映射文件示例", blocks: [
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">说明</span>\": <span class=\"tk-s\">\"此处以 MyBatis XML 片段的等价逻辑描述，实际工程放在 mapper.xml\"</span>,\n  \"<span class=\"tk-k\">select</span>\": <span class=\"tk-s\">\"SELECT id, name, grade FROM student\"</span>,\n  \"<span class=\"tk-k\">where</span>\": [\n    { \"<span class=\"tk-k\">if</span>\": <span class=\"tk-s\">\"name 非空\"</span>, \"<span class=\"tk-k\">条件</span>\": <span class=\"tk-s\">\"AND name LIKE CONCAT('%', #{name}, '%')\"</span> },\n    { \"<span class=\"tk-k\">if</span>\": <span class=\"tk-s\">\"grade 非空\"</span>, \"<span class=\"tk-k\">条件</span>\": <span class=\"tk-s\">\"AND grade = #{grade}\"</span> },\n    { \"<span class=\"tk-k\">if</span>\": <span class=\"tk-s\">\"ids 非空\"</span>, \"<span class=\"tk-k\">条件</span>\": <span class=\"tk-s\">\"AND id IN (foreach 展开 #{ids})\"</span> }\n  ],\n  \"<span class=\"tk-k\">安全约束</span>\": <span class=\"tk-s\">\"全部使用 #{} 预编译占位符，禁止 ${} 拼接用户输入\"</span>\n}", raw: "{\n  \"说明\": \"此处以 MyBatis XML 片段的等价逻辑描述，实际工程放在 mapper.xml\",\n  \"select\": \"SELECT id, name, grade FROM student\",\n  \"where\": [\n    { \"if\": \"name 非空\", \"条件\": \"AND name LIKE CONCAT('%', #{name}, '%')\" },\n    { \"if\": \"grade 非空\", \"条件\": \"AND grade = #{grade}\" },\n    { \"if\": \"ids 非空\", \"条件\": \"AND id IN (foreach 展开 #{ids})\" }\n  ],\n  \"安全约束\": \"全部使用 #{} 预编译占位符，禁止 ${} 拼接用户输入\"\n}" },
    { kind: 'code', lang: 'sql', html: "<span class=\"tk-c\">-- 对应的最终生成语句形态（条件齐备时）</span>\n<span class=\"tk-k\">SELECT</span> id, <span class=\"tk-k\">name</span>, grade <span class=\"tk-k\">FROM</span> student\n<span class=\"tk-k\">WHERE</span> <span class=\"tk-k\">name</span> <span class=\"tk-k\">LIKE</span> <span class=\"tk-k\">CONCAT</span>(<span class=\"tk-s\">'%'</span>, ?, <span class=\"tk-s\">'%'</span>)\n  <span class=\"tk-k\">AND</span> grade = ?\n  <span class=\"tk-k\">AND</span> id <span class=\"tk-k\">IN</span> (?, ?, ?)", raw: "-- 对应的最终生成语句形态（条件齐备时）\nSELECT id, name, grade FROM student\nWHERE name LIKE CONCAT('%', ?, '%')\n  AND grade = ?\n  AND id IN (?, ?, ?)" },
    ] },
    { kind: 'h4', text: "缓存失效机理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "MyBatis 一级缓存绑定在 SqlSession 上：同一会话内相同查询直接命中，但任何增删改或手动 " }, { t: 'code', v: "clearCache" }, { t: 'text', v: " 都会清空；Spring 集成下每个请求通常自持一个会话，一级缓存的收益有限，却曾引发「查到自己刚改前的旧值」的事故。二级缓存绑定在 Mapper 命名空间，跨会话共享，但多表关联更新无法联动失效，生产环境默认关闭，缓存职责交给 Redis 这类外部设施。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "声明式事务与失效场景" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "@Transactional" }, { t: 'text', v: " 的本质是 AOP 代理：Spring 给 Bean 生成代理对象，在方法前后织入开启、提交、回滚事务的逻辑。理解了「事务由代理控制」，三种经典失效场景就不再需要死记：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "失效场景" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复" }]],
      rows: [
        [[{ t: 'text', v: "同类内部自调用" }], [{ t: 'code', v: "this.method()" }, { t: 'text', v: " 绕过代理，事务注解形同虚设" }], [{ t: 'text', v: "拆到另一个 Bean，或注入自身代理" }]],
        [[{ t: 'text', v: "异常被 " }, { t: 'code', v: "catch" }, { t: 'text', v: " 吞掉" }], [{ t: 'text', v: "代理感知不到异常，按成功提交" }], [{ t: 'text', v: "捕获后显式 " }, { t: 'code', v: "setRollbackOnly()" }, { t: 'text', v: " 或重抛" }]],
        [[{ t: 'text', v: "抛出受检异常" }], [{ t: 'text', v: "默认只回滚运行时异常" }], [{ t: 'code', v: "rollbackFor = Exception.class" }, { t: 'text', v: " 全量声明" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "另有一条纪律：事务方法必须 " }, { t: 'code', v: "public" }, { t: 'text', v: "，私有方法上的注解同样不会被代理织入。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "搭建基于 Spring Boot 与 MyBatis-Plus 的企业级脚手架，实现双 Token（访问令牌 + 刷新令牌）无感刷新认证接口。" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "分层纪律" }], [{ t: 'text', v: "依赖单向，评审工具检查无跨层调用，DTO/Entity/VO 三类对象齐备" }]],
        [[{ t: 'text', v: "依赖治理" }], [{ t: 'code', v: "mvn dependency:tree" }, { t: 'text', v: " 无冲突告警，版本统一由父 POM 管理" }]],
        [[{ t: 'text', v: "双 Token 认证" }], [{ t: 'text', v: "访问令牌过期后自动用刷新令牌换新，前端调用方无感知" }]],
        [[{ t: 'text', v: "事务正确性" }], [{ t: 'text', v: "注册接口注入异常验证回滚，无脏数据残留" }]],
        [[{ t: 'text', v: "持久层规范" }], [{ t: 'text', v: "全部参数走预编译占位符，二级缓存关闭并有注释说明" }]],
        [[{ t: 'text', v: "异常体系" }], [{ t: 'text', v: "业务异常走枚举错误码，全局拦截器统一响应格式" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-practice-ai',
    index: '07',
    category: 'roadmap',
    title: "阶段六：真实工程研发、智能体协作与竞赛实战",
    summary: "实战筑基：CI 门禁流水线、AI 智能体协作纪律与社团开源项目特性交付。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "现代工程协同基础设施" },
      { id: 'sec-3', text: "智能体辅助研发范式" },
      { id: 'sec-4', text: "竞赛实战牵引" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "阶段实战大作业与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "前五个阶段的能力都在「个人可控」的环境里练习，阶段六要把它们放进真实的多人与多系统环境：别人会改你的代码，流水线会否决你的提交，用户会触发你没想到的路径。本阶段以社团自研项目（智学伴、智光耀城、矩阵计算器）与学科竞赛为靶场，完成从「会写代码」到「能交付」的跨越。" }],
    ] },
    { kind: 'h4', text: "为什么真实项目无法被教程替代" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "教程的环境是裁剪过的：依赖版本已知、接口文档齐全、没有人跟你抢同一个文件。真实项目的每一个变量都在动——需求会变更、依赖会破坏性升级、并发请求会暴露你在单机上永远测不出的问题。这些「动」才是工程能力的磨刀石。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "现代工程协同基础设施" },
    { kind: 'h4', text: "CI 门禁流水线" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团项目的每次合并请求都要过自动化门禁，典型配置把类型检查、单元测试与构建串成一条不可跳过的链：" }],
    ] },
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">name</span>\": <span class=\"tk-s\">\"门禁流水线\"</span>,\n  \"<span class=\"tk-k\">on</span>\": { \"<span class=\"tk-k\">pull_request</span>\": { \"<span class=\"tk-k\">branches</span>\": [<span class=\"tk-s\">\"main\"</span>] } },\n  \"<span class=\"tk-k\">jobs</span>\": {\n    \"<span class=\"tk-k\">check</span>\": {\n      \"<span class=\"tk-k\">steps</span>\": [\n        { \"<span class=\"tk-k\">run</span>\": <span class=\"tk-s\">\"npm ci\"</span> },\n        { \"<span class=\"tk-k\">run</span>\": <span class=\"tk-s\">\"npm run typecheck\"</span> },\n        { \"<span class=\"tk-k\">run</span>\": <span class=\"tk-s\">\"npm test\"</span> },\n        { \"<span class=\"tk-k\">run</span>\": <span class=\"tk-s\">\"npm run build\"</span> }\n      ]\n    }\n  }\n}", raw: "{\n  \"name\": \"门禁流水线\",\n  \"on\": { \"pull_request\": { \"branches\": [\"main\"] } },\n  \"jobs\": {\n    \"check\": {\n      \"steps\": [\n        { \"run\": \"npm ci\" },\n        { \"run\": \"npm run typecheck\" },\n        { \"run\": \"npm test\" },\n        { \"run\": \"npm run build\" }\n      ]\n    }\n  }\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "门禁的意义在于把「人不好意思提的意见」交给机器说：类型不通过、测试变红、构建失败，合并按钮自动锁死。人只做机器做不了的审查——设计是否合理、命名是否达意、边界是否想全。" }],
    ] },
    { kind: 'h4', text: "分支协同与提交纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "多人并行的基础是分支隔离：每人从最新主干检出特性分支，小步提交，尽早发起合并请求暴露冲突。具体的分支命名与提交规范见《分支管理与提交规范》篇，这里只强调一点：" }, { t: 'strong', v: "主干永远可发布" }, { t: 'text', v: "，任何破坏主干的提交都要在当天复盘。" }],
    ] },
    { kind: 'h4', text: "静态质量度量" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "类型检查与 Lint 是第一道，此外项目级门禁还包括：单测覆盖率阈值、依赖漏洞扫描、提交信息格式校验。度量不是为了分数，而是让「质量」从形容词变成可以回退定位的数字。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "智能体辅助研发范式" },
    { kind: 'h4', text: "AI 协作的底层哲学" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团的 AI 工程哲学有两条：" }, { t: 'strong', v: "人的认知上限决定 AI 工具的产出上限" }, { t: 'text', v: "——你看不懂 AI 生成的代码，那段代码就是埋进项目的地雷；" }, { t: 'strong', v: "底层先行、理解驱动" }, { t: 'text', v: "——先有体系化的底层原理，再接入 AI 辅助，顺序反了就是放大错误而不是放大效率。" }],
    ] },
    { kind: 'h4', text: "三个高价值协作场景" },
    { kind: 'table',
      head: [[{ t: 'text', v: "场景" }], [{ t: 'text', v: "用法" }], [{ t: 'text', v: "人的职责" }]],
      rows: [
        [[{ t: 'text', v: "接口设计" }], [{ t: 'text', v: "用 AI 起草 OpenAPI 契约与字段注释" }], [{ t: 'text', v: "逐条核对字段语义与错误码语义" }]],
        [[{ t: 'text', v: "测试用例生成" }], [{ t: 'text', v: "用 AI 批量生成边界与异常用例骨架" }], [{ t: 'text', v: "判断用例是否真覆盖业务规则" }]],
        [[{ t: 'text', v: "代码审查辅助" }], [{ t: 'text', v: "用 AI 初审重复代码与明显缺陷" }], [{ t: 'text', v: "终审设计决策，签字的永远是人" }]],
      ] },
    { kind: 'h4', text: "反例与正例：AI 产出的两种对待" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 反例：AI 生成的代码直接合入——这个 API 在依赖库里根本不存在（幻觉），</span>\n<span class=\"tk-c\">// 类型被断言成 any 绕过检查，错误处理被一句 catch 吞掉</span>\n<span class=\"tk-k\">import</span> { parseConfig } <span class=\"tk-k\">from</span> <span class=\"tk-s\">'some-lib'</span>\n\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">loadConfig_bad</span>(raw: <span class=\"tk-k\">unknown</span>) {\n  <span class=\"tk-k\">try</span> {\n    <span class=\"tk-k\">return</span> (parseConfig <span class=\"tk-k\">as</span> <span class=\"tk-k\">any</span>)(raw, { strict: <span class=\"tk-s\">'maybe'</span> })\n  } <span class=\"tk-k\">catch</span> {\n    <span class=\"tk-k\">return</span> {} <span class=\"tk-c\">// 静默吞错：配置坏了自己都不知道</span>\n  }\n}", raw: "// 反例：AI 生成的代码直接合入——这个 API 在依赖库里根本不存在（幻觉），\n// 类型被断言成 any 绕过检查，错误处理被一句 catch 吞掉\nimport { parseConfig } from 'some-lib'\n\nexport function loadConfig_bad(raw: unknown) {\n  try {\n    return (parseConfig as any)(raw, { strict: 'maybe' })\n  } catch {\n    return {} // 静默吞错：配置坏了自己都不知道\n  }\n}" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 正例：AI 草稿经人工核对后重写——API 换成真实存在的函数，</span>\n<span class=\"tk-c\">// 入参出参都有类型，失败路径快速失败并给出上下文</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">interface</span> <span class=\"tk-k\">AppConfig</span> {\n  <span class=\"tk-k\">readonly</span> apiUrl: <span class=\"tk-k\">string</span>\n  <span class=\"tk-k\">readonly</span> timeoutMs: <span class=\"tk-k\">number</span>\n}\n\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">loadConfig_good</span>(raw: <span class=\"tk-k\">string</span>): <span class=\"tk-k\">AppConfig</span> {\n  <span class=\"tk-k\">if</span> (!raw.<span class=\"tk-k\">trim</span>()) {\n    <span class=\"tk-k\">throw</span> new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'配置内容为空，请检查配置来源'</span>)\n  }\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">parsed</span>: <span class=\"tk-k\">unknown</span> = <span class=\"tk-s\">JSON</span>.<span class=\"tk-k\">parse</span>(raw)\n  <span class=\"tk-k\">if</span> (typeof parsed !== <span class=\"tk-s\">'object'</span> || parsed === <span class=\"tk-s\">null</span>) {\n    <span class=\"tk-k\">throw</span> new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'配置根节点必须是对象'</span>)\n  }\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">obj</span> = parsed <span class=\"tk-k\">as</span> <span class=\"tk-k\">Record</span>&lt;<span class=\"tk-k\">string</span>, <span class=\"tk-k\">unknown</span>&gt;\n  <span class=\"tk-k\">if</span> (typeof obj.apiUrl !== <span class=\"tk-s\">'string'</span> || typeof obj.timeoutMs !== <span class=\"tk-s\">'number'</span>) {\n    <span class=\"tk-k\">throw</span> new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'配置缺字段：apiUrl / timeoutMs'</span>)\n  }\n  <span class=\"tk-k\">return</span> { apiUrl: obj.apiUrl, timeoutMs: obj.timeoutMs }\n}", raw: "// 正例：AI 草稿经人工核对后重写——API 换成真实存在的函数，\n// 入参出参都有类型，失败路径快速失败并给出上下文\nexport interface AppConfig {\n  readonly apiUrl: string\n  readonly timeoutMs: number\n}\n\nexport function loadConfig_good(raw: string): AppConfig {\n  if (!raw.trim()) {\n    throw new Error('配置内容为空，请检查配置来源')\n  }\n  const parsed: unknown = JSON.parse(raw)\n  if (typeof parsed !== 'object' || parsed === null) {\n    throw new Error('配置根节点必须是对象')\n  }\n  const obj = parsed as Record<string, unknown>\n  if (typeof obj.apiUrl !== 'string' || typeof obj.timeoutMs !== 'number') {\n    throw new Error('配置缺字段：apiUrl / timeoutMs')\n  }\n  return { apiUrl: obj.apiUrl, timeoutMs: obj.timeoutMs }\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "区别不在 AI 用没用，而在" }, { t: 'strong', v: "门禁过没过" }, { t: 'text', v: "：反例把 AI 当作者，正例把 AI 当实习生——产出必须过审查、过类型、过测试，才能进主干。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "竞赛实战牵引" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "学科竞赛是阶段六的第二靶场：蓝桥杯与天梯赛练算法手感，数学建模练快速建模与工程落地，iCAN 与互联网+练完整产品表达。竞赛的正确打开方式是「以赛带练」：赛前按真题做针对性训练，赛中按工程纪律分工提交，赛后把可复用代码沉淀回社团仓库——荣誉是副产品，能力资产才是主产品。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "门禁红了自己不知道" }], [{ t: 'text', v: "本地不跑检查直接推" }], [{ t: 'text', v: "推送前本地跑一遍与 CI 相同的命令" }]],
        [[{ t: 'text', v: "AI 生成的依赖不存在" }], [{ t: 'text', v: "模型幻觉出虚构的库与 API" }], [{ t: 'text', v: "逐个核对包名与版本号，只信官方文档" }]],
        [[{ t: 'text', v: "合并冲突连环爆" }], [{ t: 'text', v: "特性分支与主干失联太久" }], [{ t: 'text', v: "每天拉主干变基，冲突不过夜" }]],
        [[{ t: 'text', v: "演示环境正常、部署就挂" }], [{ t: 'text', v: "环境变量与配置漂移" }], [{ t: 'text', v: "配置一律走环境变量，部署清单写进仓库" }]],
        [[{ t: 'text', v: "AI 生成的代码带了受限协议片段" }], [{ t: 'text', v: "未审查许可证来源" }], [{ t: 'text', v: "涉第三方代码必须标注来源与协议" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "阶段实战大作业与验收清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在社团开源项目中认领一个真实特性，走完从需求到合入的全流程：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "需求分析" }], [{ t: 'text', v: "产出需求说明：改什么、为什么改、影响哪些模块" }]],
        [[{ t: 'text', v: "接口设计" }], [{ t: 'text', v: "涉及接口的先出 OpenAPI 契约，评审通过后再编码" }]],
        [[{ t: 'text', v: "编码测试" }], [{ t: 'text', v: "特性代码带单元测试，本地与 CI 门禁全绿" }]],
        [[{ t: 'text', v: "合并请求" }], [{ t: 'text', v: "描述含改动内容、原因与验证方式，评审意见全部销项" }]],
        [[{ t: 'text', v: "AI 使用记录" }], [{ t: 'text', v: "说明哪些部分借助了 AI，以及人工核对与修改了什么" }]],
        [[{ t: 'text', v: "复盘沉淀" }], [{ t: 'text', v: "合入后输出一段复盘：最大的返工点与下次怎么避免" }]],
      ] },
    ],
  },
  {
    slug: 'roadmap-senior-split',
    index: '08',
    category: 'roadmap',
    title: "进阶阶段：高年级就业微服务攻坚与考研深造路线",
    summary: "大三分流攻坚：就业向微服务高并发体系，考研向计算机 408 四门核心课。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "就业线：微服务架构攻坚" },
      { id: 'sec-3', text: "考研线：计算机 408 核心课攻坚" },
      { id: 'sec-4', text: "正反例与避坑" },
      { id: 'sec-5', text: "进阶实战与验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "大三是培养阶梯的分流点：前六个阶段所有成员走同一条筑基路线，分流之后就业与考研两条路的投入结构完全不同——就业线拼的是工程纵深与项目表达，考研线拼的是体系完整与应试稳定。分流决策宜早不宜晚：两条线的黄金准备期都从大三上学期开始，脚踏两条船的结果通常是一头落空。" }],
    ] },
    { kind: 'h4', text: "分流决策的三个依据" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一看志向：目标是尽快进入产业还是继续深造读研。二看积累：项目经历丰富、代码表达强的走就业线有优势；理论基础扎实、长于系统性学习的走考研线更稳。三看反馈：与师傅和大三学长各谈一次，用他们的视角校准自我评估。决策定下后，把另一条线的资料归档封存，禁止反复摇摆消耗心力。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "就业线：微服务架构攻坚" },
    { kind: 'h4', text: "从单体到微服务的问题驱动" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "单体应用撑不住的原因很具体：一处崩溃全站不可用、一次发布全量重启、团队在同一个代码库里互相踩脚。微服务按业务域拆分为独立部署的小服务，用三组基础设施补上拆分带来的新问题：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "问题" }], [{ t: 'text', v: "基础设施" }], [{ t: 'text', v: "社团选型" }]],
      rows: [
        [[{ t: 'text', v: "服务找不到彼此" }], [{ t: 'text', v: "注册中心" }], [{ t: 'text', v: "Nacos" }]],
        [[{ t: 'text', v: "流量洪峰打垮下游" }], [{ t: 'text', v: "流量防护" }], [{ t: 'text', v: "Sentinel" }]],
        [[{ t: 'text', v: "跨服务数据一致性" }], [{ t: 'text', v: "分布式事务" }], [{ t: 'text', v: "Seata（AT 模式入门）" }]],
      ] },
    { kind: 'h4', text: "Nacos 注册中心的协作模型" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "服务启动时向 Nacos 注册自己的地址，调用方从注册中心拉取服务列表并做客户端负载均衡；Nacos 以心跳判定实例健康，异常实例自动摘除。理解「注册—发现—心跳—摘除」四个环节，就掌握了服务治理的主干。" }],
    ] },
    { kind: 'h4', text: "Sentinel 流量防护的落地姿势" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "防护的核心动作是限流与熔断降级：限流挡住超出容量的请求，熔断在下游持续出错时快速失败，防止故障沿调用链雪崩。降级方法必须显式编写，给用户一条明确的退路而不是超时挂死：" }],
    ] },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 被保护的服务调用：正常路径查数据库</span>\n@<span class=\"tk-k\">Service</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">CourseCatalogService</span> {\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">List</span>&lt;<span class=\"tk-k\">CourseVO</span>&gt; <span class=\"tk-k\">hotCourses</span>() {\n        <span class=\"tk-k\">return</span> courseMapper.<span class=\"tk-k\">selectHot</span>();\n    }\n\n    <span class=\"tk-c\">// 降级方法：签名必须与被保护方法兼容，返回兜底数据而非抛异常</span>\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">List</span>&lt;<span class=\"tk-k\">CourseVO</span>&gt; <span class=\"tk-k\">hotCoursesFallback</span>(<span class=\"tk-k\">Throwable</span> cause) {\n        <span class=\"tk-c\">// 记录根因供排查，但对外只给可用的兜底结果</span>\n        log.<span class=\"tk-k\">warn</span>(<span class=\"tk-s\">\"热门课程查询失败，返回兜底列表: {}\"</span>, cause.<span class=\"tk-k\">getMessage</span>());\n        <span class=\"tk-k\">return</span> List.<span class=\"tk-k\">of</span>();\n    }\n}", raw: "// 被保护的服务调用：正常路径查数据库\n@Service\npublic class CourseCatalogService {\n\n    public List<CourseVO> hotCourses() {\n        return courseMapper.selectHot();\n    }\n\n    // 降级方法：签名必须与被保护方法兼容，返回兜底数据而非抛异常\n    public List<CourseVO> hotCoursesFallback(Throwable cause) {\n        // 记录根因供排查，但对外只给可用的兜底结果\n        log.warn(\"热门课程查询失败，返回兜底列表: {}\", cause.getMessage());\n        return List.of();\n    }\n}" },
    { kind: 'h4', text: "高性能缓存与消息队列" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "就业线的另外两件重武器：Redis 缓存解决读放大（缓存穿透、击穿、雪崩的三件套防御是必答题），消息队列解决写放大与解耦（削峰、异步、最终一致性）。学习顺序建议：先把 Redis 的数据结构与过期策略用熟，再进 Kafka 或 RabbitMQ 理解投递语义与消费幂等。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "考研线：计算机 408 核心课攻坚" },
    { kind: 'h4', text: "四门课的体系定位" },
    { kind: 'table',
      head: [[{ t: 'text', v: "科目" }], [{ t: 'text', v: "核心问题" }], [{ t: 'text', v: "与前序阶段的呼应" }]],
      rows: [
        [[{ t: 'text', v: "数据结构" }], [{ t: 'text', v: "数据怎么组织才高效" }], [{ t: 'text', v: "阶段一的顺序表、链表与树" }]],
        [[{ t: 'text', v: "计算机组成原理" }], [{ t: 'text', v: "指令怎么在硬件上跑" }], [{ t: 'text', v: "阶段一的内存模型与对齐" }]],
        [[{ t: 'text', v: "操作系统" }], [{ t: 'text', v: "程序怎么被调度与保护" }], [{ t: 'text', v: "阶段一的栈帧与阶段四的进程排查" }]],
        [[{ t: 'text', v: "计算机网络" }], [{ t: 'text', v: "数据怎么跨机器可靠送达" }], [{ t: 'text', v: "阶段二的浏览器请求链路" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "408 的复习不是四门孤立的背诵，而是一条「数据在计算机里的一生」：从组成原理的硬件，到操作系统的调度，到数据结构的组织，再到网络的传输。前期按科推进，后期必须做跨科串联，真题的大量综合题正是考这条线。" }],
    ] },
    { kind: 'h4', text: "复习节奏的三段式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "基础段（3—6 月）：按教材与课程逐章推进，每章配基础题，重在概念网络搭建。强化段（7—9 月）：以真题为纲做专题突破，错题归因到章节。冲刺段（10—12 月）：整套真题限时演练，训练时间分配与心态稳定。每段结束做一次全真模考定位，用分数调整下一段投入。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "正反例与避坑" },
    { kind: 'h4', text: "反例：分流摇摆与信息囤积" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "典型的失败姿势：九月还在就业与考研间摇摆，两条线的资料各收藏了几百个却一个没看；十月决定考研，又把时间花在挑课程选资料上。根因是把「准备决策」当成了「开始行动」。" }],
    ] },
    { kind: 'h4', text: "正例：单线聚焦与周度复盘" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "决策后只做一条线：就业线按「微服务组件 → 高并发专题 → 项目打磨 → 模拟面试」推进，每周至少一次限时算法练习保持手感；考研线按复习节奏表执行，每周复盘错题与进度偏差。两条线共同的纪律：每周日晚写下周的三件要事，完成与否都记录原因。" }],
    ] },
    { kind: 'h4', text: "高频避坑清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "微服务拆得过碎" }], [{ t: 'text', v: "为拆而拆，忽略运维成本" }], [{ t: 'text', v: "按业务域拆，起步不超过五个服务" }]],
        [[{ t: 'text', v: "缓存与数据库不一致" }], [{ t: 'text', v: "没有失效策略" }], [{ t: 'text', v: "写操作先更库再删缓存，关键路径加延迟双删" }]],
        [[{ t: 'text', v: "408 真题分数徘徊" }], [{ t: 'text', v: "只刷题不回归概念" }], [{ t: 'text', v: "错题反查教材章节，重建知识网络" }]],
        [[{ t: 'text', v: "面试讲不清项目" }], [{ t: 'text', v: "项目里没有自己的思考" }], [{ t: 'text', v: "每个项目准备「难点—方案—取舍」三段讲稿" }]],
      ] },
    { kind: 'h3', id: 'sec-5', text: "进阶实战与验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "方向" }], [{ t: 'text', v: "验收清单" }]],
      rows: [
        [[{ t: 'text', v: "就业线" }], [{ t: 'text', v: "完成一个含注册中心、流量防护与缓存的微服务演练项目，能在白板上画出调用链与降级路径" }]],
        [[{ t: 'text', v: "就业线" }], [{ t: 'text', v: "社团项目经历整理成可讲稿：每个项目能讲清难点、方案与取舍" }]],
        [[{ t: 'text', v: "考研线" }], [{ t: 'text', v: "四门课基础段完成，每科有一次全真模考记录与错题归因报告" }]],
        [[{ t: 'text', v: "考研线" }], [{ t: 'text', v: "真题至少完成两轮，第二轮正确率有可量化提升" }]],
        [[{ t: 'text', v: "共同" }], [{ t: 'text', v: "每周复盘记录连续不断档；分流决策已与师傅确认并记录在案" }]],
      ] },
    ],
  },
  {
    slug: 'git-flow',
    index: '09',
    category: 'engineering',
    title: "分支管理与提交规范",
    summary: "Git 对象模型、分支命名规则、原子提交习惯与合并请求流转纪律。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "底层对象模型与状态流转" },
      { id: 'sec-3', text: "分支策略与提交规范" },
      { id: 'sec-4', text: "合并请求流转与脱敏纪律" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "版本控制是多人协作的物理定律：没有它，两人的修改无法安全交汇，事故无法回溯，发布无法挑选。Git 是社团所有仓库的统一版本控制系统，本篇规定它在社团项目中的使用纪律——对象模型是理解一切操作的钥匙，命名与提交规范是让历史可读的契约。" }],
    ] },
    { kind: 'h4', text: "为什么提交历史也是产品" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "代码是给机器执行的，提交历史是给人排障的。半年后线上出问题，" }, { t: 'code', v: "git bisect" }, { t: 'text', v: " 二分定位靠的就是一条条职责单一的提交；评审与复盘靠的也是历史。混乱的历史等于放弃了 Git 一半的价值。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "底层对象模型与状态流转" },
    { kind: 'h4', text: "Blob、Tree、Commit 三层对象" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Git 的存储本质是一个内容寻址的对象数据库，只有三种核心对象：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "对象" }], [{ t: 'text', v: "存储内容" }], [{ t: 'text', v: "类比" }]],
      rows: [
        [[{ t: 'text', v: "Blob" }], [{ t: 'text', v: "文件的字节内容" }], [{ t: 'text', v: "一页文档" }]],
        [[{ t: 'text', v: "Tree" }], [{ t: 'text', v: "目录结构与文件名到 Blob 的映射" }], [{ t: 'text', v: "文件夹" }]],
        [[{ t: 'text', v: "Commit" }], [{ t: 'text', v: "顶层 Tree 指针、父提交引用、作者与提交说明" }], [{ t: 'text', v: "一次快照的档案卡" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每次提交都是一棵完整目录树的快照，而不是差异补丁——所以 Git 的分支切换与历史回退才如此之快。理解「提交是快照不是补丁」，才能理解为什么删除文件再提交不会丢失历史、为什么分支只是指向某个提交的可移动指针。" }],
    ] },
    { kind: 'h4', text: "四大区域的流转" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 工作区 -&gt; 暂存区：挑选本次提交要包含的变更</span>\n<span class=\"tk-k\">git</span> add src/feature.ts\n\n<span class=\"tk-c\"># 暂存区 -&gt; 本地历史：生成 Commit 对象</span>\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"feat(auth): 增加登录参数校验\"</span>\n\n<span class=\"tk-c\"># 本地历史 -&gt; 远程仓库：推送提交对象</span>\n<span class=\"tk-k\">git</span> push origin feat/login-check\n\n<span class=\"tk-c\"># 反方向同步：远程 -&gt; 本地历史 -&gt; 工作区</span>\n<span class=\"tk-k\">git</span> pull --rebase origin main", raw: "# 工作区 -> 暂存区：挑选本次提交要包含的变更\ngit add src/feature.ts\n\n# 暂存区 -> 本地历史：生成 Commit 对象\ngit commit -m \"feat(auth): 增加登录参数校验\"\n\n# 本地历史 -> 远程仓库：推送提交对象\ngit push origin feat/login-check\n\n# 反方向同步：远程 -> 本地历史 -> 工作区\ngit pull --rebase origin main" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "暂存区（Index）的存在是 Git 的精髓：它允许你把一个文件的一部分改动放进本次提交，把另一部分留给下次——这正是原子提交的操作基础。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "分支策略与提交规范" },
    { kind: 'h4', text: "分支命名规则" },
    { kind: 'table',
      head: [[{ t: 'text', v: "前缀" }], [{ t: 'text', v: "用途" }], [{ t: 'text', v: "示例" }]],
      rows: [
        [[{ t: 'code', v: "feat/" }], [{ t: 'text', v: "新功能或特性开发" }], [{ t: 'code', v: "feat/login-check" }]],
        [[{ t: 'code', v: "fix/" }], [{ t: 'text', v: "缺陷与故障修复" }], [{ t: 'code', v: "fix/table-overflow" }]],
        [[{ t: 'code', v: "chore/" }], [{ t: 'text', v: "依赖升级、构建配置调整" }], [{ t: 'code', v: "chore/upgrade-vite" }]],
        [[{ t: 'code', v: "docs/" }], [{ t: 'text', v: "文档编写与更新" }], [{ t: 'code', v: "docs/git-flow" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "命名用短横线小写英文，简短达意，不带空格与中文。分支名会出现在提交历史与合并请求列表里，它是给人读的索引。" }],
    ] },
    { kind: 'h4', text: "从主干检出的纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "所有日常开发基于最新的 " }, { t: 'code', v: "main" }, { t: 'text', v: " 检出特性分支：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 先同步主干，再检出特性分支——基线落后是冲突的最大来源</span>\n<span class=\"tk-k\">git</span> checkout main\n<span class=\"tk-k\">git</span> pull --rebase origin main\n<span class=\"tk-k\">git</span> checkout -b feat/login-check\n\n<span class=\"tk-c\"># 分支存活期间，定期把主干变化变基进来，冲突不过夜</span>\n<span class=\"tk-k\">git</span> fetch origin\n<span class=\"tk-k\">git</span> rebase origin/main", raw: "# 先同步主干，再检出特性分支——基线落后是冲突的最大来源\ngit checkout main\ngit pull --rebase origin main\ngit checkout -b feat/login-check\n\n# 分支存活期间，定期把主干变化变基进来，冲突不过夜\ngit fetch origin\ngit rebase origin/main" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "禁止直接向 " }, { t: 'code', v: "main" }, { t: 'text', v: " 推送；主干开启分支保护与强制评审。" }, { t: 'code', v: "git push --force" }, { t: 'text', v: " 对共享分支永久禁用——它会抹掉他人的提交，历史可追溯性不可让步。" }],
    ] },
    { kind: 'h4', text: "小步多次的原子纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一个提交只做一件事：一次修复、一个特性切片、一轮重构。判断标准是「能否用一句不含『和』的话概括」。把格式化与逻辑变更分开提交、把依赖升级与业务代码分开提交——出问题时才能精准回退某一块，而不是连坐退回。" }],
    ] },
    { kind: 'h4', text: "结构化提交信息" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提交信息遵循 Conventional Commits：" }, { t: 'code', v: "类型(范围): 简述" }, { t: 'text', v: "，正文说明动机与影响：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 三种典型类型示例</span>\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"feat(auth): 增加用户登录参数格式校验\"</span>\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"fix(table): 修复移动端表格数据溢出遮挡\"</span>\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"refactor(user): 抽取通用权限校验中间件\"</span>\n\n<span class=\"tk-c\"># 提交前自查：暂存内容是否与提交信息描述的单件事一致</span>\n<span class=\"tk-k\">git</span> diff --cached --stat", raw: "# 三种典型类型示例\ngit commit -m \"feat(auth): 增加用户登录参数格式校验\"\ngit commit -m \"fix(table): 修复移动端表格数据溢出遮挡\"\ngit commit -m \"refactor(user): 抽取通用权限校验中间件\"\n\n# 提交前自查：暂存内容是否与提交信息描述的单件事一致\ngit diff --cached --stat" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "类型与范围的词表保持收敛：" }, { t: 'code', v: "feat" }, { t: 'text', v: "、" }, { t: 'code', v: "fix" }, { t: 'text', v: "、" }, { t: 'code', v: "refactor" }, { t: 'text', v: "、" }, { t: 'code', v: "docs" }, { t: 'text', v: "、" }, { t: 'code', v: "chore" }, { t: 'text', v: "、" }, { t: 'code', v: "test" }, { t: 'text', v: "。生造类型等于没有类型。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "合并请求流转与脱敏纪律" },
    { kind: 'h4', text: "合并请求三要素" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "发起合并请求时，描述必须回答三个问题：改动内容（做了什么）、改动原因（解决什么问题）、验证方式（怎么证明它有效）。涉及前端界面调整的，附操作录屏或前后对比截图。" }],
    ] },
    { kind: 'details', title: "社团合并请求描述模板", blocks: [
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">改动内容</span>\": <span class=\"tk-s\">\"逐条列出本次合入的变更点，与提交记录对应\"</span>,\n  \"<span class=\"tk-k\">改动原因</span>\": <span class=\"tk-s\">\"关联的需求、缺陷单或技术债说明\"</span>,\n  \"<span class=\"tk-k\">验证方式</span>\": [\n    <span class=\"tk-s\">\"本地执行的检查命令与结果\"</span>,\n    <span class=\"tk-s\">\"新增或修改的测试用例说明\"</span>,\n    <span class=\"tk-s\">\"界面变更附操作录屏或前后对比截图\"</span>\n  ],\n  \"<span class=\"tk-k\">影响范围</span>\": <span class=\"tk-s\">\"列出可能受影响的模块与调用方\"</span>,\n  \"<span class=\"tk-k\">风险与回退</span>\": <span class=\"tk-s\">\"上线风险点说明与回退方案\"</span>\n}", raw: "{\n  \"改动内容\": \"逐条列出本次合入的变更点，与提交记录对应\",\n  \"改动原因\": \"关联的需求、缺陷单或技术债说明\",\n  \"验证方式\": [\n    \"本地执行的检查命令与结果\",\n    \"新增或修改的测试用例说明\",\n    \"界面变更附操作录屏或前后对比截图\"\n  ],\n  \"影响范围\": \"列出可能受影响的模块与调用方\",\n  \"风险与回退\": \"上线风险点说明与回退方案\"\n}" },
    ] },
    { kind: 'h4', text: "敏感数据脱敏" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "截图、录屏与日志在进入评审视野前必须脱敏：真实姓名、学号、手机号、令牌与线上密钥一律遮挡或替换为示例值。密钥类信息一旦进了提交历史，就要按「立即作废轮换」处理，而不是简单删文件——Git 的历史里它还活着。" }],
    ] },
    { kind: 'h4', text: "误提交的紧急止血" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 文件已提交但未推送：改写最近一次提交，把误加文件移出暂存</span>\n<span class=\"tk-k\">git</span> reset --soft HEAD~1\n<span class=\"tk-k\">git</span> restore --staged .env\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"feat(auth): 增加登录参数校验\"</span>\n\n<span class=\"tk-c\"># 已推送的密钥：先作废轮换密钥，再从历史清除，并通知所有协作者重新克隆</span>\n<span class=\"tk-k\">git</span> filter-repo --path .env --invert-paths", raw: "# 文件已提交但未推送：改写最近一次提交，把误加文件移出暂存\ngit reset --soft HEAD~1\ngit restore --staged .env\ngit commit -m \"feat(auth): 增加登录参数校验\"\n\n# 已推送的密钥：先作废轮换密钥，再从历史清除，并通知所有协作者重新克隆\ngit filter-repo --path .env --invert-paths" },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "变基冲突连环爆" }], [{ t: 'text', v: "分支长期未同步主干" }], [{ t: 'text', v: "每天 " }, { t: 'code', v: "git pull --rebase origin main" }, { t: 'text', v: "，冲突不过夜" }]],
        [[{ t: 'text', v: "提交信息牛头不对马嘴" }], [{ t: 'text', v: "一次提交混了多件事" }], [{ t: 'text', v: "用暂存区分批提交，写前先看 " }, { t: 'code', v: "git diff --cached" }]],
        [[{ t: 'text', v: "合并请求无人敢审" }], [{ t: 'text', v: "描述空、改动大" }], [{ t: 'text', v: "拆小：一个请求不超过四百行改动" }]],
        [[{ t: 'text', v: "历史里夹着大文件" }], [{ t: 'text', v: "二进制产物进了仓库" }], [{ t: 'text', v: "产物进 " }, { t: 'code', v: ".gitignore" }, { t: 'text', v: "，已入库的用 " }, { t: 'code', v: "filter-repo" }, { t: 'text', v: " 清除" }]],
        [[{ t: 'code', v: "detached HEAD" }, { t: 'text', v: " 提交丢失" }], [{ t: 'text', v: "检出提交而不是分支" }], [{ t: 'text', v: "立即 " }, { t: 'code', v: "git checkout -b" }, { t: 'text', v: " 给游离提交安家" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "对象模型" }], [{ t: 'text', v: "能在白板上画出 Blob、Tree、Commit 的关系与四区流转" }]],
        [[{ t: 'text', v: "分支纪律" }], [{ t: 'text', v: "所有改动走特性分支，命名符合前缀规则，无直推主干" }]],
        [[{ t: 'text', v: "提交质量" }], [{ t: 'text', v: "抽查十个提交全部单一职责，信息符合规范" }]],
        [[{ t: 'text', v: "合并请求" }], [{ t: 'text', v: "描述含三要素，界面改动附截图，敏感信息零暴露" }]],
        [[{ t: 'text', v: "应急能力" }], [{ t: 'text', v: "能独立完成误提交止血与变基冲突解决" }]],
      ] },
    ],
  },
  {
    slug: 'frontend-spec',
    index: '10',
    category: 'engineering',
    title: "前端工程规范",
    summary: "前端约定：TypeScript 类型约束、状态单一真源、设计令牌与动效降级。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "类型系统约定" },
      { id: 'sec-3', text: "状态架构约定" },
      { id: 'sec-4', text: "设计令牌与交互动效约定" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "前端工程的四大失控场景：类型靠猜导致的运行时崩溃、状态四处散落导致的界面不一致、样式硬编码导致的改版灾难、动效无视系统偏好导致的体验冒犯。本篇是社团前端项目的四条工程约定——类型、状态、设计系统、动效，各自对应一类失控。" }],
    ] },
    { kind: 'h4', text: "约定的执行方式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "约定不靠自觉：类型约定由 " }, { t: 'code', v: "tsc" }, { t: 'text', v: " 严格模式在门禁里执行，设计令牌约定由对比度检测脚本执行，动效约定由评审清单核对。能被机器拦的约定都交给机器。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "类型系统约定" },
    { kind: 'h4', text: "严格模式与可辨识联合" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "strict" }, { t: 'text', v: " 全开是底线。在此之上，状态建模优先使用可辨识联合：用一个字面量字段区分分支，让编译器穷尽检查每个分支是否被处理——新增状态时，所有未更新的 " }, { t: 'code', v: "switch" }, { t: 'text', v: " 当场报错，而不是上线后白屏。" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 反例：一个接口同时装着成功与失败的数据，字段永远可能为空</span>\n<span class=\"tk-k\">type</span> <span class=\"tk-k\">FetchState_bad</span> = {\n  data: <span class=\"tk-k\">unknown</span>\n  error: <span class=\"tk-k\">string</span>\n  loading: <span class=\"tk-k\">boolean</span>\n}\n\n<span class=\"tk-c\">// 正例：可辨识联合，每个分支只带自己的字段</span>\n<span class=\"tk-k\">type</span> <span class=\"tk-k\">FetchState</span>&lt;<span class=\"tk-k\">T</span>&gt; =\n  | { <span class=\"tk-k\">readonly</span> status: <span class=\"tk-s\">'idle'</span> }\n  | { <span class=\"tk-k\">readonly</span> status: <span class=\"tk-s\">'loading'</span> }\n  | { <span class=\"tk-k\">readonly</span> status: <span class=\"tk-s\">'success'</span>; <span class=\"tk-k\">readonly</span> data: <span class=\"tk-k\">T</span> }\n  | { <span class=\"tk-k\">readonly</span> status: <span class=\"tk-s\">'error'</span>; <span class=\"tk-k\">readonly</span> message: <span class=\"tk-k\">string</span> }\n\n<span class=\"tk-k\">function</span> <span class=\"tk-k\">render</span>&lt;<span class=\"tk-k\">T</span>&gt;(state: <span class=\"tk-k\">FetchState</span>&lt;<span class=\"tk-k\">T</span>&gt;): <span class=\"tk-k\">string</span> {\n  <span class=\"tk-k\">switch</span> (state.status) {\n    <span class=\"tk-k\">case</span> <span class=\"tk-s\">'idle'</span>:\n    <span class=\"tk-k\">case</span> <span class=\"tk-s\">'loading'</span>:\n      <span class=\"tk-k\">return</span> <span class=\"tk-s\">'加载中'</span>\n    <span class=\"tk-k\">case</span> <span class=\"tk-s\">'success'</span>:\n      <span class=\"tk-k\">return</span> <span class=\"tk-k\">String</span>(state.data) <span class=\"tk-c\">// 编译器保证此分支 data 必存在</span>\n    <span class=\"tk-k\">case</span> <span class=\"tk-s\">'error'</span>:\n      <span class=\"tk-k\">return</span> state.message\n    <span class=\"tk-c\">// 若新增分支未处理，never 类型断言会在此报错</span>\n  }\n}", raw: "// 反例：一个接口同时装着成功与失败的数据，字段永远可能为空\ntype FetchState_bad = {\n  data: unknown\n  error: string\n  loading: boolean\n}\n\n// 正例：可辨识联合，每个分支只带自己的字段\ntype FetchState<T> =\n  | { readonly status: 'idle' }\n  | { readonly status: 'loading' }\n  | { readonly status: 'success'; readonly data: T }\n  | { readonly status: 'error'; readonly message: string }\n\nfunction render<T>(state: FetchState<T>): string {\n  switch (state.status) {\n    case 'idle':\n    case 'loading':\n      return '加载中'\n    case 'success':\n      return String(state.data) // 编译器保证此分支 data 必存在\n    case 'error':\n      return state.message\n    // 若新增分支未处理，never 类型断言会在此报错\n  }\n}" },
    { kind: 'h4', text: "只读约束与泛型约束" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "共享状态与常量一律 " }, { t: 'code', v: "readonly" }, { t: 'text', v: " 或 " }, { t: 'code', v: "as const" }, { t: 'text', v: "：把「不许改」写进类型，而不是写进注释。泛型边界用 " }, { t: 'code', v: "extends" }, { t: 'text', v: " 约束收紧，禁止无约束的裸 " }, { t: 'code', v: "<T>" }, { t: 'text', v: " 在公共 API 上泛滥。" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 常量表用 as const 冻结，取值函数用 keyof 约束，拼错键名编译期即报错</span>\n<span class=\"tk-k\">const</span> <span class=\"tk-s\">ERROR_CODES</span> = {\n  NETWORK: <span class=\"tk-s\">1001</span>,\n  TIMEOUT: <span class=\"tk-s\">1002</span>,\n} <span class=\"tk-k\">as</span> <span class=\"tk-k\">const</span>\n\n<span class=\"tk-k\">function</span> <span class=\"tk-k\">labelOf</span>(key: keyof typeof <span class=\"tk-s\">ERROR_CODES</span>): <span class=\"tk-k\">number</span> {\n  <span class=\"tk-k\">return</span> <span class=\"tk-s\">ERROR_CODES</span>[key]\n}", raw: "// 常量表用 as const 冻结，取值函数用 keyof 约束，拼错键名编译期即报错\nconst ERROR_CODES = {\n  NETWORK: 1001,\n  TIMEOUT: 1002,\n} as const\n\nfunction labelOf(key: keyof typeof ERROR_CODES): number {\n  return ERROR_CODES[key]\n}" },
    { kind: 'h4', text: "类型断言的禁令" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "as any" }, { t: 'text', v: " 一票否决；" }, { t: 'code', v: "as unknown as X" }, { t: 'text', v: " 视同。跨越类型边界的唯一合法姿势是" }, { t: 'strong', v: "校验后收窄" }, { t: 'text', v: "：先运行时校验，再让类型跟着收窄，详见各项目的数据入口层实现。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "状态架构约定" },
    { kind: 'h4', text: "单一真源原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "同一份数据只允许有一个权威来源。界面派生数据一律现算不另存——存两份就会有一天不一致。跨组件共享状态收敛到项目唯一的 store，组件私有状态留在组件内，" }, { t: 'strong', v: "状态下沉" }, { t: 'text', v: "：能放在子组件的不上提到父组件，能放局部的不进全局。" }],
    ] },
    { kind: 'h4', text: "URL 查询参数作为状态载体" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "列表页的筛选、分页、排序等「值得分享与刷新后保留」的状态，以 " }, { t: 'code', v: "URLSearchParams" }, { t: 'text', v: " 为真源，而不是藏在组件内存里：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 正例：筛选状态落在 URL 上，刷新、分享、浏览器前进后退全部自然正确</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">readFilterFromUrl</span>(): { keyword: <span class=\"tk-k\">string</span>; page: <span class=\"tk-k\">number</span> } {\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">params</span> = new <span class=\"tk-k\">URLSearchParams</span>(window.location.search)\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">keyword</span> = params.<span class=\"tk-k\">get</span>(<span class=\"tk-s\">'q'</span>) ?? <span class=\"tk-s\">''</span>\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">rawPage</span> = <span class=\"tk-k\">Number</span>(params.<span class=\"tk-k\">get</span>(<span class=\"tk-s\">'page'</span>) ?? <span class=\"tk-s\">'1'</span>)\n  <span class=\"tk-c\">// 边界防护：非法页码回落到第一页，不信任 URL 里的任何值</span>\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">page</span> = Number.<span class=\"tk-k\">isInteger</span>(rawPage) &amp;&amp; rawPage &gt; <span class=\"tk-s\">0</span> ? rawPage : <span class=\"tk-s\">1</span>\n  <span class=\"tk-k\">return</span> { keyword, page }\n}\n\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">writeFilterToUrl</span>(keyword: <span class=\"tk-k\">string</span>, page: <span class=\"tk-k\">number</span>) {\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">params</span> = new <span class=\"tk-k\">URLSearchParams</span>(window.location.search)\n  <span class=\"tk-k\">if</span> (keyword) params.<span class=\"tk-k\">set</span>(<span class=\"tk-s\">'q'</span>, keyword)\n  <span class=\"tk-k\">else</span> params.<span class=\"tk-k\">delete</span>(<span class=\"tk-s\">'q'</span>)\n  params.<span class=\"tk-k\">set</span>(<span class=\"tk-s\">'page'</span>, <span class=\"tk-k\">String</span>(Math.<span class=\"tk-k\">max</span>(<span class=\"tk-s\">1</span>, page)))\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">next</span> = <span class=\"tk-s\">`</span>${window.location.pathname}?${params.<span class=\"tk-k\">toString</span>()}<span class=\"tk-s\">`</span>\n  window.history.<span class=\"tk-k\">replaceState</span>(<span class=\"tk-s\">null</span>, <span class=\"tk-s\">''</span>, next)\n}", raw: "// 正例：筛选状态落在 URL 上，刷新、分享、浏览器前进后退全部自然正确\nexport function readFilterFromUrl(): { keyword: string; page: number } {\n  const params = new URLSearchParams(window.location.search)\n  const keyword = params.get('q') ?? ''\n  const rawPage = Number(params.get('page') ?? '1')\n  // 边界防护：非法页码回落到第一页，不信任 URL 里的任何值\n  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1\n  return { keyword, page }\n}\n\nexport function writeFilterToUrl(keyword: string, page: number) {\n  const params = new URLSearchParams(window.location.search)\n  if (keyword) params.set('q', keyword)\n  else params.delete('q')\n  params.set('page', String(Math.max(1, page)))\n  const next = `${window.location.pathname}?${params.toString()}`\n  window.history.replaceState(null, '', next)\n}" },
    { kind: 'h3', id: 'sec-4', text: "设计令牌与交互动效约定" },
    { kind: 'h4', text: "令牌是唯一取色入口" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "颜色、间距、圆角、字号全部来自设计令牌，组件里禁止出现裸的十六进制色值。换肤、改版与无障碍达标都建立在「取色入口唯一」这个前提上。" }],
    ] },
    { kind: 'h4', text: "对比度的硬指标" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "正文与交互元素对背景色的对比度必须达到 WCAG AA 级（正文至少 4.5:1，大号文本至少 3:1）。社团项目以对比度检测脚本作为门禁：任何新增配色组合先过脚本，再进评审。" }],
    ] },
    { kind: 'code', lang: 'css', html: "<span class=\"tk-c\">/* 令牌定义：语义命名，按用途而不是按色相命名 */</span>\n:<span class=\"tk-k\">root</span> {\n  --ink-900: #16324f;   <span class=\"tk-c\">/* 正文主色，对底色 13.21:1 */</span>\n  --ink-600: #4a6076;   <span class=\"tk-c\">/* 次要文本，6.16:1 */</span>\n  --sky-700: #0d5c8c;   <span class=\"tk-c\">/* 强调与链接，5.17:1 */</span>\n  --bg-sunk: #e8f0f6;   <span class=\"tk-c\">/* 下沉背景，代码块与徽标底 */</span>\n}\n\n<span class=\"tk-c\">/* 组件只引令牌：换肤只动上面一段，组件零改动 */</span>\n.<span class=\"tk-k\">doc-link</span> {\n  <span class=\"tk-k\">color</span>: <span class=\"tk-k\">var</span>(--sky-700);\n}", raw: "/* 令牌定义：语义命名，按用途而不是按色相命名 */\n:root {\n  --ink-900: #16324f;   /* 正文主色，对底色 13.21:1 */\n  --ink-600: #4a6076;   /* 次要文本，6.16:1 */\n  --sky-700: #0d5c8c;   /* 强调与链接，5.17:1 */\n  --bg-sunk: #e8f0f6;   /* 下沉背景，代码块与徽标底 */\n}\n\n/* 组件只引令牌：换肤只动上面一段，组件零改动 */\n.doc-link {\n  color: var(--sky-700);\n}" },
    { kind: 'h4', text: "微交互时长纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "悬停、按压、展开类微交互控制在 150ms 至 300ms：低于 150ms 显得生硬，超过 300ms 用户开始等待。长流程（页面切换）可到 400ms 封顶，且必须可被打断。" }],
    ] },
    { kind: 'h4', text: "减弱动效的系统适配" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "用户系统开启「减弱动态效果」时，装饰性动画必须整体关闭，仅保留必要的状态反馈：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 统一走这一个钩子，禁止组件各自读媒体查询</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">usePrefersReducedMotion</span>(): <span class=\"tk-k\">boolean</span> {\n  <span class=\"tk-k\">if</span> (typeof window === <span class=\"tk-s\">'undefined'</span> || !window.matchMedia) {\n    <span class=\"tk-k\">return</span> <span class=\"tk-s\">false</span> <span class=\"tk-c\">// 非浏览器环境（预渲染）按完整动效处理</span>\n  }\n  <span class=\"tk-k\">return</span> window.<span class=\"tk-k\">matchMedia</span>(<span class=\"tk-s\">'(prefers-reduced-motion: reduce)'</span>).matches\n}", raw: "// 统一走这一个钩子，禁止组件各自读媒体查询\nexport function usePrefersReducedMotion(): boolean {\n  if (typeof window === 'undefined' || !window.matchMedia) {\n    return false // 非浏览器环境（预渲染）按完整动效处理\n  }\n  return window.matchMedia('(prefers-reduced-motion: reduce)').matches\n}" },
    { kind: 'code', lang: 'css', html: "<span class=\"tk-c\">/* CSS 侧的总闸：一段代码关掉所有装饰动画 */</span>\n@<span class=\"tk-k\">media</span> (prefers-reduced-motion: reduce) {\n  <span class=\"tk-k\">*</span>,\n  <span class=\"tk-k\">*</span>::<span class=\"tk-k\">before</span>,\n  <span class=\"tk-k\">*</span>::<span class=\"tk-k\">after</span> {\n    <span class=\"tk-k\">animation-duration</span>: <span class=\"tk-s\">0.01</span><span class=\"tk-k\">ms</span> <span class=\"tk-k\">!important</span>;\n    <span class=\"tk-k\">transition-duration</span>: <span class=\"tk-s\">0.01</span><span class=\"tk-k\">ms</span> <span class=\"tk-k\">!important</span>;\n  }\n}", raw: "/* CSS 侧的总闸：一段代码关掉所有装饰动画 */\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}" },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "界面数据不同步" }], [{ t: 'text', v: "同一数据存了两份" }], [{ t: 'text', v: "删掉派生副本，改为现算" }]],
        [[{ t: 'text', v: "刷新后筛选丢失" }], [{ t: 'text', v: "状态只在组件内存里" }], [{ t: 'text', v: "迁到 URL 查询参数" }]],
        [[{ t: 'text', v: "对比度检测红项" }], [{ t: 'text', v: "新配色未过脚本" }], [{ t: 'text', v: "换用令牌里已有的语义色" }]],
        [[{ t: 'text', v: "动效被系统用户投诉" }], [{ t: 'text', v: "未适配减弱动效" }], [{ t: 'text', v: "接统一钩子与 CSS 总闸" }]],
        [[{ t: 'text', v: "联合类型漏分支白屏" }], [{ t: 'text', v: "没有穷尽检查" }], [{ t: 'code', v: "switch" }, { t: 'text', v: " 尾部加 " }, { t: 'code', v: "never" }, { t: 'text', v: " 断言" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "类型门禁" }], [{ t: 'code', v: "tsc" }, { t: 'text', v: " 严格模式零错误；无 " }, { t: 'code', v: "as any" }, { t: 'text', v: " 与无约束裸泛型" }]],
        [[{ t: 'text', v: "状态纪律" }], [{ t: 'text', v: "共享状态唯一真源，筛选分页类状态可从 URL 恢复" }]],
        [[{ t: 'text', v: "设计令牌" }], [{ t: 'text', v: "全仓检索无裸色值；对比度门禁全绿" }]],
        [[{ t: 'text', v: "动效适配" }], [{ t: 'text', v: "开启系统减弱动效后装饰动画全部静止" }]],
        [[{ t: 'text', v: "评审抽查" }], [{ t: 'text', v: "随机抽三个组件，状态下沉与只读约束均达标" }]],
      ] },
    ],
  },
  {
    slug: 'backend-spec',
    index: '11',
    category: 'engineering',
    title: "后端工程规范",
    summary: "后端约定：单向分层边界、对象解耦、异常分层拦截与结构化审计日志。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "分层边界与对象解耦" },
      { id: 'sec-3', text: "异常分层与统一拦截" },
      { id: 'sec-4', text: "安全审计与日志规范" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "后端代码的腐烂都是从边界失守开始的：实体对象一路穿透到接口响应，异常堆栈直接甩给前端，日志里躺着明文密码。本篇给出社团后端项目的三条硬约定——分层边界、异常分层、安全审计，它们是评审的一票否决项。" }],
    ] },
    { kind: 'h4', text: "与阶段五路线的关系" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "《阶段五》篇讲三件套的原理与为什么要分层，本篇是分层的执法细则：哪些对象允许出现在哪一层、异常在哪一层被接住、日志允许写什么不允许写什么。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "分层边界与对象解耦" },
    { kind: 'h4', text: "单向依赖调用链" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "依赖方向只许一条线：Controller → Service → Mapper，逐层向下、单向依赖。禁止反向调用、禁止同层互调产生环、禁止跨层抄近路。工具类与通用组件放在独立的公共模块，被各层引用而不引用任何业务层。" }],
    ] },
    { kind: 'h4', text: "三类数据对象的流转纪律" },
    { kind: 'table',
      head: [[{ t: 'text', v: "对象" }], [{ t: 'text', v: "允许出现的层" }], [{ t: 'text', v: "禁止事项" }]],
      rows: [
        [[{ t: 'text', v: "DTO" }], [{ t: 'text', v: "Controller 入参、Service 入参" }], [{ t: 'text', v: "不许映射进数据库表" }]],
        [[{ t: 'text', v: "Entity" }], [{ t: 'text', v: "Service 内部、Mapper" }], [{ t: 'text', v: "不许出现在接口签名与响应里" }]],
        [[{ t: 'text', v: "VO" }], [{ t: 'text', v: "Service 出口、Controller 响应" }], [{ t: 'text', v: "不许包含密码、内部主键策略等敏感字段" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对象转换集中在 Service 层的转换器里完成，禁止在 Controller 里手拼、禁止用 BeanUtils 无脑拷贝带过校验——拷贝工具绕过了类型检查，字段错位要到运行时才炸。" }],
    ] },
    { kind: 'h4', text: "反例与正例：实体穿透" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 反例：实体直接当响应返回——密码哈希、逻辑删除标记全暴露给前端</span>\n@<span class=\"tk-k\">GetMapping</span>(<span class=\"tk-s\">\"/users/{id}\"</span>)\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">User</span> <span class=\"tk-k\">getById_bad</span>(@<span class=\"tk-k\">PathVariable</span> <span class=\"tk-k\">Long</span> id) {\n    <span class=\"tk-k\">return</span> userMapper.<span class=\"tk-k\">selectById</span>(id); <span class=\"tk-c\">// 实体穿透，且未处理查无此人</span>\n}", raw: "// 反例：实体直接当响应返回——密码哈希、逻辑删除标记全暴露给前端\n@GetMapping(\"/users/{id}\")\npublic User getById_bad(@PathVariable Long id) {\n    return userMapper.selectById(id); // 实体穿透，且未处理查无此人\n}" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 正例：VO 出参，字段白名单，空结果走业务异常</span>\n@<span class=\"tk-k\">GetMapping</span>(<span class=\"tk-s\">\"/users/{id}\"</span>)\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">Result</span>&lt;UserVO&gt; <span class=\"tk-k\">getById_good</span>(@<span class=\"tk-k\">PathVariable</span> <span class=\"tk-k\">Long</span> id) {\n    <span class=\"tk-k\">if</span> (id == <span class=\"tk-s\">null</span> || id &lt;= <span class=\"tk-s\">0</span>) {\n        <span class=\"tk-k\">throw</span> <span class=\"tk-k\">new</span> <span class=\"tk-k\">BizException</span>(ErrorCode.PARAM_INVALID);\n    }\n    <span class=\"tk-k\">User</span> entity = userService.<span class=\"tk-k\">findById</span>(id); <span class=\"tk-c\">// 查无此人内部抛 NOT_FOUND</span>\n    <span class=\"tk-k\">return</span> Result.<span class=\"tk-k\">ok</span>(UserConvert.<span class=\"tk-k\">toVO</span>(entity));\n}", raw: "// 正例：VO 出参，字段白名单，空结果走业务异常\n@GetMapping(\"/users/{id}\")\npublic Result<UserVO> getById_good(@PathVariable Long id) {\n    if (id == null || id <= 0) {\n        throw new BizException(ErrorCode.PARAM_INVALID);\n    }\n    User entity = userService.findById(id); // 查无此人内部抛 NOT_FOUND\n    return Result.ok(UserConvert.toVO(entity));\n}" },
    { kind: 'h3', id: 'sec-3', text: "异常分层与统一拦截" },
    { kind: 'h4', text: "业务异常枚举化" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务错误一律抛 " }, { t: 'code', v: "BizException" }, { t: 'text', v: " 并携带错误码枚举，禁止用字符串消息自由发挥——前端按错误码做分支，字符串消息只做给人看的补充。参数校验失败、资源不存在、权限不足、业务规则冲突各自独立成码，不允许共用一个「操作失败」兜底码。" }],
    ] },
    { kind: 'h4', text: "全局统一异常拦截器" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "所有异常的最终出口只有一个：全局拦截器。它把三类异常翻译成三种响应，日志详细度各不相同：" }],
    ] },
    { kind: 'code', lang: 'java', html: "@<span class=\"tk-k\">RestControllerAdvice</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">GlobalExceptionHandler</span> {\n\n    <span class=\"tk-c\">// 业务异常：信息可原样返回给调用方</span>\n    @<span class=\"tk-k\">ExceptionHandler</span>(BizException.class)\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">Result</span>&lt;<span class=\"tk-k\">Void</span>&gt; <span class=\"tk-k\">onBiz</span>(<span class=\"tk-k\">BizException</span> e) {\n        log.<span class=\"tk-k\">info</span>(<span class=\"tk-s\">\"业务异常: {}\"</span>, e.<span class=\"tk-k\">getMessage</span>());\n        <span class=\"tk-k\">return</span> Result.<span class=\"tk-k\">fail</span>(e.<span class=\"tk-k\">getCode</span>(), e.<span class=\"tk-k\">getMessage</span>());\n    }\n\n    <span class=\"tk-c\">// 参数校验异常：回传具体字段问题</span>\n    @<span class=\"tk-k\">ExceptionHandler</span>(MethodArgumentNotValidException.class)\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">Result</span>&lt;<span class=\"tk-k\">Void</span>&gt; <span class=\"tk-k\">onParam</span>(<span class=\"tk-k\">MethodArgumentNotValidException</span> e) {\n        <span class=\"tk-k\">String</span> detail = e.<span class=\"tk-k\">getBindingResult</span>().<span class=\"tk-k\">getFieldErrors</span>().<span class=\"tk-k\">stream</span>()\n                .<span class=\"tk-k\">map</span>(f -&gt; f.<span class=\"tk-k\">getField</span>() + <span class=\"tk-s\">\" \"</span> + f.<span class=\"tk-k\">getDefaultMessage</span>())\n                .<span class=\"tk-k\">findFirst</span>().<span class=\"tk-k\">orElse</span>(<span class=\"tk-s\">\"参数不合法\"</span>);\n        <span class=\"tk-k\">return</span> Result.<span class=\"tk-k\">fail</span>(ErrorCode.PARAM_INVALID, detail);\n    }\n\n    <span class=\"tk-c\">// 未知异常：对外只给通用文案，堆栈只进日志</span>\n    @<span class=\"tk-k\">ExceptionHandler</span>(Exception.class)\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">Result</span>&lt;<span class=\"tk-k\">Void</span>&gt; <span class=\"tk-k\">onUnknown</span>(<span class=\"tk-k\">HttpServletRequest</span> req, <span class=\"tk-k\">Exception</span> e) {\n        log.<span class=\"tk-k\">error</span>(<span class=\"tk-s\">\"未处理异常 {} {}\"</span>, req.<span class=\"tk-k\">getMethod</span>(), req.<span class=\"tk-k\">getRequestURI</span>(), e);\n        <span class=\"tk-c\">// 生产环境绝不把 SQL 与堆栈细节返回，防注入探测与信息泄露</span>\n        <span class=\"tk-k\">return</span> Result.<span class=\"tk-k\">fail</span>(ErrorCode.INTERNAL, <span class=\"tk-s\">\"服务暂不可用，请稍后重试\"</span>);\n    }\n}", raw: "@RestControllerAdvice\npublic class GlobalExceptionHandler {\n\n    // 业务异常：信息可原样返回给调用方\n    @ExceptionHandler(BizException.class)\n    public Result<Void> onBiz(BizException e) {\n        log.info(\"业务异常: {}\", e.getMessage());\n        return Result.fail(e.getCode(), e.getMessage());\n    }\n\n    // 参数校验异常：回传具体字段问题\n    @ExceptionHandler(MethodArgumentNotValidException.class)\n    public Result<Void> onParam(MethodArgumentNotValidException e) {\n        String detail = e.getBindingResult().getFieldErrors().stream()\n                .map(f -> f.getField() + \" \" + f.getDefaultMessage())\n                .findFirst().orElse(\"参数不合法\");\n        return Result.fail(ErrorCode.PARAM_INVALID, detail);\n    }\n\n    // 未知异常：对外只给通用文案，堆栈只进日志\n    @ExceptionHandler(Exception.class)\n    public Result<Void> onUnknown(HttpServletRequest req, Exception e) {\n        log.error(\"未处理异常 {} {}\", req.getMethod(), req.getRequestURI(), e);\n        // 生产环境绝不把 SQL 与堆栈细节返回，防注入探测与信息泄露\n        return Result.fail(ErrorCode.INTERNAL, \"服务暂不可用，请稍后重试\");\n    }\n}" },
    { kind: 'h4', text: "禁止的异常姿势" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "catch" }, { t: 'text', v: " 后空处理与 " }, { t: 'code', v: "e.printStackTrace()" }, { t: 'text', v: " 是一票否决项：前者把错误吞进黑暗，后者把堆栈打进标准输出无法归集。捕获后只有两种合法动作——转换为业务异常上抛，或记录结构化日志并给出兜底返回。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "安全审计与日志规范" },
    { kind: 'h4', text: "追加模式结构化审计日志" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "涉及账号、权限、资金的操作必须写审计日志：追加写入、只增不改，记录谁（操作者标识）、何时（时间戳）、对谁（目标对象）、做了什么（操作类型与结果）。审计日志与业务日志分库或分文件存放，保留期按项目合规要求设定。" }],
    ] },
    { kind: 'h4', text: "敏感字段脱敏" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "日志输出前经过统一的脱敏层：手机号保留前三后四、身份证保留首三位与末四位、令牌与密码永不落盘。脱敏在日志框架的编码器层统一做，而不是依赖每个开发者手写——漏一个点就是泄露一个点。" }],
    ] },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 统一脱敏工具示例：任何写日志前的敏感字段都过这里</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">final</span> <span class=\"tk-k\">class</span> <span class=\"tk-k\">Sensitive</span> {\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">static</span> <span class=\"tk-k\">String</span> <span class=\"tk-k\">phone</span>(<span class=\"tk-k\">String</span> raw) {\n        <span class=\"tk-k\">if</span> (raw == <span class=\"tk-s\">null</span> || raw.<span class=\"tk-k\">length</span>() &lt; <span class=\"tk-s\">11</span>) {\n            <span class=\"tk-k\">return</span> <span class=\"tk-s\">\"***\"</span>; <span class=\"tk-c\">// 非法输入直接全遮，不做局部暴露</span>\n        }\n        <span class=\"tk-k\">return</span> raw.<span class=\"tk-k\">substring</span>(<span class=\"tk-s\">0</span>, <span class=\"tk-s\">3</span>) + <span class=\"tk-s\">\"****\"</span> + raw.<span class=\"tk-k\">substring</span>(<span class=\"tk-s\">7</span>);\n    }\n\n    <span class=\"tk-k\">public</span> <span class=\"tk-k\">static</span> <span class=\"tk-k\">String</span> <span class=\"tk-k\">token</span>(<span class=\"tk-k\">String</span> raw) {\n        <span class=\"tk-c\">// 令牌无论多短都全遮，只留存在性信息</span>\n        <span class=\"tk-k\">return</span> raw == <span class=\"tk-s\">null</span> || raw.<span class=\"tk-k\">isEmpty</span>() <span class=\"tk-k\">?</span> <span class=\"tk-s\">\"(空)\"</span> <span class=\"tk-k\">:</span> <span class=\"tk-s\">\"***\"</span>;\n    }\n}", raw: "// 统一脱敏工具示例：任何写日志前的敏感字段都过这里\npublic final class Sensitive {\n    public static String phone(String raw) {\n        if (raw == null || raw.length() < 11) {\n            return \"***\"; // 非法输入直接全遮，不做局部暴露\n        }\n        return raw.substring(0, 3) + \"****\" + raw.substring(7);\n    }\n\n    public static String token(String raw) {\n        // 令牌无论多短都全遮，只留存在性信息\n        return raw == null || raw.isEmpty() ? \"(空)\" : \"***\";\n    }\n}" },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "前端拿到密码哈希" }], [{ t: 'text', v: "实体直接出参" }], [{ t: 'text', v: "强制 VO 出参，评审检查接口签名" }]],
        [[{ t: 'text', v: "报错信息里带出表结构" }], [{ t: 'text', v: "未知异常未拦截" }], [{ t: 'text', v: "接入全局拦截器，生产关闭堆栈外泄" }]],
        [[{ t: 'text', v: "同层互调成环" }], [{ t: 'text', v: "模块划分按技术而不是业务" }], [{ t: 'text', v: "按业务域重切模块，公共逻辑下沉公共层" }]],
        [[{ t: 'text', v: "审计查不到操作人" }], [{ t: 'text', v: "日志未记操作者标识" }], [{ t: 'text', v: "拦截器统一注入操作者上下文" }]],
        [[{ t: 'text', v: "BeanUtils 拷贝字段错位" }], [{ t: 'text', v: "无脑拷贝绕过类型检查" }], [{ t: 'text', v: "手写转换器或 MapStruct 编译期生成" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "分层检查" }], [{ t: 'text', v: "依赖分析工具确认单向依赖，无跨层调用" }]],
        [[{ t: 'text', v: "对象纪律" }], [{ t: 'text', v: "接口签名与响应中检索不到 Entity 类型" }]],
        [[{ t: 'text', v: "异常出口" }], [{ t: 'text', v: "全部异常经全局拦截器，无 " }, { t: 'code', v: "printStackTrace" }, { t: 'text', v: " 与空 " }, { t: 'code', v: "catch" }]],
        [[{ t: 'text', v: "日志安全" }], [{ t: 'text', v: "抽查一周日志无明文密码、令牌与完整手机号" }]],
        [[{ t: 'text', v: "审计完整" }], [{ t: 'text', v: "账号权限类操作可按操作者检索到完整审计记录" }]],
      ] },
    ],
  },
  {
    slug: 'api-contract',
    index: '12',
    category: 'engineering',
    title: "接口契约规范",
    summary: "契约约定：OpenAPI 驱动类型生成、统一响应协议、分页保护与注入防线。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "OpenAPI 驱动的契约流水线" },
      { id: 'sec-3', text: "统一响应协议与错误码映射" },
      { id: 'sec-4', text: "分页保护与安全防线" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "前后端联调的经典灾难是「各写各的」：前端按口头约定写调用，后端按自己的理解实现，联调当天互相甩锅。契约优先的原则是把接口定义变成一份双方共同生成的源头文件——契约是法律，代码只是执法。" }],
    ] },
    { kind: 'h4', text: "契约优先的三个收益" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一是消灭手抄：类型与请求客户端从契约生成，字段改名两端同步报错。二是提前暴露分歧：契约评审在编码之前，字段语义、错误码语义先吵完再动手。三是文档永生：接口文档就是契约文件本身，不存在「文档没跟上代码」。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "OpenAPI 驱动的契约流水线" },
    { kind: 'h4', text: "契约文件是唯一真源" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "接口以 OpenAPI 3.0 文件定义，包含路径、方法、请求体、响应体与错误响应。评审通过后，流水线向两端同时生成产物：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 前端侧：从契约生成 TypeScript 类型与请求客户端</span>\n<span class=\"tk-k\">npx</span> openapi-typescript openapi.yaml -o src/api/schema.d.ts\n\n<span class=\"tk-c\"># 后端侧：从契约生成接口骨架，实现类只写业务不写签名</span>\n<span class=\"tk-c\"># （以项目使用的生成器为准，产物同样纳入版本控制）</span>", raw: "# 前端侧：从契约生成 TypeScript 类型与请求客户端\nnpx openapi-typescript openapi.yaml -o src/api/schema.d.ts\n\n# 后端侧：从契约生成接口骨架，实现类只写业务不写签名\n# （以项目使用的生成器为准，产物同样纳入版本控制）" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "生成的文件带「由契约生成，勿手改」的头注，纳入类型检查门禁——谁手改生成文件，谁在下次生成时自食其果。" }],
    ] },
    { kind: 'h4', text: "契约变更的评审纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "契约合入主干后才算生效；任何字段新增、改名、删除都必须走合并请求评审，破坏性变更（删字段、改类型）必须升版本号并通知全部调用方。禁止「先改代码后补契约」——那等于回到了口头约定时代。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "统一响应协议与错误码映射" },
    { kind: 'h4', text: "传输层与业务层的双层协议" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "HTTP 状态码描述传输层事实，响应体里的业务错误码描述业务层事实，两层各司其职、不可互相替代：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "HTTP 状态码" }], [{ t: 'text', v: "传输层语义" }], [{ t: 'text', v: "业务层错误码示例" }]],
      rows: [
        [[{ t: 'text', v: "200" }], [{ t: 'text', v: "请求成功送达并被处理" }], [{ t: 'code', v: "0" }, { t: 'text', v: " 成功，非 0 为业务失败" }]],
        [[{ t: 'text', v: "400" }], [{ t: 'text', v: "请求参数不合法" }], [{ t: 'code', v: "1001" }, { t: 'text', v: " 参数校验失败" }]],
        [[{ t: 'text', v: "401" }], [{ t: 'text', v: "未认证或令牌过期" }], [{ t: 'code', v: "1002" }, { t: 'text', v: " 令牌失效需重登" }]],
        [[{ t: 'text', v: "403" }], [{ t: 'text', v: "已认证但无权限" }], [{ t: 'code', v: "1003" }, { t: 'text', v: " 权限不足" }]],
        [[{ t: 'text', v: "404" }], [{ t: 'text', v: "资源路径不存在" }], [{ t: 'code', v: "1004" }, { t: 'text', v: " 目标记录不存在" }]],
        [[{ t: 'text', v: "500" }], [{ t: 'text', v: "服务端内部故障" }], [{ t: 'code', v: "1005" }, { t: 'text', v: " 服务内部错误" }]],
      ] },
    { kind: 'h4', text: "统一响应包装" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "所有接口响应遵循同一个信封结构，前端拦截器按统一逻辑解包：" }],
    ] },
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">code</span>\": <span class=\"tk-s\">0</span>,\n  \"<span class=\"tk-k\">message</span>\": <span class=\"tk-s\">\"ok\"</span>,\n  \"<span class=\"tk-k\">data</span>\": { \"<span class=\"tk-k\">id</span>\": <span class=\"tk-s\">42</span>, \"<span class=\"tk-k\">name</span>\": <span class=\"tk-s\">\"示例记录\"</span> }\n}", raw: "{\n  \"code\": 0,\n  \"message\": \"ok\",\n  \"data\": { \"id\": 42, \"name\": \"示例记录\" }\n}" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "code" }, { t: 'text', v: " 为 0 时读 " }, { t: 'code', v: "data" }, { t: 'text', v: "，非 0 时按错误码分支处理；" }, { t: 'code', v: "message" }, { t: 'text', v: " 永远只用于展示，不允许前端解析它的文案做逻辑判断。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "分页保护与安全防线" },
    { kind: 'h4', text: "单页容量硬上限" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "列表接口必须限制单页大小，前端传多少信多少等于把内存与数据库交给运气。社团约定：默认每页 20 条，硬上限 100 条，超限直接回落到上限值并在响应中明示：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 服务端分页参数防御：任何来自请求的分页值都先过这里</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">sanitizePage</span>(raw: <span class=\"tk-k\">unknown</span>, rawSize: <span class=\"tk-k\">unknown</span>) {\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">page</span> = <span class=\"tk-k\">Number</span>(raw)\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">size</span> = <span class=\"tk-k\">Number</span>(rawSize)\n  <span class=\"tk-k\">return</span> {\n    page: Number.<span class=\"tk-k\">isInteger</span>(page) &amp;&amp; page &gt; <span class=\"tk-s\">0</span> ? page : <span class=\"tk-s\">1</span>,\n    <span class=\"tk-c\">// 硬上限 100：防全表加载拖垮内存与数据库</span>\n    size: Number.<span class=\"tk-k\">isInteger</span>(size) &amp;&amp; size &gt; <span class=\"tk-s\">0</span> ? Math.<span class=\"tk-k\">min</span>(size, <span class=\"tk-s\">100</span>) : <span class=\"tk-s\">20</span>,\n  }\n}", raw: "// 服务端分页参数防御：任何来自请求的分页值都先过这里\nexport function sanitizePage(raw: unknown, rawSize: unknown) {\n  const page = Number(raw)\n  const size = Number(rawSize)\n  return {\n    page: Number.isInteger(page) && page > 0 ? page : 1,\n    // 硬上限 100：防全表加载拖垮内存与数据库\n    size: Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 20,\n  }\n}" },
    { kind: 'h4', text: "深分页的游标方案" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "LIMIT 100000, 20" }, { t: 'text', v: " 式的偏移分页在深页会扫描并丢弃十万行，数据库压力随页码线性恶化。大结果集的遍历与导出改用游标：以上一页最后一条的主键作为下一页起点，配合单页上限循环取数直到取空。" }],
    ] },
    { kind: 'code', lang: 'sql', html: "<span class=\"tk-c\">-- 游标分页：起点是上一页最后一行的主键，扫描量恒定</span>\n<span class=\"tk-k\">SELECT</span> id, <span class=\"tk-k\">name</span>, score <span class=\"tk-k\">FROM</span> student\n<span class=\"tk-k\">WHERE</span> id &gt; <span class=\"tk-s\">86000</span>\n<span class=\"tk-k\">ORDER BY</span> id\n<span class=\"tk-k\">LIMIT</span> <span class=\"tk-s\">100</span>;", raw: "-- 游标分页：起点是上一页最后一行的主键，扫描量恒定\nSELECT id, name, score FROM student\nWHERE id > 86000\nORDER BY id\nLIMIT 100;" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "SQL 注入至今仍在高危漏洞榜前列，根因只有一个：把用户输入拼进了 SQL 文本。社团铁律——" }, { t: 'strong', v: "全量参数化，零拼接" }, { t: 'text', v: "：" }],
    ] },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 反例：字符串拼接——输入 1' OR '1'='1 即可拖走全表</span>\n<span class=\"tk-k\">String</span> sql = <span class=\"tk-s\">\"SELECT * FROM student WHERE name = '\"</span> + name + <span class=\"tk-s\">\"'\"</span>; <span class=\"tk-c\">// 禁止</span>\n\n<span class=\"tk-c\">// 正例：预编译语句，参数只作为数据永远不会被解释为指令</span>\n<span class=\"tk-k\">public</span> <span class=\"tk-k\">Student</span> <span class=\"tk-k\">findByName</span>(<span class=\"tk-k\">String</span> name) {\n    <span class=\"tk-k\">if</span> (name == <span class=\"tk-s\">null</span> || name.<span class=\"tk-k\">isBlank</span>()) {\n        <span class=\"tk-k\">return</span> <span class=\"tk-s\">null</span>; <span class=\"tk-c\">// 空值防御在 SQL 之前</span>\n    }\n    <span class=\"tk-k\">String</span> sql = <span class=\"tk-s\">\"SELECT id, name FROM student WHERE name = ?\"</span>;\n    <span class=\"tk-k\">return</span> jdbcTemplate.<span class=\"tk-k\">queryForObject</span>(\n        sql, (rs, rowNum) -&gt; <span class=\"tk-k\">new</span> <span class=\"tk-k\">Student</span>(rs.<span class=\"tk-k\">getLong</span>(<span class=\"tk-s\">\"id\"</span>), rs.<span class=\"tk-k\">getString</span>(<span class=\"tk-s\">\"name\"</span>)), name);\n}", raw: "// 反例：字符串拼接——输入 1' OR '1'='1 即可拖走全表\nString sql = \"SELECT * FROM student WHERE name = '\" + name + \"'\"; // 禁止\n\n// 正例：预编译语句，参数只作为数据永远不会被解释为指令\npublic Student findByName(String name) {\n    if (name == null || name.isBlank()) {\n        return null; // 空值防御在 SQL 之前\n    }\n    String sql = \"SELECT id, name FROM student WHERE name = ?\";\n    return jdbcTemplate.queryForObject(\n        sql, (rs, rowNum) -> new Student(rs.getLong(\"id\"), rs.getString(\"name\")), name);\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "排序字段等无法参数化的位置，用白名单校验枚举值后再拼接，白名单之外的输入直接拒绝。代码评审对字符串拼接 SQL 零容忍，静态扫描工具同时纳入门禁。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "联调字段对不上" }], [{ t: 'text', v: "没有契约或契约未更新" }], [{ t: 'text', v: "契约先行，生成物入仓，门禁校验" }]],
        [[{ t: 'text', v: "列表接口拖垮服务" }], [{ t: 'text', v: "分页大小不设防" }], [{ t: 'text', v: "硬上限 + 默认值回落" }]],
        [[{ t: 'text', v: "深页越翻越慢" }], [{ t: 'text', v: "偏移分页线性扫描" }], [{ t: 'text', v: "改游标分页" }]],
        [[{ t: 'text', v: "前端解析文案做判断" }], [{ t: 'text', v: "错误语义绑在 message 上" }], [{ t: 'text', v: "逻辑分支只认错误码" }]],
        [[{ t: 'text', v: "排序参数被注入" }], [{ t: 'text', v: "排序字段直接拼接" }], [{ t: 'text', v: "白名单枚举校验" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "契约真源" }], [{ t: 'text', v: "全部接口在 OpenAPI 文件中有定义，生成物与契约一致" }]],
        [[{ t: 'text', v: "协议一致" }], [{ t: 'text', v: "全部接口走统一信封结构，错误码表收录在契约内" }]],
        [[{ t: 'text', v: "分页保护" }], [{ t: 'text', v: "超限分页请求被回落，无全表加载路径" }]],
        [[{ t: 'text', v: "注入防线" }], [{ t: 'text', v: "静态扫描无 SQL 拼接；抽测注入载荷全部被参数化挡住" }]],
        [[{ t: 'text', v: "版本纪律" }], [{ t: 'text', v: "破坏性变更有版本号与调用方通知记录" }]],
      ] },
    ],
  },
  {
    slug: 'testing-review',
    index: '13',
    category: 'engineering',
    title: "测试与评审规范",
    summary: "质量约定：单元测试隔离打桩、覆盖率门禁指标与二十项代码审查清单。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "单元测试纪律：隔离、打桩与覆盖率" },
      { id: 'sec-3', text: "代码评审二十项核对清单" },
      { id: 'sec-4', text: "正反例设计范式" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "质量的最后一道防线只有两层：机器跑的测试与人做的评审。测试负责证明「代码按设想工作」，评审负责追问「设想本身对不对」。本篇给出社团对这两层防线的量化标准——测什么、怎么隔离、覆盖率门禁多少、评审按哪二十项核对。" }],
    ] },
    { kind: 'h4', text: "测试金字塔的社团裁剪" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "单元测试是绝对主力：快、稳、可定位，覆盖核心业务逻辑的全部路径。集成测试只补关键链路（如事务与持久化），端到端测试只守最关键的用户路径。倒金字塔（大量端到端、极少单测）的团队，测试跑得慢、失败定位难，最终的下场是没人再跑测试。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "单元测试纪律：隔离、打桩与覆盖率" },
    { kind: 'h4', text: "隔离原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "单元测试的铁律是" }, { t: 'strong', v: "只测一个单元" }, { t: 'text', v: "：不碰数据库、不碰网络、不碰文件系统、不依赖执行顺序。凡是跨越进程边界的东西，一律用桩替代——这不是偷懒，而是让测试可以在任何机器上以任何顺序毫秒级跑完的前提。" }],
    ] },
    { kind: 'h4', text: "打桩模拟的两种姿势" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 前端侧（Vitest）：网络请求打桩，断言组件对两种结果的处理</span>\n<span class=\"tk-k\">import</span> { vi } <span class=\"tk-k\">from</span> <span class=\"tk-s\">'vitest'</span>\n\nvi.<span class=\"tk-k\">mock</span>(<span class=\"tk-s\">'../api/client'</span>, () =&gt; ({\n  fetchCourses: vi.<span class=\"tk-k\">fn</span>(),\n}))\n\n<span class=\"tk-c\">// 成功路径断言渲染结果</span>\n<span class=\"tk-c\">// 失败路径断言降级提示——失败分支不测等于没测</span>", raw: "// 前端侧（Vitest）：网络请求打桩，断言组件对两种结果的处理\nimport { vi } from 'vitest'\n\nvi.mock('../api/client', () => ({\n  fetchCourses: vi.fn(),\n}))\n\n// 成功路径断言渲染结果\n// 失败路径断言降级提示——失败分支不测等于没测" },
    { kind: 'code', lang: 'java', html: "<span class=\"tk-c\">// 后端侧（Mockito）：Mapper 打桩，只验证 Service 的业务决策</span>\n@<span class=\"tk-k\">Test</span>\n<span class=\"tk-k\">void</span> <span class=\"tk-k\">register_nameTaken_throwsBiz</span>() {\n    <span class=\"tk-k\">when</span>(userMapper.<span class=\"tk-k\">existsByName</span>(<span class=\"tk-s\">\"张三\"</span>)).<span class=\"tk-k\">thenReturn</span>(<span class=\"tk-s\">true</span>);\n\n    <span class=\"tk-k\">assertThatThrownBy</span>(() -&gt; service.<span class=\"tk-k\">register</span>(<span class=\"tk-k\">dtoOf</span>(<span class=\"tk-s\">\"张三\"</span>)))\n        .<span class=\"tk-k\">isInstanceOf</span>(BizException.class)\n        .<span class=\"tk-k\">hasMessageContaining</span>(<span class=\"tk-s\">\"已存在\"</span>);\n    <span class=\"tk-k\">verify</span>(userMapper, <span class=\"tk-k\">never</span>()).<span class=\"tk-k\">insert</span>(<span class=\"tk-k\">any</span>()); <span class=\"tk-c\">// 重复名必须不落库</span>\n}", raw: "// 后端侧（Mockito）：Mapper 打桩，只验证 Service 的业务决策\n@Test\nvoid register_nameTaken_throwsBiz() {\n    when(userMapper.existsByName(\"张三\")).thenReturn(true);\n\n    assertThatThrownBy(() -> service.register(dtoOf(\"张三\")))\n        .isInstanceOf(BizException.class)\n        .hasMessageContaining(\"已存在\");\n    verify(userMapper, never()).insert(any()); // 重复名必须不落库\n}" },
    { kind: 'h4', text: "边界断言的清单意识" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每个被测方法至少覆盖三类断言：正常路径的期望输出、边界输入（空、零、上限、临界值）、异常路径的抛出与副作用。写测试先列边界清单再动手，是区分「测过」和「测到」的分水岭。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "覆盖率是下限不是目标：100% 覆盖率挡不住断言写反的测试，但没有覆盖率门禁，核心代码必然裸奔。社团门禁指标：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "范围" }], [{ t: 'text', v: "行覆盖率" }], [{ t: 'text', v: "分支覆盖率" }]],
      rows: [
        [[{ t: 'text', v: "核心业务逻辑（Service 层）" }], [{ t: 'text', v: "不低于 80%" }], [{ t: 'text', v: "不低于 70%" }]],
        [[{ t: 'text', v: "工具与转换模块" }], [{ t: 'text', v: "不低于 90%" }], [{ t: 'text', v: "不低于 80%" }]],
        [[{ t: 'text', v: "控制器与配置类" }], [{ t: 'text', v: "不强制" }], [{ t: 'text', v: "不强制" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "覆盖率报告纳入门禁流水线，下降即红；为凑覆盖率而写的无断言测试（只调用不断言）在评审中按无效测试处理。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "代码评审二十项核对清单" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "评审人按四组逐项核对，任何一项命中都要给出意见：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "组" }], [{ t: 'text', v: "核对项" }]],
      rows: [
        [[{ t: 'text', v: "空值防御" }], [{ t: 'text', v: "外部入参判空 / 集合取值判空 / 可空返回有兜底 / 解引用前收窄 / 配置缺失有默认" }]],
        [[{ t: 'text', v: "并发安全" }], [{ t: 'text', v: "共享可变状态加锁 / 并发容器选型正确 / 无竞态的复合操作 / 锁范围最小化 / 异步回调线程安全" }]],
        [[{ t: 'text', v: "事务边界" }], [{ t: 'text', v: "事务注解在 Service 层 / 异常触发回滚声明 / 无同类自调用 / 长事务已拆分 / 事务内无外部调用" }]],
        [[{ t: 'text', v: "资源关闭" }], [{ t: 'text', v: "流与连接用 try-with-resources / 监听器有注销 / 定时器有清理 / 锁有释放路径 / 大对象及时置空" }]],
        [[{ t: 'text', v: "类型断言" }], [{ t: 'text', v: "无 as any 与强转逃逸 / 反序列化先校验 / 枚举转换有未知分支 / 数值范围已检查 / 泛型约束已收紧" }]],
      ] },
    { kind: 'h4', text: "评审的礼仪与纪律" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "意见对事不对人，描述问题与建议而不是评判作者；作者逐条销项，不同意的当面讨论不留暗账。评审时长单次不超过一小时，改动超过四百行先拆再审——评审人对着千行改动只能给出「看起来没问题」这种无效结论。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "正反例设计范式" },
    { kind: 'h4', text: "反例：无断言的假测试与耦合环境的慢测试" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 反例一：只调用不断言——覆盖率涨了，问题一个都拦不住</span>\n<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'假测试'</span>, () =&gt; {\n  <span class=\"tk-k\">parseConfig</span>(<span class=\"tk-s\">'{\"a\":1}'</span>)\n})\n\n<span class=\"tk-c\">// 反例二：直连真实接口——网络一抖全红，从此没人再跑</span>\n<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'慢测试'</span>, <span class=\"tk-k\">async</span> () =&gt; {\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">data</span> = <span class=\"tk-k\">await</span> <span class=\"tk-k\">fetch</span>(<span class=\"tk-s\">'https://api.example.com/courses'</span>)\n  <span class=\"tk-k\">expect</span>(data.status).<span class=\"tk-k\">toBe</span>(<span class=\"tk-s\">200</span>)\n})", raw: "// 反例一：只调用不断言——覆盖率涨了，问题一个都拦不住\nit('假测试', () => {\n  parseConfig('{\"a\":1}')\n})\n\n// 反例二：直连真实接口——网络一抖全红，从此没人再跑\nit('慢测试', async () => {\n  const data = await fetch('https://api.example.com/courses')\n  expect(data.status).toBe(200)\n})" },
    { kind: 'h4', text: "正例：边界清单驱动的隔离测试" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 正例：纯函数直接断言边界；外部依赖全部打桩</span>\n<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'分页参数超上限回落到 100'</span>, () =&gt; {\n  <span class=\"tk-k\">expect</span>(<span class=\"tk-k\">sanitizePage</span>(<span class=\"tk-s\">'1'</span>, <span class=\"tk-s\">'99999'</span>)).<span class=\"tk-k\">toEqual</span>({ page: <span class=\"tk-s\">1</span>, size: <span class=\"tk-s\">100</span> })\n})\n\n<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'非法页码回落第一页'</span>, () =&gt; {\n  <span class=\"tk-k\">expect</span>(<span class=\"tk-k\">sanitizePage</span>(<span class=\"tk-s\">'-3'</span>, <span class=\"tk-s\">'abc'</span>)).<span class=\"tk-k\">toEqual</span>({ page: <span class=\"tk-s\">1</span>, size: <span class=\"tk-s\">20</span> })\n})\n\n<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'空配置快速失败'</span>, () =&gt; {\n  <span class=\"tk-k\">expect</span>(() =&gt; <span class=\"tk-k\">loadConfig</span>(<span class=\"tk-s\">'   '</span>)).<span class=\"tk-k\">toThrow</span>(<span class=\"tk-s\">'配置内容为空'</span>)\n})", raw: "// 正例：纯函数直接断言边界；外部依赖全部打桩\nit('分页参数超上限回落到 100', () => {\n  expect(sanitizePage('1', '99999')).toEqual({ page: 1, size: 100 })\n})\n\nit('非法页码回落第一页', () => {\n  expect(sanitizePage('-3', 'abc')).toEqual({ page: 1, size: 20 })\n})\n\nit('空配置快速失败', () => {\n  expect(() => loadConfig('   ')).toThrow('配置内容为空')\n})" },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "测试时绿时红" }], [{ t: 'text', v: "依赖时间、顺序或真实环境" }], [{ t: 'text', v: "打桩隔离，固定测试时钟" }]],
        [[{ t: 'text', v: "改了 A 红了 B" }], [{ t: 'text', v: "测试间共享可变状态" }], [{ t: 'text', v: "每用例独立初始化，禁止全局变量" }]],
        [[{ t: 'text', v: "覆盖率高但事故照发" }], [{ t: 'text', v: "断言只测成功路径" }], [{ t: 'text', v: "评审测试代码本身，补边界与异常断言" }]],
        [[{ t: 'text', v: "评审走过场" }], [{ t: 'text', v: "改动过大评审疲劳" }], [{ t: 'text', v: "拆分请求，单次评审限四百行" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "隔离性" }], [{ t: 'text', v: "断网断库环境下全量测试通过，执行顺序打乱仍通过" }]],
        [[{ t: 'text', v: "覆盖率" }], [{ t: 'text', v: "核心业务行覆盖与分支覆盖达标，报告入仓" }]],
        [[{ t: 'text', v: "断言质量" }], [{ t: 'text', v: "抽查十个用例均有明确断言，含边界与异常路径" }]],
        [[{ t: 'text', v: "评审记录" }], [{ t: 'text', v: "近期合并请求均有评审意见与销项记录" }]],
        [[{ t: 'text', v: "清单执行" }], [{ t: 'text', v: "评审意见可追溯到二十项清单的具体条目" }]],
      ] },
    ],
  },
  {
    slug: 'env-setup',
    index: '14',
    category: 'handbook',
    title: "开发环境与工具链配置指南",
    summary: "环境基线：JDK 与 Node 版本管理、Git 配置、镜像加速与 IDE 插件集。",
    minutes: 10,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "JDK 与 Node.js 版本管理" },
      { id: 'sec-3', text: "Git 与包管理器配置" },
      { id: 'sec-4', text: "IDE 插件集与格式化" },
      { id: 'sec-5', text: "高频故障与实操避坑" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "环境问题吞掉的新人时间，比写代码还多：版本不一致导致「我这能跑你那不行」，镜像没配导致依赖装一小时，格式化没接导致评审里一半意见是缩进。本篇给出社团统一的开发环境基线——装什么版本、怎么管理版本、怎么加速、IDE 怎么配。" }],
    ] },
    { kind: 'h4', text: "环境基线的原则" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一切工具链版本以项目仓库的声明为准（" }, { t: 'code', v: "pom.xml" }, { t: 'text', v: "、" }, { t: 'code', v: "package.json" }, { t: 'text', v: "、" }, { t: 'code', v: ".nvmrc" }, { t: 'text', v: "），本机环境服务于仓库声明，而不是反过来。装完每一项都用命令验证版本输出，不许「装完就算」。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "JDK 与 Node.js 版本管理" },
    { kind: 'h4', text: "发行版选择" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团统一使用开源发行版：Eclipse Temurin 或 Amazon Corretto，均为 OpenJDK 构建，长期支持版本优先。版本跟随项目：老项目 Java 8 或 11，新项目一律 Java 17 及以上。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># Windows 推荐用版本管理器安装，多版本共存按项目切换</span>\n<span class=\"tk-k\">scoop</span> install temurin17-jdk\n\n<span class=\"tk-c\"># 验证：三行输出齐全才算装好</span>\n<span class=\"tk-k\">java</span> -version\n<span class=\"tk-k\">javac</span> -version\n<span class=\"tk-k\">echo</span> $env:JAVA_HOME   <span class=\"tk-c\"># PowerShell 下确认环境变量已指向 JDK</span>", raw: "# Windows 推荐用版本管理器安装，多版本共存按项目切换\nscoop install temurin17-jdk\n\n# 验证：三行输出齐全才算装好\njava -version\njavac -version\necho $env:JAVA_HOME   # PowerShell 下确认环境变量已指向 JDK" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "JAVA_HOME" }, { t: 'text', v: " 必须指向 JDK 而不是 JRE，构建工具依赖它定位编译器；多版本共存时切换版本就是切换这个变量，建议交给版本管理器而不是手改。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Node 版本禁止全局装死：用版本管理器按项目切换，每个项目根目录放 " }, { t: 'code', v: ".nvmrc" }, { t: 'text', v: " 声明版本，进目录切换一次即可。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># nvm-windows 安装与按项目切换</span>\n<span class=\"tk-k\">nvm</span> install <span class=\"tk-s\">22.11.0</span>\n<span class=\"tk-k\">nvm</span> use <span class=\"tk-s\">22.11.0</span>\n\n<span class=\"tk-c\"># 验证：版本与包管理器就位</span>\n<span class=\"tk-k\">node</span> -v\n<span class=\"tk-k\">npm</span> -v", raw: "# nvm-windows 安装与按项目切换\nnvm install 22.11.0\nnvm use 22.11.0\n\n# 验证：版本与包管理器就位\nnode -v\nnpm -v" },
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">说明</span>\": <span class=\"tk-s\">\"项目根目录的 .nvmrc 只写大版本或精确版本\"</span>,\n  \"<span class=\"tk-k\">.nvmrc</span>\": <span class=\"tk-s\">\"22.11.0\"</span>\n}", raw: "{\n  \"说明\": \"项目根目录的 .nvmrc 只写大版本或精确版本\",\n  \".nvmrc\": \"22.11.0\"\n}" },
    { kind: 'h3', id: 'sec-3', text: "Git 与包管理器配置" },
    { kind: 'h4', text: "Git 全局基线" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 身份标识用真实姓名与常用邮箱，提交归属靠它</span>\n<span class=\"tk-k\">git</span> config --global user.name <span class=\"tk-s\">\"你的名字\"</span>\n<span class=\"tk-k\">git</span> config --global user.email <span class=\"tk-s\">\"you@example.com\"</span>\n\n<span class=\"tk-c\"># 换行纪律：仓库声明为准，本机关闭自动转换防污染</span>\n<span class=\"tk-k\">git</span> config --global core.autocrlf <span class=\"tk-s\">false</span>\n\n<span class=\"tk-c\"># 默认分支名与拉取策略</span>\n<span class=\"tk-k\">git</span> config --global init.defaultBranch main\n<span class=\"tk-k\">git</span> config --global pull.rebase <span class=\"tk-s\">true</span>", raw: "# 身份标识用真实姓名与常用邮箱，提交归属靠它\ngit config --global user.name \"你的名字\"\ngit config --global user.email \"you@example.com\"\n\n# 换行纪律：仓库声明为准，本机关闭自动转换防污染\ngit config --global core.autocrlf false\n\n# 默认分支名与拉取策略\ngit config --global init.defaultBranch main\ngit config --global pull.rebase true" },
    { kind: 'h4', text: "镜像加速配置" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "网络环境下直连官方源经常超时，统一配置镜像后再装依赖：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># npm 镜像：查看与设置</span>\n<span class=\"tk-k\">npm</span> config get registry\n<span class=\"tk-k\">npm</span> config set registry https://registry.npmmirror.com\n\n<span class=\"tk-c\"># Maven 镜像：在 settings.xml 的 mirrors 节点配置</span>\n<span class=\"tk-c\"># 下载慢先查镜像是否生效，而不是反复重试</span>\n<span class=\"tk-k\">mvn</span> help:effective-settings", raw: "# npm 镜像：查看与设置\nnpm config get registry\nnpm config set registry https://registry.npmmirror.com\n\n# Maven 镜像：在 settings.xml 的 mirrors 节点配置\n# 下载慢先查镜像是否生效，而不是反复重试\nmvn help:effective-settings" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "装依赖统一用锁文件命令：" }, { t: 'code', v: "npm ci" }, { t: 'text', v: " 按 " }, { t: 'code', v: "package-lock.json" }, { t: 'text', v: " 精确安装，禁止在有锁文件的项目里随手 " }, { t: 'code', v: "npm install" }, { t: 'text', v: " 改动版本。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "IDE 插件集与格式化" },
    { kind: 'h4', text: "推荐插件组合" },
    { kind: 'table',
      head: [[{ t: 'text', v: "场景" }], [{ t: 'text', v: "插件方向" }], [{ t: 'text', v: "作用" }]],
      rows: [
        [[{ t: 'text', v: "前端项目" }], [{ t: 'text', v: "ESLint / Prettier 类" }], [{ t: 'text', v: "静态检查与格式化" }]],
        [[{ t: 'text', v: "Java 项目" }], [{ t: 'text', v: "Lombok / SonarLint 类" }], [{ t: 'text', v: "样板消除与静态扫描" }]],
        [[{ t: 'text', v: "通用" }], [{ t: 'text', v: "Git 图形化 / 编辑器配置类" }], [{ t: 'text', v: "可视化提交与跨编辑器统一缩进" }]],
      ] },
    { kind: 'h4', text: "保存即格式化" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "格式化必须自动化：编辑器开启「保存时格式化」，项目提供统一的格式化配置（如 " }, { t: 'code', v: ".editorconfig" }, { t: 'text', v: " 与格式化规则文件）。评审里出现缩进与引号意见，视为格式化配置没接好，先修配置再修代码。" }],
    ] },
    { kind: 'details', title: "环境自检脚本：一键核对基线是否就位", blocks: [
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 任一行输出缺失即环境不达标，回到对应章节重装</span>\n<span class=\"tk-k\">java</span> -version\n<span class=\"tk-k\">node</span> -v\n<span class=\"tk-k\">npm</span> -v\n<span class=\"tk-k\">git</span> --version\n<span class=\"tk-k\">npm</span> config get registry\n\n<span class=\"tk-c\"># 项目级自检：进仓库目录后</span>\n<span class=\"tk-k\">cat</span> .nvmrc\n<span class=\"tk-k\">npm</span> ci --dry-run", raw: "# 任一行输出缺失即环境不达标，回到对应章节重装\njava -version\nnode -v\nnpm -v\ngit --version\nnpm config get registry\n\n# 项目级自检：进仓库目录后\ncat .nvmrc\nnpm ci --dry-run" },
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障与实操避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'code', v: "java" }, { t: 'text', v: " 与 " }, { t: 'code', v: "javac" }, { t: 'text', v: " 版本不一致" }], [{ t: 'text', v: "环境里混着多个 JDK" }], [{ t: 'text', v: "统一 " }, { t: 'code', v: "JAVA_HOME" }, { t: 'text', v: "，清理 PATH 中的旧路径" }]],
        [[{ t: 'code', v: "npm ci" }, { t: 'text', v: " 报锁文件不同步" }], [{ t: 'text', v: "有人手改过依赖" }], [{ t: 'text', v: "还原锁文件，依赖变更走正常 " }, { t: 'code', v: "install" }, { t: 'text', v: " 再提交锁文件" }]],
        [[{ t: 'text', v: "依赖下载龟速" }], [{ t: 'text', v: "镜像未生效" }], [{ t: 'text', v: "检查 " }, { t: 'code', v: "npm config get registry" }, { t: 'text', v: " 与实际构建工具配置" }]],
        [[{ t: 'text', v: "换行符大面积变更" }], [{ t: 'text', v: "自动转换开着" }], [{ t: 'code', v: "core.autocrlf" }, { t: 'text', v: " 关闭，仓库用 " }, { t: 'code', v: ".gitattributes" }, { t: 'text', v: " 声明" }]],
        [[{ t: 'text', v: "同事机器格式不一致" }], [{ t: 'text', v: "各自编辑器配置" }], [{ t: 'text', v: "格式化配置入仓，保存即格式化全员统一" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "JDK" }], [{ t: 'code', v: "java -version" }, { t: 'text', v: " 与 " }, { t: 'code', v: "JAVA_HOME" }, { t: 'text', v: " 输出一致，编译命令可用" }]],
        [[{ t: 'text', v: "Node" }], [{ t: 'text', v: "版本与项目 " }, { t: 'code', v: ".nvmrc" }, { t: 'text', v: " 一致，切换命令可用" }]],
        [[{ t: 'text', v: "Git" }], [{ t: 'text', v: "身份、换行、拉取策略配置齐全，" }, { t: 'code', v: "git config -l" }, { t: 'text', v: " 可查" }]],
        [[{ t: 'text', v: "镜像" }], [{ t: 'text', v: "依赖全量安装在合理时间内完成" }]],
        [[{ t: 'text', v: "IDE" }], [{ t: 'text', v: "保存自动格式化生效，插件按清单就位" }]],
        [[{ t: 'text', v: "自检" }], [{ t: 'text', v: "环境自检脚本逐项通过" }]],
      ] },
    ],
  },
  {
    slug: 'first-week',
    index: '15',
    category: 'handbook',
    title: "第一周新人生存与破冰手册",
    summary: "首周路径：克隆仓库、配置环境、启动调试到首个特性分支与合并请求。",
    minutes: 8,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "项目初始化四步" },
      { id: 'sec-3', text: "首次调试与会话建立" },
      { id: 'sec-4', text: "首个特性分支与首次修改" },
      { id: 'sec-5', text: "首个合并请求与避坑" },
      { id: 'sec-6', text: "首周验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "第一周的目标不是写出多少代码，而是跑通一次完整的工程循环：从克隆仓库到发起合并请求。这条路径走通了，之后每一次开发都是它的重复与扩展；走不通，后面的每个任务都会在同一个地方卡住。本篇按天拆解这条路径。" }],
    ] },
    { kind: 'h4', text: "提问的姿势" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "卡住超过一小时就该提问，但提问前先完成三步自查：重读报错信息全文、搜关键词、查本篇与《高频故障排查手册》。提问时给出现象、已尝试的步骤与完整报错——「报错了」三个字得不到任何帮助。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "项目初始化四步" },
    { kind: 'h4', text: "第一步：克隆与结构速览" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 克隆到固定工作目录，路径不含空格与中文</span>\n<span class=\"tk-k\">git</span> clone https://github.com/yfy-club/example-project.git\n<span class=\"tk-k\">cd</span> example-project\n\n<span class=\"tk-c\"># 先读三份文件再动手：说明、贡献指引与目录结构</span>\n<span class=\"tk-k\">cat</span> README.md", raw: "# 克隆到固定工作目录，路径不含空格与中文\ngit clone https://github.com/yfy-club/example-project.git\ncd example-project\n\n# 先读三份文件再动手：说明、贡献指引与目录结构\ncat README.md" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "速览目录结构时只回答三个问题：代码在哪、测试在哪、构建命令在哪。其余细节用到再查。" }],
    ] },
    { kind: 'h4', text: "第二步：依赖安装" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 按锁文件精确安装，拒绝随手 install</span>\n<span class=\"tk-k\">npm</span> ci\n\n<span class=\"tk-c\"># 安装失败先看报错首行：缺系统依赖、镜像超时、版本不符是三大类</span>", raw: "# 按锁文件精确安装，拒绝随手 install\nnpm ci\n\n# 安装失败先看报错首行：缺系统依赖、镜像超时、版本不符是三大类" },
    { kind: 'h4', text: "第三步：环境变量本地配置" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "仓库里的示例环境文件复制为本地环境文件，本地文件永远不进版本库：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 从示例复制出本地配置，再按说明逐项填写</span>\n<span class=\"tk-k\">cp</span> .env.example .env.local", raw: "# 从示例复制出本地配置，再按说明逐项填写\ncp .env.example .env.local" },
    { kind: 'code', lang: 'json', html: "{\n  \"<span class=\"tk-k\">说明</span>\": <span class=\"tk-s\">\"示例环境文件的典型结构，本地填写真实值\"</span>,\n  \"<span class=\"tk-k\">API_BASE</span>\": <span class=\"tk-s\">\"http://localhost:8080\"</span>,\n  \"<span class=\"tk-k\">DEBUG</span>\": <span class=\"tk-s\">\"true\"</span>,\n  \"<span class=\"tk-k\">TOKEN</span>\": <span class=\"tk-s\">\"向师傅申请开发令牌，严禁提交任何真实密钥\"</span>\n}", raw: "{\n  \"说明\": \"示例环境文件的典型结构，本地填写真实值\",\n  \"API_BASE\": \"http://localhost:8080\",\n  \"DEBUG\": \"true\",\n  \"TOKEN\": \"向师傅申请开发令牌，严禁提交任何真实密钥\"\n}" },
    { kind: 'h4', text: "第四步：首次启动与自检" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 启动开发服务器，控制台无红色报错才算成功</span>\n<span class=\"tk-k\">npm</span> run dev\n\n<span class=\"tk-c\"># 自检三件套：页面能打开、控制台无报错、健康检查接口通</span>", raw: "# 启动开发服务器，控制台无红色报错才算成功\nnpm run dev\n\n# 自检三件套：页面能打开、控制台无报错、健康检查接口通" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "启动失败按顺序排查：端口被占（换端口或结束占用进程）、依赖缺漏（重装）、环境文件缺项（对照示例补齐）。排查命令与完整清单见《高频故障排查手册》。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "首次调试与会话建立" },
    { kind: 'h4', text: "把开发服务器跑在调试模式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不要只会 " }, { t: 'code', v: "console.log" }, { t: 'text', v: "：浏览器开发者工具里打断点、看网络面板的请求与响应、看错误面板的完整堆栈。后端项目在 IDE 里以调试模式启动，在关键方法入口打断点，观察入参的实际值——第一次「看见代码怎么跑」的时刻，比背十条语法都有用。" }],
    ] },
    { kind: 'h4', text: "熟悉门禁命令" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "进项目第一天就把门禁命令全部跑一遍，建立「绿了才提交」的肌肉记忆：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 类型检查、测试、构建，三条命令全绿是提交的前提</span>\n<span class=\"tk-k\">npm</span> run typecheck\n<span class=\"tk-k\">npm</span> test\n<span class=\"tk-k\">npm</span> run build", raw: "# 类型检查、测试、构建，三条命令全绿是提交的前提\nnpm run typecheck\nnpm test\nnpm run build" },
    { kind: 'h3', id: 'sec-4', text: "首个特性分支与首次修改" },
    { kind: 'h4', text: "按规范检出分支" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 同步主干后检出特性分支，命名遵循分支规范</span>\n<span class=\"tk-k\">git</span> checkout main\n<span class=\"tk-k\">git</span> pull --rebase origin main\n<span class=\"tk-k\">git</span> checkout -b docs/first-contrib", raw: "# 同步主干后检出特性分支，命名遵循分支规范\ngit checkout main\ngit pull --rebase origin main\ngit checkout -b docs/first-contrib" },
    { kind: 'h4', text: "认领微型任务" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "首个任务从标注了「新人友好」的微型任务认领：改一处文案、补一个测试用例、修一个样式小缺陷。任务虽小，流程不减——分支、提交、门禁、评审一步不少。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 原子提交：一个提交只做一件事，信息符合规范</span>\n<span class=\"tk-k\">git</span> add docs/guide.md\n<span class=\"tk-k\">git</span> commit -m <span class=\"tk-s\">\"docs(guide): 补充本地启动步骤说明\"</span>\n\n<span class=\"tk-c\"># 推送前先跑门禁，红项就地修复</span>\n<span class=\"tk-k\">npm</span> run typecheck &amp;&amp; <span class=\"tk-k\">npm</span> test", raw: "# 原子提交：一个提交只做一件事，信息符合规范\ngit add docs/guide.md\ngit commit -m \"docs(guide): 补充本地启动步骤说明\"\n\n# 推送前先跑门禁，红项就地修复\nnpm run typecheck && npm test" },
    { kind: 'h3', id: 'sec-5', text: "首个合并请求与避坑" },
    { kind: 'h4', text: "发起合并请求" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "推送分支后发起合并请求，描述按三要素填写：改动内容、改动原因、验证方式。第一个请求主动请高年级成员评审，把评审意见当成免费的一对一教学。" }],
    ] },
    { kind: 'h4', text: "新人高频翻车清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "症状" }], [{ t: 'text', v: "根因" }], [{ t: 'text', v: "修复方案" }]],
      rows: [
        [[{ t: 'text', v: "把 " }, { t: 'code', v: ".env.local" }, { t: 'text', v: " 提交进仓库" }], [{ t: 'text', v: "不了解忽略规则" }], [{ t: 'text', v: "检查忽略文件清单，已入库立即找师傅处理" }]],
        [[{ t: 'text', v: "直接在 " }, { t: 'code', v: "main" }, { t: 'text', v: " 上改了代码" }], [{ t: 'text', v: "分支习惯未建立" }], [{ t: 'text', v: "立即检出分支保存改动，主干恢复原状" }]],
        [[{ t: 'text', v: "提交里混着格式化噪音" }], [{ t: 'text', v: "保存格式化没对齐项目配置" }], [{ t: 'text', v: "按《开发环境与工具链配置指南》接好配置" }]],
        [[{ t: 'text', v: "门禁红了照样推" }], [{ t: 'text', v: "没跑门禁" }], [{ t: 'text', v: "推送前本地全绿，推送后盯流水线结果" }]],
        [[{ t: 'text', v: "报错截图只拍一行" }], [{ t: 'text', v: "提问姿势不对" }], [{ t: 'text', v: "给完整报错、复现步骤与已尝试方案" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "首周验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "环境就绪" }], [{ t: 'text', v: "项目本地启动成功，门禁命令全绿" }]],
        [[{ t: 'text', v: "调试能力" }], [{ t: 'text', v: "能独立打断点并讲清一次请求的完整路径" }]],
        [[{ t: 'text', v: "分支纪律" }], [{ t: 'text', v: "首个改动走特性分支，命名符合规范" }]],
        [[{ t: 'text', v: "合并请求" }], [{ t: 'text', v: "首个请求三要素齐备，评审意见全部销项" }]],
        [[{ t: 'text', v: "求助效率" }], [{ t: 'text', v: "至少完成一次符合姿势的提问并获得解答" }]],
      ] },
    ],
  },
  {
    slug: 'troubleshooting',
    index: '16',
    category: 'handbook',
    title: "高频故障排查手册",
    summary: "排障手册：跨域与代理冲突、Git 冲突救砖、JVM 内存溢出与连接池耗尽。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "跨域与网络代理" },
      { id: 'sec-3', text: "Git 冲突与误操作救砖" },
      { id: 'sec-4', text: "JVM 内存溢出排查" },
      { id: 'sec-5', text: "高频故障速查表" },
      { id: 'sec-6', text: "实操验收清单" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "排障能力是工程师的生存技能，而排障的差距不在工具多少，在于有没有方法论。本篇沉淀社团项目里复发率最高的四类故障——跨域、Git 冲突、内存溢出、连接池耗尽，每类都给出机理、排查命令与修复方案。" }],
    ] },
    { kind: 'h4', text: "排障四步法" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "所有故障按同一条路径推进：" }, { t: 'strong', v: "固定现象" }, { t: 'text', v: "（完整报错、复现步骤、发生时间）→ " }, { t: 'strong', v: "提出假设" }, { t: 'text', v: "（最近改了什么、哪一层最可能）→ " }, { t: 'strong', v: "最小验证" }, { t: 'text', v: "（一次只改一个变量）→ " }, { t: 'strong', v: "修复并记录" }, { t: 'text', v: "（修完写进本篇）。最忌在没看清报错全文的情况下乱改一气。" }],
    ] },
    { kind: 'h4', text: "先定界再定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "任何报错先回答「断在哪一层」：浏览器控制台、网关、应用、数据库。网络面板看请求是否发出、响应码是什么；应用日志看堆栈；数据库看慢查询与连接。定界错误会让后面所有排查南辕北辙。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "跨域与网络代理" },
    { kind: 'h4', text: "CORS 预检的机理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "浏览器同源策略下，跨域的「非简单请求」（自定义头、JSON 体、PUT/DELETE 等）会先发一个 " }, { t: 'code', v: "OPTIONS" }, { t: 'text', v: " 预检请求询问服务器是否允许。预检不过，真实请求根本不会发出——控制台报的是 " }, { t: 'code', v: "CORS error" }, { t: 'text', v: "，而服务端日志里可能一条请求都没有，这是新人最常见的困惑。" }],
    ] },
    { kind: 'h4', text: "反代与跨域中间件只能留一个" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "典型事故：Nginx 反向代理已经加了一组跨域响应头，后端应用的跨域中间件又加一组，浏览器看到重复的 " }, { t: 'code', v: "Access-Control-Allow-Origin" }, { t: 'text', v: " 直接拒绝——" }, { t: 'strong', v: "两层同时配等于必坏" }, { t: 'text', v: "。纪律：生产走反向代理同源化，跨域头只在代理层配；后端中间件只在本地联调直连时启用。" }],
    ] },
    { kind: 'details', title: "Nginx 反向代理与跨域头完整配置示例", blocks: [
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># /etc/nginx/conf.d/app.conf</span>\n<span class=\"tk-k\">server</span> {\n    <span class=\"tk-k\">listen</span> <span class=\"tk-s\">80</span>;\n    <span class=\"tk-k\">server_name</span> app.example.com;\n\n    <span class=\"tk-c\"># 前端静态资源</span>\n    <span class=\"tk-k\">location</span> / {\n        <span class=\"tk-k\">root</span> /opt/app/dist;\n        <span class=\"tk-k\">try_files</span> $uri $uri/ /index.html;\n    }\n\n    <span class=\"tk-c\"># 接口反向代理：同源化后前端不再触发跨域</span>\n    <span class=\"tk-k\">location</span> /api/ {\n        <span class=\"tk-k\">proxy_pass</span> http://127.0.0.1:8080;\n        <span class=\"tk-k\">proxy_set_header</span> Host $host;\n        <span class=\"tk-k\">proxy_set_header</span> X-Real-IP $remote_addr;\n        <span class=\"tk-k\">proxy_set_header</span> X-Forwarded-For $proxy_add_x_forwarded_for;\n\n        <span class=\"tk-c\"># 跨域头只在这里出现一次；若后端中间件也在加，必须关掉一处</span>\n        <span class=\"tk-k\">add_header</span> Access-Control-Allow-Origin $http_origin always;\n        <span class=\"tk-k\">add_header</span> Access-Control-Allow-Methods <span class=\"tk-s\">\"GET,POST,PUT,DELETE,OPTIONS\"</span> always;\n        <span class=\"tk-k\">add_header</span> Access-Control-Allow-Headers <span class=\"tk-s\">\"Authorization,Content-Type\"</span> always;\n        <span class=\"tk-k\">add_header</span> Access-Control-Allow-Credentials <span class=\"tk-s\">\"true\"</span> always;\n\n        <span class=\"tk-c\"># 预检请求在此终结，不透传给后端</span>\n        <span class=\"tk-k\">if</span> ($request_method = OPTIONS) {\n            <span class=\"tk-k\">return</span> <span class=\"tk-s\">204</span>;\n        }\n    }\n}", raw: "# /etc/nginx/conf.d/app.conf\nserver {\n    listen 80;\n    server_name app.example.com;\n\n    # 前端静态资源\n    location / {\n        root /opt/app/dist;\n        try_files $uri $uri/ /index.html;\n    }\n\n    # 接口反向代理：同源化后前端不再触发跨域\n    location /api/ {\n        proxy_pass http://127.0.0.1:8080;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\n        # 跨域头只在这里出现一次；若后端中间件也在加，必须关掉一处\n        add_header Access-Control-Allow-Origin $http_origin always;\n        add_header Access-Control-Allow-Methods \"GET,POST,PUT,DELETE,OPTIONS\" always;\n        add_header Access-Control-Allow-Headers \"Authorization,Content-Type\" always;\n        add_header Access-Control-Allow-Credentials \"true\" always;\n\n        # 预检请求在此终结，不透传给后端\n        if ($request_method = OPTIONS) {\n            return 204;\n        }\n    }\n}" },
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 验证：预检请求必须返回 204 且响应头只有一份</span>\n<span class=\"tk-k\">curl</span> -i -X OPTIONS https://app.example.com/api/users <span class=\"tk-s\">\\</span>\n  -H <span class=\"tk-s\">\"Origin: https://web.example.com\"</span> <span class=\"tk-s\">\\</span>\n  -H <span class=\"tk-s\">\"Access-Control-Request-Method: POST\"</span>", raw: "# 验证：预检请求必须返回 204 且响应头只有一份\ncurl -i -X OPTIONS https://app.example.com/api/users \\\n  -H \"Origin: https://web.example.com\" \\\n  -H \"Access-Control-Request-Method: POST\"" },
    { kind: 'h3', id: 'sec-3', text: "Git 冲突与误操作救砖" },
    { kind: 'h4', text: "合并冲突与变基冲突的解决步骤" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "两类冲突的解法是同一条：打开冲突文件，在每个冲突标记块里决定保留谁，删掉全部冲突标记，再分别走对应的收尾命令。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 合并冲突：解决后标记完成并收尾</span>\n<span class=\"tk-k\">git</span> status                 <span class=\"tk-c\"># 先看哪些文件冲突</span>\n<span class=\"tk-c\"># 逐文件编辑解决冲突标记后</span>\n<span class=\"tk-k\">git</span> add &lt;冲突文件&gt;\n<span class=\"tk-k\">git</span> commit                 <span class=\"tk-c\"># 生成合并提交</span>\n\n<span class=\"tk-c\"># 变基冲突：解决后继续，注意是 rebase --continue</span>\n<span class=\"tk-k\">git</span> add &lt;冲突文件&gt;\n<span class=\"tk-k\">git</span> rebase --continue\n\n<span class=\"tk-c\"># 变基过程中局面失控：随时可以整体放弃，回到变基前</span>\n<span class=\"tk-k\">git</span> rebase --abort", raw: "# 合并冲突：解决后标记完成并收尾\ngit status                 # 先看哪些文件冲突\n# 逐文件编辑解决冲突标记后\ngit add <冲突文件>\ngit commit                 # 生成合并提交\n\n# 变基冲突：解决后继续，注意是 rebase --continue\ngit add <冲突文件>\ngit rebase --continue\n\n# 变基过程中局面失控：随时可以整体放弃，回到变基前\ngit rebase --abort" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "纪律：" }, { t: 'strong', v: "一次只解决一个文件，解决完立刻验证编译" }, { t: 'text', v: "。连环冲突时边改边错最致命。" }],
    ] },
    { kind: 'h4', text: "误操作救砖：引用日志是后悔药" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Git 的引用日志记录了本地分支的每一次移动，最近九十天内的「丢」几乎都能找回来：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 误重置、误删分支后：先找到目标提交的哈希</span>\n<span class=\"tk-k\">git</span> reflog\n\n<span class=\"tk-c\"># 找回误删分支：从引用日志里的提交重建分支</span>\n<span class=\"tk-k\">git</span> branch feat/rescued &lt;提交哈希&gt;\n\n<span class=\"tk-c\"># 误提交想撤回且未推送：软重置保留改动</span>\n<span class=\"tk-k\">git</span> reset --soft HEAD~1\n\n<span class=\"tk-c\"># 已推送的提交需要撤销：用反向提交，不改写共享历史</span>\n<span class=\"tk-k\">git</span> revert &lt;提交哈希&gt;", raw: "# 误重置、误删分支后：先找到目标提交的哈希\ngit reflog\n\n# 找回误删分支：从引用日志里的提交重建分支\ngit branch feat/rescued <提交哈希>\n\n# 误提交想撤回且未推送：软重置保留改动\ngit reset --soft HEAD~1\n\n# 已推送的提交需要撤销：用反向提交，不改写共享历史\ngit revert <提交哈希>" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "铁律：共享分支上不改写历史，一律用反向提交；本地私有提交才允许重置与变基。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "JVM 内存溢出排查" },
    { kind: 'h4', text: "先分清是哪种溢出" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "OutOfMemoryError" }, { t: 'text', v: " 不是单一故障：堆溢出是大对象或泄漏，元空间溢出是类加载失控，栈溢出是递归过深。报错全文的第一行决定排查方向，别看都不看就加内存参数——那只是把爆炸推迟。" }],
    ] },
    { kind: 'h4', text: "三板斧：线程、堆转储、分析" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-c\"># 第一步：找到目标进程</span>\n<span class=\"tk-k\">jps</span> -l\n\n<span class=\"tk-c\"># 线程级快照：定位死锁与阻塞，连打三次对比可发现线程不动</span>\n<span class=\"tk-k\">jstack</span> &lt;进程号&gt; &gt; thread-1.txt\n\n<span class=\"tk-c\"># 堆转储：内存泄漏的最终证据</span>\n<span class=\"tk-k\">jmap</span> -dump:format=b,file=heap.hprof &lt;进程号&gt;\n\n<span class=\"tk-c\"># 预防性配置：溢出瞬间自动生成转储，事故现场不丢</span>\n<span class=\"tk-c\"># -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/opt/app/dump</span>", raw: "# 第一步：找到目标进程\njps -l\n\n# 线程级快照：定位死锁与阻塞，连打三次对比可发现线程不动\njstack <进程号> > thread-1.txt\n\n# 堆转储：内存泄漏的最终证据\njmap -dump:format=b,file=heap.hprof <进程号>\n\n# 预防性配置：溢出瞬间自动生成转储，事故现场不丢\n# -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/opt/app/dump" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "转储文件用内存分析工具打开，看支配树里哪个对象占了最大份额、引用链通向哪里——泄漏的十有八九是只增不减的集合（静态缓存、监听器列表、未关闭的资源）。" }],
    ] },
    { kind: 'h4', text: "连接池耗尽定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "「获取连接超时」的根因几乎不在线程等待本身，而在连接被借走后没归还：事务里夹着远程调用、连接借出后异常路径未释放、慢查询把连接占死。排查路径：连接池监控看活跃数曲线 → 慢查询日志找长占连接者 → 代码里查事务内的外部调用。临时调大连接数上限只是止痛，不归还连接，多大池子都会被抽干。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "高频故障速查表" },
    { kind: 'table',
      head: [[{ t: 'text', v: "现象" }], [{ t: 'text', v: "第一反应" }], [{ t: 'text', v: "本篇章节" }]],
      rows: [
        [[{ t: 'text', v: "浏览器跨域报错、后端无日志" }], [{ t: 'text', v: "查预检是否被正确响应" }], [{ t: 'text', v: "跨域与网络代理" }]],
        [[{ t: 'text', v: "跨域头明明配了还是报错" }], [{ t: 'text', v: "查代理与中间件是否双重配置" }], [{ t: 'text', v: "跨域与网络代理" }]],
        [[{ t: 'text', v: "变基到一半冲突不断" }], [{ t: 'code', v: "rebase --abort" }, { t: 'text', v: " 冷静重来" }], [{ t: 'text', v: "Git 冲突与误操作救砖" }]],
        [[{ t: 'text', v: "分支删了提交丢了" }], [{ t: 'code', v: "reflog" }, { t: 'text', v: " 找回，九十天内有救" }], [{ t: 'text', v: "Git 冲突与误操作救砖" }]],
        [[{ t: 'text', v: "服务内存一路向北" }], [{ t: 'text', v: "堆转储加支配树分析" }], [{ t: 'text', v: "JVM 内存溢出排查" }]],
        [[{ t: 'text', v: "获取连接超时" }], [{ t: 'text', v: "查连接借出后的归还路径" }], [{ t: 'text', v: "连接池耗尽定位" }]],
      ] },
    { kind: 'h3', id: 'sec-6', text: "实操验收清单" },
    { kind: 'table',
      head: [[{ t: 'text', v: "项目" }], [{ t: 'text', v: "验收标准" }]],
      rows: [
        [[{ t: 'text', v: "方法论" }], [{ t: 'text', v: "能按四步法复述一次真实排障的完整过程" }]],
        [[{ t: 'text', v: "跨域" }], [{ t: 'text', v: "能解释预检机理，并指出代理与中间件二选一的原因" }]],
        [[{ t: 'text', v: "Git 救援" }], [{ t: 'text', v: "能独立用引用日志找回误删分支，用反向提交撤销已推送变更" }]],
        [[{ t: 'text', v: "内存排查" }], [{ t: 'text', v: "能独立产出线程快照与堆转储，并用工具定位一个模拟泄漏" }]],
        [[{ t: 'text', v: "沉淀习惯" }], [{ t: 'text', v: "新踩的坑在四十八小时内补进本篇" }]],
      ] },
    ],
  },
  {
    slug: 'project-case-study',
    index: '17',
    category: 'handbook',
    title: "社团自研项目架构拆解",
    summary: "案例拆解：智学伴多模型流式会话与矩阵计算器分数域无误差算法。",
    minutes: 12,
    headings: [
      { id: 'sec-1', text: "核心背景与技术定位" },
      { id: 'sec-2', text: "智学伴案例：SSE 流式响应" },
      { id: 'sec-3', text: "智学伴案例：故障转移池与会话调度" },
      { id: 'sec-4', text: "矩阵计算器案例：分数域无截断误差" },
      { id: 'sec-5', text: "矩阵计算器案例：Web Worker 异步计算" },
      { id: 'sec-6', text: "案例复用清单与避坑" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "核心背景与技术定位" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "社团自研项目是最好的教材：它们诞生于真实需求，翻过真实的坑，代码就在仓库里随时可查。本篇拆解两个代表性项目的关键架构决策——智学伴的多模型流式会话与矩阵计算器的无误差算法，展示「需求如何长成架构」。" }],
    ] },
    { kind: 'h4', text: "读案例的方法" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每读一个决策问三个问题：它解决什么问题、它拒绝了什么替代方案、它在什么规模下会失效。能回答第三问才算读懂——任何架构都有失效边界，社团项目也不例外。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "智学伴案例：SSE 流式响应" },
    { kind: 'h4', text: "为什么是流式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "大模型生成一段回答要数秒到数十秒，整段返回意味着用户干等。流式响应让回答逐字上屏：首字延迟从数十秒压到一两秒，体验从「提交表单」变成「对话」。智学伴选用 SSE（Server-Sent Events）：基于 HTTP 的单向推流，浏览器原生支持，断线自动重连，比自建 WebSocket 简单一个量级。" }],
    ] },
    { kind: 'h4', text: "前端流式解析的正确姿势" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "SSE 的数据帧可能粘包、截断，解析器必须按协议逐帧切分，而不是把到达的每个字节块当成一条完整消息：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 正例：以空行为帧边界，累积不完整片段等待下次到达</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">parseSseBuffer</span>(buffer: <span class=\"tk-k\">string</span>): { events: <span class=\"tk-k\">string</span>[]; rest: <span class=\"tk-k\">string</span> } {\n  <span class=\"tk-k\">if</span> (!buffer) {\n    <span class=\"tk-k\">return</span> { events: [], rest: <span class=\"tk-s\">''</span> } <span class=\"tk-c\">// 空输入防御</span>\n  }\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">events</span>: <span class=\"tk-k\">string</span>[] = []\n  <span class=\"tk-k\">let</span> rest = buffer\n  <span class=\"tk-k\">let</span> sep = rest.<span class=\"tk-k\">indexOf</span>(<span class=\"tk-s\">'\\n\\n'</span>)\n  <span class=\"tk-k\">while</span> (sep !== -<span class=\"tk-s\">1</span>) {\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">frame</span> = rest.<span class=\"tk-k\">slice</span>(<span class=\"tk-s\">0</span>, sep)\n    rest = rest.<span class=\"tk-k\">slice</span>(sep + <span class=\"tk-s\">2</span>)\n    <span class=\"tk-c\">// 只取 data 字段，忽略事件类型与心跳注释行</span>\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">data</span> = frame\n      .<span class=\"tk-k\">split</span>(<span class=\"tk-s\">'\\n'</span>)\n      .<span class=\"tk-k\">filter</span>((line) =&gt; line.<span class=\"tk-k\">startsWith</span>(<span class=\"tk-s\">'data:'</span>))\n      .<span class=\"tk-k\">map</span>((line) =&gt; line.<span class=\"tk-k\">slice</span>(<span class=\"tk-s\">5</span>).<span class=\"tk-k\">trim</span>())\n      .<span class=\"tk-k\">join</span>(<span class=\"tk-s\">''</span>)\n    <span class=\"tk-k\">if</span> (data &amp;&amp; data !== <span class=\"tk-s\">'[DONE]'</span>) {\n      events.<span class=\"tk-k\">push</span>(data)\n    }\n    sep = rest.<span class=\"tk-k\">indexOf</span>(<span class=\"tk-s\">'\\n\\n'</span>)\n  }\n  <span class=\"tk-k\">return</span> { events, rest } <span class=\"tk-c\">// rest 交还调用方继续累积</span>\n}", raw: "// 正例：以空行为帧边界，累积不完整片段等待下次到达\nexport function parseSseBuffer(buffer: string): { events: string[]; rest: string } {\n  if (!buffer) {\n    return { events: [], rest: '' } // 空输入防御\n  }\n  const events: string[] = []\n  let rest = buffer\n  let sep = rest.indexOf('\\n\\n')\n  while (sep !== -1) {\n    const frame = rest.slice(0, sep)\n    rest = rest.slice(sep + 2)\n    // 只取 data 字段，忽略事件类型与心跳注释行\n    const data = frame\n      .split('\\n')\n      .filter((line) => line.startsWith('data:'))\n      .map((line) => line.slice(5).trim())\n      .join('')\n    if (data && data !== '[DONE]') {\n      events.push(data)\n    }\n    sep = rest.indexOf('\\n\\n')\n  }\n  return { events, rest } // rest 交还调用方继续累积\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "反例是「收到多少渲染多少」：帧被截断时会把半条 JSON 当完整消息解析，界面上闪过乱码；心跳行不滤掉会渲染出空白气泡。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "智学伴案例：故障转移池与会话调度" },
    { kind: 'h4', text: "多模型故障转移池" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "单个模型服务会限流、会超时、会挂。智学伴在服务端维护一个模型池，按「健康度 + 优先级」排序，请求依序尝试：主模型失败且错误属于可转移类别（超时、限流、服务不可用）时自动切下一个，全部失败才向用户返回明确错误。" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 故障转移的核心循环：区分「可转移错误」与「业务错误」</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">async</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">failover</span>&lt;<span class=\"tk-k\">T</span>&gt;(\n  pool: <span class=\"tk-k\">readonly</span> <span class=\"tk-k\">ModelClient</span>[],\n  <span class=\"tk-k\">call</span>: (client: <span class=\"tk-k\">ModelClient</span>) =&gt; <span class=\"tk-k\">Promise</span>&lt;<span class=\"tk-k\">T</span>&gt;,\n): <span class=\"tk-k\">Promise</span>&lt;<span class=\"tk-k\">T</span>&gt; {\n  <span class=\"tk-k\">if</span> (pool.length === <span class=\"tk-s\">0</span>) {\n    <span class=\"tk-k\">throw</span> new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'模型池为空，无法提供服务'</span>)\n  }\n  <span class=\"tk-k\">let</span> lastError: <span class=\"tk-k\">unknown</span> = <span class=\"tk-s\">null</span>\n  <span class=\"tk-k\">for</span> (<span class=\"tk-k\">const</span> <span class=\"tk-s\">client</span> of pool) {\n    <span class=\"tk-k\">if</span> (!client.<span class=\"tk-k\">isHealthy</span>()) <span class=\"tk-k\">continue</span> <span class=\"tk-c\">// 熔断中的节点直接跳过</span>\n    <span class=\"tk-k\">try</span> {\n      <span class=\"tk-k\">return</span> <span class=\"tk-k\">await</span> <span class=\"tk-k\">call</span>(client)\n    } <span class=\"tk-k\">catch</span> (err) {\n      lastError = err\n      <span class=\"tk-k\">if</span> (!<span class=\"tk-k\">isRetryable</span>(err)) <span class=\"tk-k\">throw</span> err <span class=\"tk-c\">// 业务错误不转移，直接上抛</span>\n      client.<span class=\"tk-k\">markFailure</span>()             <span class=\"tk-c\">// 记一次失败，驱动熔断计数</span>\n    }\n  }\n  <span class=\"tk-k\">throw</span> lastError ?? new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'所有模型节点不可用'</span>)\n}", raw: "// 故障转移的核心循环：区分「可转移错误」与「业务错误」\nexport async function failover<T>(\n  pool: readonly ModelClient[],\n  call: (client: ModelClient) => Promise<T>,\n): Promise<T> {\n  if (pool.length === 0) {\n    throw new Error('模型池为空，无法提供服务')\n  }\n  let lastError: unknown = null\n  for (const client of pool) {\n    if (!client.isHealthy()) continue // 熔断中的节点直接跳过\n    try {\n      return await call(client)\n    } catch (err) {\n      lastError = err\n      if (!isRetryable(err)) throw err // 业务错误不转移，直接上抛\n      client.markFailure()             // 记一次失败，驱动熔断计数\n    }\n  }\n  throw lastError ?? new Error('所有模型节点不可用')\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "关键决策：参数校验失败这类业务错误" }, { t: 'strong', v: "不做转移" }, { t: 'text', v: "——换个模型重试只会把同样的错误再犯一遍，还浪费配额。" }],
    ] },
    { kind: 'h4', text: "粘性会话与负载打散" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "多轮对话必须命中同一个会话上下文：调度层按会话标识做粘性路由，同一会话始终落在持有其上下文的节点。但纯粘性会让热点会话压垮个别节点，因此粘性只在会话存活期内生效，会话过期即释放，新会话重新参与均衡——" }, { t: 'strong', v: "粘性保正确，过期保均衡" }, { t: 'text', v: "，两者缺一不可。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "矩阵计算器案例：分数域无截断误差" },
    { kind: 'h4', text: "浮点误差从哪里来" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "浮点数以二进制科学计数法存储，" }, { t: 'code', v: "0.1" }, { t: 'text', v: " 这类十进制小数根本表示不准，矩阵运算里的乘除又会把误差逐级放大：高斯消元做几十次行变换后，理论上为零的元素可能是一串 " }, { t: 'code', v: "1e-16" }, { t: 'text', v: "，判等失败、秩判错、解全歪。教学场景要求结果与手算完全一致，浮点路线从起点就走不通。" }],
    ] },
    { kind: 'h4', text: "有理数分数域方案" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "矩阵计算器用两个大整数构成精确分数：分子分母各是 " }, { t: 'code', v: "bigint" }, { t: 'text', v: "，每次运算后约分到最简。加减乘除全部是整数运算，零误差：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 分数域核心：一切运算落在整数上，约分防溢出</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">gcd</span>(a: <span class=\"tk-k\">bigint</span>, b: <span class=\"tk-k\">bigint</span>): <span class=\"tk-k\">bigint</span> {\n  <span class=\"tk-k\">let</span> x = a &lt; <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span> ? -a : a\n  <span class=\"tk-k\">let</span> y = b &lt; <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span> ? -b : b\n  <span class=\"tk-k\">while</span> (y !== <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span>) {\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">t</span> = x % y\n    x = y\n    y = t\n  }\n  <span class=\"tk-k\">return</span> x\n}\n\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">addFrac</span>(an: <span class=\"tk-k\">bigint</span>, ad: <span class=\"tk-k\">bigint</span>, bn: <span class=\"tk-k\">bigint</span>, bd: <span class=\"tk-k\">bigint</span>) {\n  <span class=\"tk-k\">if</span> (ad === <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span> || bd === <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span>) {\n    <span class=\"tk-k\">throw</span> new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'分母不允许为零'</span>)\n  }\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">n</span> = an * bd + bn * ad\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">d</span> = ad * bd\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">g</span> = <span class=\"tk-k\">gcd</span>(n, d) || <span class=\"tk-s\">1</span><span class=\"tk-k\">n</span> <span class=\"tk-c\">// 结果为零时保持分母为一</span>\n  <span class=\"tk-k\">const</span> <span class=\"tk-s\">sign</span> = d &lt; <span class=\"tk-s\">0</span><span class=\"tk-k\">n</span> ? -<span class=\"tk-s\">1</span><span class=\"tk-k\">n</span> : <span class=\"tk-s\">1</span><span class=\"tk-k\">n</span> <span class=\"tk-c\">// 负号统一收到分子</span>\n  <span class=\"tk-k\">return</span> { n: (n / g) * sign, d: (d / g) * sign }\n}", raw: "// 分数域核心：一切运算落在整数上，约分防溢出\nexport function gcd(a: bigint, b: bigint): bigint {\n  let x = a < 0n ? -a : a\n  let y = b < 0n ? -b : b\n  while (y !== 0n) {\n    const t = x % y\n    x = y\n    y = t\n  }\n  return x\n}\n\nexport function addFrac(an: bigint, ad: bigint, bn: bigint, bd: bigint) {\n  if (ad === 0n || bd === 0n) {\n    throw new Error('分母不允许为零')\n  }\n  const n = an * bd + bn * ad\n  const d = ad * bd\n  const g = gcd(n, d) || 1n // 结果为零时保持分母为一\n  const sign = d < 0n ? -1n : 1n // 负号统一收到分子\n  return { n: (n / g) * sign, d: (d / g) * sign }\n}" },
    { kind: 'h4', text: "Bareiss 算法：整数内消元" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "经典高斯消元在分数域会产生爆炸的中间分子分母。Bareiss 算法利用一个优美的性质：消元过程中的每个中间值都是整数且可整除，全程只用整数乘除、不做约分，复杂度不变而中间量受控。配合分数域输入输出，从算法层消灭了「中间膨胀」问题——这是项目里最值得学习的一次「用数学换工程」的取舍。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "矩阵计算器案例：Web Worker 异步计算" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "大矩阵运算可能耗时数秒，跑在主线程上界面会整体冻结。计算器把内核放进 Web Worker：主线程提交任务即返回，Worker 算完通过消息回传结果，界面全程可交互。" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-c\">// 主线程侧：任务提交与超时兜底</span>\n<span class=\"tk-k\">export</span> <span class=\"tk-k\">function</span> <span class=\"tk-k\">computeInWorker</span>(matrix: <span class=\"tk-k\">unknown</span>, timeoutMs: <span class=\"tk-k\">number</span>): <span class=\"tk-k\">Promise</span>&lt;<span class=\"tk-k\">unknown</span>&gt; {\n  <span class=\"tk-k\">if</span> (!Array.<span class=\"tk-k\">isArray</span>(matrix)) {\n    <span class=\"tk-k\">return</span> <span class=\"tk-k\">Promise</span>.<span class=\"tk-k\">reject</span>(new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'矩阵输入必须是二维数组'</span>))\n  }\n  <span class=\"tk-k\">return</span> new <span class=\"tk-k\">Promise</span>((resolve, reject) =&gt; {\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">worker</span> = new <span class=\"tk-k\">Worker</span>(new <span class=\"tk-k\">URL</span>(<span class=\"tk-s\">'./matrix-worker.ts'</span>, <span class=\"tk-k\">import</span>.meta.url))\n    <span class=\"tk-k\">const</span> <span class=\"tk-s\">timer</span> = <span class=\"tk-k\">setTimeout</span>(() =&gt; {\n      worker.<span class=\"tk-k\">terminate</span>() <span class=\"tk-c\">// 超时强制终止，防失控任务挂死</span>\n      <span class=\"tk-k\">reject</span>(new <span class=\"tk-k\">Error</span>(<span class=\"tk-s\">'计算超时，请减小矩阵规模'</span>))\n    }, timeoutMs)\n    worker.<span class=\"tk-k\">onmessage</span> = (e) =&gt; {\n      <span class=\"tk-k\">clearTimeout</span>(timer)\n      worker.<span class=\"tk-k\">terminate</span>() <span class=\"tk-c\">// 一次性任务，用完即释放</span>\n      <span class=\"tk-k\">resolve</span>(e.data)\n    }\n    worker.<span class=\"tk-k\">onerror</span> = (e) =&gt; {\n      <span class=\"tk-k\">clearTimeout</span>(timer)\n      worker.<span class=\"tk-k\">terminate</span>()\n      <span class=\"tk-k\">reject</span>(new <span class=\"tk-k\">Error</span>(e.message || <span class=\"tk-s\">'计算内核异常'</span>))\n    }\n    worker.<span class=\"tk-k\">postMessage</span>(matrix) <span class=\"tk-c\">// 结构化克隆，无需手动序列化</span>\n  })\n}", raw: "// 主线程侧：任务提交与超时兜底\nexport function computeInWorker(matrix: unknown, timeoutMs: number): Promise<unknown> {\n  if (!Array.isArray(matrix)) {\n    return Promise.reject(new Error('矩阵输入必须是二维数组'))\n  }\n  return new Promise((resolve, reject) => {\n    const worker = new Worker(new URL('./matrix-worker.ts', import.meta.url))\n    const timer = setTimeout(() => {\n      worker.terminate() // 超时强制终止，防失控任务挂死\n      reject(new Error('计算超时，请减小矩阵规模'))\n    }, timeoutMs)\n    worker.onmessage = (e) => {\n      clearTimeout(timer)\n      worker.terminate() // 一次性任务，用完即释放\n      resolve(e.data)\n    }\n    worker.onerror = (e) => {\n      clearTimeout(timer)\n      worker.terminate()\n      reject(new Error(e.message || '计算内核异常'))\n    }\n    worker.postMessage(matrix) // 结构化克隆，无需手动序列化\n  })\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "边界纪律：输入在主线程先校验再投递，Worker 内部不信任任何来自主线程的数据；任务必须有超时，失控的数学计算不允许无限占用资源。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "案例复用清单与避坑" },
    { kind: 'table',
      head: [[{ t: 'text', v: "可复用模式" }], [{ t: 'text', v: "适用场景" }], [{ t: 'text', v: "失效边界" }]],
      rows: [
        [[{ t: 'text', v: "SSE 流式上屏" }], [{ t: 'text', v: "任何长耗时生成类响应" }], [{ t: 'text', v: "代理层缓冲未关闭时流式失效" }]],
        [[{ t: 'text', v: "故障转移池" }], [{ t: 'text', v: "依赖多个同类外部服务" }], [{ t: 'text', v: "全池同源故障时无效，需跨供应商" }]],
        [[{ t: 'text', v: "粘性加过期" }], [{ t: 'text', v: "有会话状态的负载均衡" }], [{ t: 'text', v: "节点宕机时会话上下文丢失需重建" }]],
        [[{ t: 'text', v: "有理数精确域" }], [{ t: 'text', v: "教学与审计类精确计算" }], [{ t: 'text', v: "整数规模极大时性能下降" }]],
        [[{ t: 'text', v: "Worker 卸载" }], [{ t: 'text', v: "主线程长耗时计算" }], [{ t: 'text', v: "消息传递成本高于计算本身时不值" }]],
      ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "验收建议：选一个案例在本地复现其核心链路——跑通一次 SSE 流式解析、手写一遍分数加法与约分、让一个任务在 Worker 里跑完并收到结果。讲得出取舍、复现得了链路，这两个案例才算读完。" }],
    ] },
    ],
  },
]

export const docBySlug = (slug: string): Doc | undefined => DOCS.find((d) => d.slug === slug)

export const docsByCategory = (id: string): readonly Doc[] => DOCS.filter((d) => d.category === id)
