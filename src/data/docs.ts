/* 由 scripts/build-docs.ts 生成，不要手改。改内容改 docs/content-docs.md，再跑 npm run docs:build。 */

/** 行内片段。code 走等宽，strong 走 700。 */
export interface DocInline {
  t: 'text' | 'code' | 'strong'
  v: string
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
    summary: "从基础语法启蒙到综合工程落地的演进过程。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "阶段一：语法启蒙与算法基础" },
      { id: 'sec-2', text: "阶段二：Web 前端基础" },
      { id: 'sec-3', text: "阶段三：技术方向专项分流" },
      { id: 'sec-4', text: "阶段四：系统与数据底层" },
      { id: 'sec-5', text: "阶段五：工程化项目与实战" },
      { id: 'sec-6', text: "学习协作机制" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "阶段一：语法启蒙与算法基础" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从 C 语言建立程序逻辑与内存控制意识，掌握流程控制、指针运算与内存分配机制。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "进阶至 C++ 学习面向对象编程思想与标准模板库，重点训练链表、栈、队列与树等常用数据结构，通过算法训练提升逻辑建模能力。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "阶段二：Web 前端基础" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "学习 HTML5 语义化标签与页面文档结构，掌握 CSS 盒子模型与弹性布局（Flexbox / Grid），实现多端视口适配。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "通过 JavaScript 理解文档对象模型操作、事件驱动机制与异步处理，掌握现代 Web 交互逻辑。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "阶段三：技术方向专项分流" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "依据工程兴趣与技术路径进入专项学习：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "方向" }], [{ t: 'text', v: "核心技术栈" }], [{ t: 'text', v: "目标定位" }]],
      rows: [
        [[{ t: 'text', v: "企业级全栈" }], [{ t: 'text', v: "Java、Spring Boot、Vue 3" }], [{ t: 'text', v: "面向企业级业务系统与微服务架构" }]],
        [[{ t: 'text', v: "智能与数据" }], [{ t: 'text', v: "Python、FastAPI、PyTorch" }], [{ t: 'text', v: "面向数据处理、自动化脚本与智能体工程" }]],
      ] },
    { kind: 'h3', id: 'sec-4', text: "阶段四：系统与数据底层" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "掌握 Linux 基础命令、文件系统权限与网络通信原理，理解服务端程序的运行环境。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "学习 MySQL 关系型数据库，掌握数据表设计、索引原理与常用 SQL 查询语法。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "阶段五：工程化项目与实战" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "接入真实业务项目或学科竞赛，参与需求分析、接口联调与模块交付。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "遵循基础先行、理解驱动原则，在掌握底层原理与框架逻辑的前提下，合理使用编程 Agent 辅助开发，提升编码与调试效率。" }],
    ] },
    { kind: 'h3', id: 'sec-6', text: "学习协作机制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "高年级成员提供日常答疑与代码辅导。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "每个阶段任务完成后进行一对一代码审查，重点评估代码结构、面向对象规范与健壮性。" }],
    ] },
    ],
  },
  {
    slug: 'env-setup',
    index: '02',
    category: 'setup',
    title: "环境与工具",
    summary: "开发工具选型、运行时矩阵与工程配置原理。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "编辑器与集成开发环境" },
      { id: 'sec-2', text: "运行时环境矩阵" },
      { id: 'sec-3', text: "依赖管理与 Lockfile 机制" },
      { id: 'sec-4', text: "跨平台换行符处理" },
      { id: 'sec-5', text: "环境变量与配置隔离" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "编辑器与集成开发环境" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "选择适合自身技术栈的开发工具：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "工具" }], [{ t: 'text', v: "类型" }], [{ t: 'text', v: "适用场景" }]],
      rows: [
        [[{ t: 'text', v: "JetBrains（IDEA / CLion / PyCharm）" }], [{ t: 'text', v: "深度集成 IDE" }], [{ t: 'text', v: "适合 Java、C/C++ 与 Python 的大型项目开发与复杂调试" }]],
        [[{ t: 'text', v: "VS Code" }], [{ t: 'text', v: "插件化通用编辑器" }], [{ t: 'text', v: "适合前端全栈开发与跨语言轻量级脚本编写" }]],
        [[{ t: 'text', v: "Zed" }], [{ t: 'text', v: "高性能原生编辑器" }], [{ t: 'text', v: "适合追求低延迟响应与高效多文件编辑场景" }]],
      ] },
    { kind: 'h3', id: 'sec-2', text: "运行时环境矩阵" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "项目基线环境版本：" }],
    ] },
    { kind: 'table',
      head: [[{ t: 'text', v: "运行时" }], [{ t: 'text', v: "推荐版本" }], [{ t: 'text', v: "说明" }]],
      rows: [
        [[{ t: 'text', v: "Node.js" }], [{ t: 'text', v: "22 LTS" }], [{ t: 'text', v: "前端工程与构建工具依赖" }]],
        [[{ t: 'text', v: "Java" }], [{ t: 'text', v: "21 LTS（Temurin）" }], [{ t: 'text', v: "后端微服务与企业级工程底座" }]],
        [[{ t: 'text', v: "Python" }], [{ t: 'text', v: "3.12+" }], [{ t: 'text', v: "脚本、数据处理与接口服务" }]],
        [[{ t: 'text', v: "MySQL" }], [{ t: 'text', v: "8.0+" }], [{ t: 'text', v: "关系型数据库存储" }]],
        [[{ t: 'text', v: "Git" }], [{ t: 'text', v: "2.40+" }], [{ t: 'text', v: "分布式版本控制" }]],
      ] },
    { kind: 'h3', id: 'sec-3', text: "依赖管理与 Lockfile 机制" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "包管理工具通过锁文件固化项目依赖树的精确版本：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> ci                              <span class=\"tk-c\"># 严格依据 lockfile 安装，保持环境一致</span>\n<span class=\"tk-k\">npm</span> install                         <span class=\"tk-c\"># 会解析并可能更新依赖版本，仅在新增依赖时使用</span>" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在多人协同或持续集成流水线中，统一使用 " }, { t: 'code', v: "npm ci" }, { t: 'text', v: " 避免因依赖版本漂移导致构建不一致。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "跨平台换行符处理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Windows 默认使用 CRLF 作为换行符，Unix/Linux 与 macOS 使用 LF。跨系统协作时，不同换行符会导致 Git 产生大面积无意义的代码变更。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在本地关闭自动转换，并通过仓库的 " }, { t: 'code', v: ".gitattributes" }, { t: 'text', v: " 统一声明文件换行规则为 LF：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">git</span> config --global core.autocrlf <span class=\"tk-s\">false</span>" },
    { kind: 'h3', id: 'sec-5', text: "环境变量与配置隔离" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从模板文件 " }, { t: 'code', v: ".env.example" }, { t: 'text', v: " 复制生成本地配置文件 " }, { t: 'code', v: ".env.local" }, { t: 'text', v: "。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'code', v: ".env.local" }, { t: 'text', v: " 属于本地私有配置，必须包含在 " }, { t: 'code', v: ".gitignore" }, { t: 'text', v: " 中，严禁将密码、Token、密钥与内网地址提交至版本库。" }],
    ] },
    ],
  },
  {
    slug: 'first-week',
    index: '03',
    category: 'setup',
    title: "第一周",
    summary: "新成员前七天的核心任务与协作习惯。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "前三天：项目熟悉" },
      { id: 'sec-2', text: "第四至五天：方案梳理与初次编码" },
      { id: 'sec-3', text: "第六至七天：测试与提交" },
      { id: 'sec-4', text: "问题排查与提问方式" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "前三天：项目熟悉" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "跑通一个项目的本地构建与启动流程，阅读仓库的 " }, { t: 'code', v: "README" }, { t: 'text', v: " 与目录结构。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "理清前后端模块的职责边界与配置文件的作用。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "第四至五天：方案梳理与初次编码" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "认领标有 " }, { t: 'code', v: "good first issue" }, { t: 'text', v: " 的入门任务，首个提交控制在 50 行代码以内。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "编码前在对应 issue 下方简要陈述修改方案与预期效果，确认思路无误后再进行修改。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "第六至七天：测试与提交" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "为修改的代码补充对应的单元测试用例，覆盖核心分支。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "运行本地完整质量检查，确认无报错后再发起合并请求：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> run typecheck &amp;&amp; <span class=\"tk-k\">npm</span> run test &amp;&amp; <span class=\"tk-k\">npm</span> run build" },
    { kind: 'h3', id: 'sec-4', text: "问题排查与提问方式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "遇到问题先检索仓库历史提交与 issue 讨论记录。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "寻求协助时提供完整的报错堆栈、环境信息与复现步骤，准确描述预期行为与实际表现。" }],
    ] },
    ],
  },
  {
    slug: 'git-flow',
    index: '04',
    category: 'convention',
    title: "分支与提交",
    summary: "分支命名、原子提交规范与 PR 流转。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "Git 状态模型" },
      { id: 'sec-2', text: "分支管理" },
      { id: 'sec-3', text: "提交记录规范" },
      { id: 'sec-4', text: "合并请求流程" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "Git 状态模型" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "文件在工作区进行编辑修改，通过 " }, { t: 'code', v: "git add" }, { t: 'text', v: " 暂存至暂存区，通过 " }, { t: 'code', v: "git commit" }, { t: 'text', v: " 生成版本记录，最后推送到远程仓库。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "分支管理" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "分支命名规范：" }],
    ] },
    { kind: 'code', lang: '', html: "feat/&lt;简短英文&gt;      新功能开发\nfix/&lt;简短英文&gt;       缺陷修复\nchore/&lt;简短英文&gt;     依赖与构建配置更新\ndocs/&lt;简短英文&gt;      文档更新" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从 " }, { t: 'code', v: "main" }, { t: 'text', v: " 主分支检出新分支进行开发，完成后发起合并请求，严禁直接向主分支推送代码。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "提交记录规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "遵循小步多次提交原则，禁止在开发最后阶段一次性提交全量代码。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提交信息采用 Conventional Commits 格式，清晰表述变更意图：" }],
    ] },
    { kind: 'code', lang: '', html: "feat(auth): 增加用户登录参数校验\nfix(table): 修复移动端列表数据溢出" },
    { kind: 'h3', id: 'sec-4', text: "合并请求流程" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "合并请求说明需包含三项内容：改动内容、改动原因、验证方式。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "涉及界面调整时附带截图，截图前需对真实姓名、学号等敏感数据进行脱敏处理。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "严禁在团队共享分支执行强制推送（force push）。" }],
    ] },
    ],
  },
  {
    slug: 'frontend',
    index: '05',
    category: 'convention',
    title: "前端约定",
    summary: "TypeScript 类型约束、样式令牌、状态管理与组件设计。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "TypeScript 类型约束" },
      { id: 'sec-2', text: "目录与单一真源" },
      { id: 'sec-3', text: "设计系统与样式变量" },
      { id: 'sec-4', text: "状态管理与路由下沉" },
      { id: 'sec-5', text: "交互组件设计考量" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "TypeScript 类型约束" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "启用 " }, { t: 'code', v: "strict: true" }, { t: 'text', v: " 严格模式。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "避免使用 " }, { t: 'code', v: "any" }, { t: 'text', v: " 类型，无法推断类型时使用 " }, { t: 'code', v: "unknown" }, { t: 'text', v: " 并通过条件守卫收窄类型。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对外暴露的公共函数与接口必须显式标注返回类型。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "目录与单一真源" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "前端目录架构划分：" }],
    ] },
    { kind: 'code', lang: '', html: "src/\n  components/    通用可复用组件，不耦合具体业务\n  sections/      页面独立区块\n  data/          静态数据与配置常量\n  lib/           纯函数工具库\n  styles/        全局样式与设计令牌" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "同一数据或常量仅在一处定义，跨模块使用时通过引用引入，禁止复制代码片段。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "设计系统与样式变量" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "颜色、字体尺寸、间距与圆角统一采用 CSS 变量管理，禁止在组件中硬编码十六进制色值与数值：" }],
    ] },
    { kind: 'code', lang: 'css', html: "<span class=\"tk-c\">/* 推荐 */</span>\ncolor: var(--sky-500);\npadding: var(--space-3);\n\n<span class=\"tk-c\">/* 避免 */</span>\ncolor: #2e9be0;\npadding: 12px;" },
    { kind: 'h3', id: 'sec-4', text: "状态管理与路由下沉" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "页面检索条件、分页参数与筛选标签等状态优先下沉至 URL Query String，确保页面刷新后状态可复原。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "仅在跨多层组件传递共享数据时使用 Context，避免创建不必要的全局 Store。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "交互组件设计考量" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "组件设计需契合业务场景：以轮播图为例，在品牌官网适合作为首页主视觉，在电商页面适合用于商品详情多图切换，在管理后台则应保持克制，避免遮挡核心数据区域。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "页面动效优先限制在 " }, { t: 'code', v: "transform" }, { t: 'text', v: " 与 " }, { t: 'code', v: "opacity" }, { t: 'text', v: " 属性，且必须支持在系统开启减弱动态效果时自动降级。" }],
    ] },
    ],
  },
  {
    slug: 'backend',
    index: '06',
    category: 'convention',
    title: "后端约定",
    summary: "分层架构、面向对象设计、文件持久化与健壮性。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "服务端分层架构" },
      { id: 'sec-2', text: "面向对象与业务解耦" },
      { id: 'sec-3', text: "文件 I/O 与数据持久化" },
      { id: 'sec-4', text: "业务异常与统一拦截" },
      { id: 'sec-5', text: "结构化操作日志" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "服务端分层架构" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "服务端应用分为控制层、业务逻辑层与数据访问层：" }],
    ] },
    { kind: 'code', lang: '', html: "controller   负责请求接收、参数校验与协议组装\nservice      负责业务规则执行与事务边界管理\nmapper       负责数据库访问与持久化操作" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "控制层不得直接注入数据访问层，事务注解统一声明在业务方法上。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "面向对象与业务解耦" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "实体类承载数据状态，业务计算逻辑由独立的业务服务承载。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "针对多规则排序或策略切换场景，通过比较器接口或策略模式将算法实现与业务对象解耦。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "文件 I/O 与数据持久化" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "本地文件持久化需定义清晰的结构化格式，使用固定分隔符或标识符区分字段，禁止直接将对象转为无格式文本存储。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "文件读取逻辑需具备容错机制，在文件不存在或数据格式损坏时提供安全兜底，避免程序崩溃。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "业务异常与统一拦截" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务失败时主动抛出携带错误码的自定义业务异常。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "在外围配置全局异常处理器，将异常集中转换为统一的错误响应格式，避免直接暴露底层堆栈。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "结构化操作日志" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对数据增删改等核心操作输出结构化日志，记录时间、操作人、业务类型与执行结果。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "日志统一以追加模式写入；严禁在日志中记录明文密码与密钥，手机号等敏感信息需进行脱敏处理。" }],
    ] },
    ],
  },
  {
    slug: 'api-contract',
    index: '07',
    category: 'quality',
    title: "接口与数据",
    summary: "OpenAPI 契约生成、统一响应结构与 SQL 数据设计。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "契约驱动与类型生成" },
      { id: 'sec-2', text: "统一响应与分页协议" },
      { id: 'sec-3', text: "数据库模型设计" },
      { id: 'sec-4', text: "SQL 查询与数据安全" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "契约驱动与类型生成" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "服务端定义并导出 OpenAPI 规范文档，前端通过代码生成工具自动生成 TypeScript 类型定义与请求方法，避免手动维护接口契约。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "统一响应与分页协议" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "接口响应采用统一包装结构：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">interface</span> <span class=\"tk-k\">ApiResponse</span>&lt;<span class=\"tk-k\">T</span>&gt; {\n  code: <span class=\"tk-k\">number</span>\n  message: <span class=\"tk-k\">string</span>\n  data: <span class=\"tk-k\">T</span>\n}\n\n<span class=\"tk-k\">interface</span> <span class=\"tk-k\">Page</span>&lt;<span class=\"tk-k\">T</span>&gt; {\n  items: <span class=\"tk-k\">T</span>[]\n  total: <span class=\"tk-k\">number</span>\n  page: <span class=\"tk-k\">number</span>\n  size: <span class=\"tk-k\">number</span>\n}" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务状态码 " }, { t: 'code', v: "code" }, { t: 'text', v: " 为 0 表示操作成功，传输层 HTTP 状态码与业务状态码分工明确。分页查询的每页容量由服务端设置最大上限强制截断。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "数据库模型设计" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "SQL 语言涵盖数据定义（DDL）、数据操作（DML）与数据查询（DQL）。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "数据表必须具备主键约束，外键关联字段需保持类型一致，核心字段明确标注非空约束并设定合理默认值。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "数据库表结构变更统一采用版本化数据库迁移工具进行管理。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "SQL 查询与数据安全" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "多表关联查询应基于索引字段进行连接，避免在大表上执行无索引全表扫描。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "数据访问层必须使用参数化查询或预编译语句，严禁直接拼接 SQL 字符串，杜绝 SQL 注入风险。" }],
    ] },
    ],
  },
  {
    slug: 'testing',
    index: '08',
    category: 'quality',
    title: "测试与评审",
    summary: "核心测试范围、自动化门禁与代码评审标准。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "测试范围划分" },
      { id: 'sec-2', text: "单元测试编写规范" },
      { id: 'sec-3', text: "本地门禁流水线" },
      { id: 'sec-4', text: "代码评审核心维度" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "测试范围划分" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "核心计算逻辑、权限判定、状态机状态跃迁、外部输入解析以及历史缺陷修复必须编写测试用例。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "避免对框架底层行为、无分支的简单透传方法进行无意义的测试堆砌。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "单元测试编写规范" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "单个测试用例专注于验证一个具体行为，用例命名应清晰表达前置条件与预期结果：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'参数为空时返回校验失败异常'</span>, () =&gt; {\n  <span class=\"tk-c\">// 执行测试逻辑与断言</span>\n})" },
    { kind: 'h3', id: 'sec-3', text: "本地门禁流水线" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提交代码或发起合并请求前，必须在本地完整运行质量门禁：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> run typecheck &amp;&amp; <span class=\"tk-k\">npm</span> run lint &amp;&amp; <span class=\"tk-k\">npm</span> run test" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "任何检查未通过的代码不得提交至远程仓库。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "代码评审核心维度" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "评审聚焦四项核心要素：运行正确性（边界与空值处理）、接口兼容性（是否存在破坏性变更）、代码可读性（命名与结构是否清晰）、架构分层（职责是否清晰）。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "格式化与基础代码风格交由自动化工具处理，评审意见需清晰区分必须修改项与建议项。" }],
    ] },
    ],
  },
]

export const docBySlug = (slug: string): Doc | undefined => DOCS.find((d) => d.slug === slug)

export const docsByCategory = (id: string): readonly Doc[] => DOCS.filter((d) => d.category === id)
