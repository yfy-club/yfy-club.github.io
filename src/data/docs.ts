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
    slug: 'env-baseline',
    index: '01',
    category: 'setup',
    title: "环境基线",
    summary: "装这几个版本，别装别的。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "版本" },
      { id: 'sec-2', text: "起项目" },
      { id: 'sec-3', text: "换行符" },
      { id: 'sec-4', text: "环境变量" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "版本" },
    { kind: 'table',
      head: [[], [{ t: 'text', v: "版本" }], [{ t: 'text', v: "备注" }]],
      rows: [
        [[{ t: 'text', v: "Node.js" }], [{ t: 'text', v: "22 LTS" }], [{ t: 'text', v: "低于 22 的构建会挂" }]],
        [[{ t: 'text', v: "Java" }], [{ t: 'text', v: "21 LTS（Temurin）" }], [{ t: 'text', v: "不用 Oracle JDK，授权麻烦" }]],
        [[{ t: 'text', v: "PostgreSQL" }], [{ t: 'text', v: "17" }], []],
        [[{ t: 'text', v: "Git" }], [{ t: 'text', v: "2.40+" }], []],
      ] },
    { kind: 'h3', id: 'sec-2', text: "起项目" },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> ci                              <span class=\"tk-c\"># 不是 npm install</span>\n<span class=\"tk-k\">npx</span> playwright install chromium     <span class=\"tk-c\"># 浏览器要单独装</span>\n<span class=\"tk-k\">npm</span> run dev" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "npm ci" }, { t: 'text', v: " 严格按 lockfile 装。" }, { t: 'code', v: "npm install" }, { t: 'text', v: " 会改 lockfile，改完你自己都不知道装了什么。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "换行符" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Windows 上先关掉自动转换，再靠仓库的 " }, { t: 'code', v: ".gitattributes" }, { t: 'text', v: " 统一成 LF：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">git</span> config --global core.autocrlf <span class=\"tk-s\">false</span>" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "开了 " }, { t: 'code', v: "autocrlf=true" }, { t: 'text', v: " 的后果是每次提交整文件飘红，评审时看不出你到底改了哪一行。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "环境变量" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从 " }, { t: 'code', v: ".env.example" }, { t: 'text', v: " 复制成 " }, { t: 'code', v: ".env.local" }, { t: 'text', v: "。" }, { t: 'code', v: ".env.local" }, { t: 'text', v: " 已在 " }, { t: 'code', v: ".gitignore" }, { t: 'text', v: " 里，别去掉。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "任何 Token、密钥、内网 IP、数据库口令不进源码、不进 Markdown、不进截图、不进日志。" }],
    ] },
    ],
  },
  {
    slug: 'first-week',
    index: '02',
    category: 'setup',
    title: "第一周",
    summary: "七天里该完成的事，按顺序。",
    minutes: 2,
    headings: [
      { id: 'sec-1', text: "前三天" },
      { id: 'sec-2', text: "第四到第五天" },
      { id: 'sec-3', text: "第六到第七天" },
      { id: 'sec-4', text: "三条前提" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "前三天" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "跑起来一个项目，随便哪个。跑不起来就在群里贴完整报错，别贴\"我这边有问题\"。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "读那个项目的 " }, { t: 'code', v: "README" }, { t: 'text', v: " 和 " }, { t: 'code', v: "CONTRIBUTING" }, { t: 'text', v: "，不用读懂全部，知道哪个目录放什么就行。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "第四到第五天" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "领一个标了 " }, { t: 'code', v: "good first issue" }, { t: 'text', v: " 的活。第一个 PR 控制在 50 行以内。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "改之前先在 issue 下说一句你打算怎么改。方案错了，早说早改，比写完再推翻省事。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "第六到第七天" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "给你改过的那块代码补一条测试。哪怕只测一个分支。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "跑一遍完整门禁，绿了再发 PR：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> run typecheck &amp;&amp; <span class=\"tk-k\">npm</span> run lint &amp;&amp; <span class=\"tk-k\">npm</span> run test &amp;&amp; <span class=\"tk-k\">npm</span> run build" },
    { kind: 'h3', id: 'sec-4', text: "三条前提" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "问问题前先搜一遍仓库和历史 issue。搜过没有再问，并说明你搜了什么。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不确定的地方直接说不确定。猜着写然后让评审去发现，浪费两个人的时间。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "代码是要被别人读的。名字取长一点没关系，取错了才有关系。" }],
    ] },
    ],
  },
  {
    slug: 'git-flow',
    index: '03',
    category: 'convention',
    title: "分支与提交",
    summary: "分支怎么起名，提交怎么写，PR 怎么开。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "分支" },
      { id: 'sec-2', text: "提交信息" },
      { id: 'sec-3', text: "PR" },
      { id: 'sec-4', text: "禁止" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "分支" },
    { kind: 'code', lang: '', html: "feat/&lt;简短英文&gt;      新功能\nfix/&lt;简短英文&gt;       缺陷\nchore/&lt;简短英文&gt;     构建、依赖、配置\ndocs/&lt;简短英文&gt;      文档" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "从 " }, { t: 'code', v: "main" }, { t: 'text', v: " 切出，改完开 PR 回 " }, { t: 'code', v: "main" }, { t: 'text', v: "。不直接往 " }, { t: 'code', v: "main" }, { t: 'text', v: " 推。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "提交信息" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Conventional Commits，中文正文：" }],
    ] },
    { kind: 'code', lang: '', html: "feat(join): 报名表单增加方向多选校验\nfix(monitor): 修正遥测断线后 SSE 不重连" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "主语写\"改了什么\"，不写\"修改了一些问题\"。一次提交只做一件事。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "PR" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "标题同提交格式。正文写三行：改了什么、为什么、怎么验证的。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "截图只在改了界面时放。放之前确认里面没有真实姓名、学号、内网地址。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "禁止" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不 force push 到共享分支。" }],
      [{ t: 'text', v: "不在自己的 PR 里顺手格式化无关文件。" }],
      [{ t: 'text', v: "不合并没跑过门禁的 PR。" }],
    ] },
    ],
  },
  {
    slug: 'frontend',
    index: '04',
    category: 'convention',
    title: "前端约定",
    summary: "TypeScript、目录、状态、样式。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "TypeScript" },
      { id: 'sec-2', text: "目录" },
      { id: 'sec-3', text: "状态" },
      { id: 'sec-4', text: "样式" },
      { id: 'sec-5', text: "动效" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "TypeScript" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "strict: true" }, { t: 'text', v: "，不关。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不用 " }, { t: 'code', v: "any" }, { t: 'text', v: "。类型实在推不出来用 " }, { t: 'code', v: "unknown" }, { t: 'text', v: " 再收窄。给 " }, { t: 'code', v: "any" }, { t: 'text', v: " 的地方写清楚为什么，写不清楚就说明还没想明白。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "对外暴露的函数写显式返回类型。内部函数交给推导。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "目录" },
    { kind: 'code', lang: '', html: "src/\n  components/    可复用组件，不含业务数据\n  sections/      页面区块，可以含业务数据\n  data/          静态内容，单一真源\n  lib/           纯函数工具，不碰 DOM\n  styles/        令牌与全局样式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "同一份事实只存在于一个文件。需要在第二处用到就 import，不复制。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "状态" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "能用 props 传的不提到 store。能用 URL 表达的不放内存——筛选条件、当前页、展开项一律进 query string，刷新后要还在。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "跨三层以上才考虑 context。全局 store 只放真正全局的东西（当前用户、主题、语言）。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "样式" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "颜色、间距、圆角、时长一律从 CSS 变量取。组件里不写 " }, { t: 'code', v: "#hex" }, { t: 'text', v: "，不写魔法数字。" }],
    ] },
    { kind: 'code', lang: 'css', html: "<span class=\"tk-c\">/* 不要 */</span>\ncolor: #2E9BE0;\npadding: 13px;\n\n<span class=\"tk-c\">/* 要 */</span>\ncolor: var(--sky-500);\npadding: var(--space-3);" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "改一个颜色要改十个文件，说明令牌层没建好。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "动效" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "只动 " }, { t: 'code', v: "transform" }, { t: 'text', v: " 和 " }, { t: 'code', v: "opacity" }, { t: 'text', v: "。动 " }, { t: 'code', v: "width" }, { t: 'text', v: "、" }, { t: 'code', v: "height" }, { t: 'text', v: "、" }, { t: 'code', v: "top" }, { t: 'text', v: "、" }, { t: 'code', v: "left" }, { t: 'text', v: " 会触发布局，掉帧。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'code', v: "prefers-reduced-motion: reduce" }, { t: 'text', v: " 下必须能关。这不是可选项。" }],
    ] },
    ],
  },
  {
    slug: 'backend',
    index: '05',
    category: 'convention',
    title: "后端约定",
    summary: "分层、事务、错误、迁移。",
    minutes: 4,
    headings: [
      { id: 'sec-1', text: "分层" },
      { id: 'sec-2', text: "事务" },
      { id: 'sec-3', text: "错误" },
      { id: 'sec-4', text: "数据库迁移" },
      { id: 'sec-5', text: "日志" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "分层" },
    { kind: 'code', lang: '', html: "controller   只做参数校验与响应组装，不写业务\nservice      业务逻辑与事务边界\nmapper       只做数据访问" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "Controller 不注入 Mapper。想跳层说明 Service 该拆了。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "事务" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "@Transactional" }, { t: 'text', v: " 加在 Service 方法上，不加在 Controller 上。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "事务里不发 HTTP 请求、不发消息、不写文件。这些做完再做，或者交给事务提交后的回调。事务持有连接的时间越长，池子越容易干。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "只读查询标 " }, { t: 'code', v: "@Transactional(readOnly = true)" }, { t: 'text', v: "。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "错误" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "业务异常用自定义异常带错误码，统一异常处理器转响应体。不在 Controller 里写 try-catch 拼错误 JSON。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "返回给前端的错误信息要能让用户看懂并知道下一步做什么。堆栈进日志，不进响应体。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "数据库迁移" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "结构改动一律走 Flyway，一次改动一个版本文件。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "已合并的迁移文件不改。改错了就再加一个版本修回来。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "字段加 " }, { t: 'code', v: "NOT NULL" }, { t: 'text', v: " 时先给默认值，再分两次上线。一步到位会锁表。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "日志" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "日志里不出现口令、Token、身份证、手机号。手机号要打印就脱敏成 " }, { t: 'code', v: "138****1234" }, { t: 'text', v: "。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'code', v: "INFO" }, { t: 'text', v: " 记录状态流转，" }, { t: 'code', v: "DEBUG" }, { t: 'text', v: " 记录中间值，" }, { t: 'code', v: "ERROR" }, { t: 'text', v: " 只在真的需要人来处理时用。满屏 " }, { t: 'code', v: "ERROR" }, { t: 'text', v: " 等于没有 " }, { t: 'code', v: "ERROR" }, { t: 'text', v: "。" }],
    ] },
    ],
  },
  {
    slug: 'api-contract',
    index: '06',
    category: 'convention',
    title: "接口契约",
    summary: "后端定 OpenAPI，前端生成客户端，中间不手写。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "流程" },
      { id: 'sec-2', text: "响应结构" },
      { id: 'sec-3', text: "分页" },
      { id: 'sec-4', text: "破坏性变更" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "流程" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "后端写完接口导出 OpenAPI，前端用 Orval 生成类型与请求函数。生成产物提交进仓库，但" }, { t: 'strong', v: "不手改" }, { t: 'text', v: "。" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> run api:generate" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "改了接口没重新生成，前端一定在某个地方悄悄错。类型对不上就是提醒你该跑这条命令了。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "响应结构" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "统一包一层，前端只需要处理一种形状：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">interface</span> <span class=\"tk-k\">ApiResponse</span>&lt;<span class=\"tk-k\">T</span>&gt; {\n  code: <span class=\"tk-k\">number</span>\n  message: <span class=\"tk-k\">string</span>\n  data: <span class=\"tk-k\">T</span>\n}" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "code" }, { t: 'text', v: " 为 0 表示成功。HTTP 状态码表达传输层结果，" }, { t: 'code', v: "code" }, { t: 'text', v: " 表达业务结果，两者不混用。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "分页" },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">interface</span> <span class=\"tk-k\">Page</span>&lt;<span class=\"tk-k\">T</span>&gt; {\n  items: <span class=\"tk-k\">T</span>[]\n  total: <span class=\"tk-k\">number</span>\n  page: <span class=\"tk-k\">number</span>\n  size: <span class=\"tk-k\">number</span>\n}" },
    { kind: 'para', lines: [
      [{ t: 'code', v: "page" }, { t: 'text', v: " 从 1 开始。" }, { t: 'code', v: "size" }, { t: 'text', v: " 上限 100，后端强制截断，不信任前端传值。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "破坏性变更" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "改字段名、改类型、删字段都是破坏性变更。先加新字段，前端切完，再删旧的，分两次上线。" }],
    ] },
    ],
  },
  {
    slug: 'testing',
    index: '07',
    category: 'quality',
    title: "测什么",
    summary: "哪些必须有测试，哪些不必浪费时间。",
    minutes: 3,
    headings: [
      { id: 'sec-1', text: "必须测" },
      { id: 'sec-2', text: "不必测" },
      { id: 'sec-3', text: "单元测试" },
      { id: 'sec-4', text: "端到端测试" },
      { id: 'sec-5', text: "门禁" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "必须测" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "算钱的、算分的、判权限的。" }],
      [{ t: 'text', v: "状态机的每一次流转。" }],
      [{ t: 'text', v: "解析外部输入的函数——表单、上传、URL 参数。" }],
      [{ t: 'text', v: "修过的缺陷。修完补一条能复现它的测试，否则它会回来。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "不必测" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "框架本身的行为。" }],
      [{ t: 'text', v: "纯转发、没有分支的一行函数。" }],
      [{ t: 'text', v: "第三方库的返回值。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "覆盖率是体检指标，不是目标。为了数字去测 getter，只会让人不敢改代码。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "单元测试" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "一个测试测一件事。测试名写清楚\"什么情况下应该怎样\"：" }],
    ] },
    { kind: 'code', lang: 'ts', html: "<span class=\"tk-k\">it</span>(<span class=\"tk-s\">'阶数超过 8 时拒绝计算并给出提示'</span>, () =&gt; { ... })" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不写 " }, { t: 'code', v: "it('test1')" }, { t: 'text', v: "。三个月后没人知道 " }, { t: 'code', v: "test1" }, { t: 'text', v: " 在测什么。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不 mock 被测对象自己。mock 到处都是，说明依赖太多，该拆。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "端到端测试" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "只覆盖主干路径。E2E 慢且脆，写多了没人愿意跑。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不用真实学生信息做测试数据。" }],
    ] },
    { kind: 'h3', id: 'sec-5', text: "门禁" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "发 PR 前本地跑一遍：" }],
    ] },
    { kind: 'code', lang: 'bash', html: "<span class=\"tk-k\">npm</span> run typecheck &amp;&amp; <span class=\"tk-k\">npm</span> run lint &amp;&amp; <span class=\"tk-k\">npm</span> run test" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "红的不发。CI 不是你的本地环境。" }],
    ] },
    ],
  },
  {
    slug: 'review',
    index: '08',
    category: 'quality',
    title: "评审",
    summary: "看四件事，其余的交给工具。",
    minutes: 2,
    headings: [
      { id: 'sec-1', text: "只看四件事" },
      { id: 'sec-2', text: "交给工具" },
      { id: 'sec-3', text: "怎么说" },
      { id: 'sec-4', text: "作者这边" },
    ],
    blocks: [
    { kind: 'h3', id: 'sec-1', text: "只看四件事" },
    { kind: 'para', lines: [
      [{ t: 'strong', v: "能不能跑对" }, { t: 'text', v: "——边界值、空值、并发、失败路径有没有处理。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'strong', v: "会不会伤到别人" }, { t: 'text', v: "——改的是不是公共接口，有没有人在用。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'strong', v: "三个月后读不读得懂" }, { t: 'text', v: "——命名、拆分、注释解释的是\"为什么\"还是\"是什么\"。注释重复代码是噪音。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'strong', v: "该不该在这一层" }, { t: 'text', v: "——业务逻辑跑进了组件里，SQL 拼进了 Controller 里，现在不说以后没人会说。" }],
    ] },
    { kind: 'h3', id: 'sec-2', text: "交给工具" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "缩进、引号、分号、import 顺序、行尾空格。这些 ESLint 和 Prettier 会管，评审时提等于浪费两个人的时间。" }],
    ] },
    { kind: 'h3', id: 'sec-3', text: "怎么说" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "提问题给出理由，最好给出改法：" }],
    ] },
    { kind: 'code', lang: '', html: "这里 findById 可能返回 null，第 42 行直接 .name 会炸。\n建议先判空返回业务异常。" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不写\"这样写不好\"。不好在哪，对方不知道。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "区分\"必须改\"和\"建议改\"，明确标出来。全是\"建议\"会让人不知道哪些不改就不能合。" }],
    ] },
    { kind: 'h3', id: 'sec-4', text: "作者这边" },
    { kind: 'para', lines: [
      [{ t: 'text', v: "被指出问题不用道歉，改了回一句\"已改，见 xxx\"就行。" }],
    ] },
    { kind: 'para', lines: [
      [{ t: 'text', v: "不同意就说不同意，把理由讲清楚。评审是讨论，不是审判。" }],
    ] },
    ],
  },
]

export const docBySlug = (slug: string): Doc | undefined => DOCS.find((d) => d.slug === slug)

export const docsByCategory = (id: string): readonly Doc[] => DOCS.filter((d) => d.category === id)
