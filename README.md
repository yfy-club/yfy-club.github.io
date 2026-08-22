# 云飞扬开源传送门

面向 `https://yfy-club.github.io/` 的独立站点工程——一个把社团技术方向、开源项目与开发者档案用二次元游戏化语汇重新讲一遍的极客传送门。与官网 `www.yunfeiyang.tech` 定位互补，不做内容副本。

## 当前状态

**M7 · 收口完成。** 全屏舞台、五张方向角色卡、三个项目视差展台、向导驻留挂件、`/docs` 开发者档案库、弹幕与 BGM 开关全部落地；可访问性、性能预算、SSG head 与 sitemap、部署工作流（不启用）收齐。

```bash
npm ci
npm run dev      # http://localhost:5173
npm run check    # typecheck → 对比度 → 字体子集与预算 → 生产构建（含预渲染）
```

`?lab=1` 是 M2 的立绘验收页，六人 × 七态全部摆出来供肉眼比对。

### 门禁

| 命令 | 卡什么 |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run check:contrast` | 27 项色彩对比度，直接从 `tokens.css` 读色值实测 |
| `npm run fonts:subset` | 重切中文子集并核对首屏字体预算（160 KB） |
| `npm run build` | 生产构建 + 十条路由预渲染 + sitemap / robots |

四道都是硬门禁，任何一道红了不合并。改色值不许改阈值，改文案必须重跑字体子集。

### 可访问性回归

```bash
npx vite --port 5241 --strictPort                   # 另开一个终端
PROBE_BASE=http://localhost:5241 \
  PW_ROOT=G:/Code/Other/yfy \
  node scripts/a11y-probe.mjs
```

**71 条断言**，六组：落地对比度实算、键盘 Tab 序与焦点环、`aria-hidden` 与标题层级、
减弱动效六样（粒子 / 视差 / 立绘惯性 / 滚动聚焦 / lenis / 弹幕）、全站禁令、控制台干净。

**不进 `npm run check`**：本工程没装 playwright，借主站的（`PW_ROOT` 指过去），
而且要有一个跑着的 dev server。塞进门禁会让换机器的人第一条命令就红。改了交互层手动跑一遍。

为什么不接 axe：`check:contrast` 只扫令牌两两组合，axe 只扫渲染后的 DOM，
两者之间有一块谁都不管的地带——**令牌用对了但用错了场合**。M7 抓到的 17 处
`--ink-400` 承载 11px 文本就在这里，axe 报不出「这个令牌在 2.1 表里被限死在非文本图形」。
取舍见 spec 第 6 节的 M7 修正记录一。

### 性能

Lighthouse 移动端（模拟节流）：**Performance 95 / A11y 100 / Best Practices 100 / SEO 100**，
CLS 0.0000，FCP 0.91s。预算：JS gzip 153.7 / 180 KB，CSS gzip 17.5 / 20 KB，首屏字体 141.5 / 160 KB。

量法要注意两条，否则量出来的数是废的：

- **不要用 `vite preview`**，它的 SPA fallback 会把 404 那条掩盖掉。写一个没有 fallback 的
  `node http.createServer` 服务 `dist/`：目录取 `index.html`，无尾斜杠发 301，找不到就 404。
- **服务器要对文本资源开 gzip 并给 `cache-control`**，照抄 GitHub Pages 的响应头。
  不压的话 Lighthouse 量到的是 469 KB 原始 JS 而不是 153.7 KB 的实际传输量，FCP 直接虚高两秒。

LCP 三条路由都超 2.0s 的目标，超的那部分是模拟节流的固定开销：同一次运行里浏览器实际观测
FCP 295ms / LCP 332ms，而一张零外部资源的纯 HTML 在同一台机器上的模拟下限就是 LCP 765ms。
交叉验证与「不为这个数字动设计」的结论见 spec 7.3 的 M7 记录一。

INP 是真实交互实测的（Lighthouse 冷启动跑不出 INP）：CPU×4 下 p50 136ms，×2 下 p75 96ms。

### 文档

- [docs/design-spec.md](docs/design-spec.md) — 设计规格书（色彩令牌、字阶、角色系统、差分状态机、页面结构、动效参数、性能预算）
- [docs/content-docs.md](docs/content-docs.md) — 开发者档案库内容成稿（3 分类 8 篇）
- [docs/music-sources.md](docs/music-sources.md) — 合规 BGM 音源渠道清单
- [docs/CREDITS.md](docs/CREDITS.md) — 第三方素材署名登记

### 档案库内容

```bash
npm run docs:build
```

`src/data/docs.ts` 由 `scripts/build-docs.ts` 从 `docs/content-docs.md` 生成，**已提交进仓库，不要手改**。改内容改成稿再跑这条命令。

代码块的语法高亮是构建期用 Shiki 出的：产物 HTML 里只有 `tk-k` / `tk-s` / `tk-c` 三个 class，颜色留在 `docs.css` 里引令牌。`shiki` 只在 `devDependencies`，运行时零成本，不进包。高亮色是硬编码在产物里的，`check:contrast` 扫不到，对 `--bg-sunk` 的实测值记在 spec 4.4 的 M5 修正记录二，改色先回去改那张表。

### 弹幕与声音

弹幕**只存 `localStorage`，没有后端**。输入框 placeholder 与提交回执都必须写着「仅保存在你的浏览器，别人看不到」——这是防"假互动"的硬要求，别改措辞。默认关闭，开关在导航条右侧，只在首页出现。

四条轨道沉在内容之下（`--z-danmaku: 5`），从字标与立绘背后穿过。规格原本排在立绘之上，实测在移动端必然横穿字标，已推翻，见 spec 5.4 的 M6 修正记录。同轨恒速，所以起跑时刻一旦按 `MIN_GAP` 拉开就永远不会追尾，排期算法在 `src/components/danmaku/store.ts`。

预置文案在 `src/data/danmaku.ts`，字段 `text` 列在 `BODY_ONLY_FIELDS` 里——弹幕从不粗体渲染，700 那份子集把它的独有字整个剔掉，每个新汉字只收半价。加词条前先看字体余量。

BGM 走 `public/audio/bgm.ogg`（+ `bgm.mp3` 兜底），说明见 [public/audio/README.md](public/audio/README.md)。**本仓库不自带任何音频文件**，两个都不在时开关自动隐藏。

文件在不在是**构建期**扫的（`vite.config.ts` 注入 `__BGM_SOURCES__`），运行时零请求——运行时探会在文件缺席时给每位访客的控制台留两条 404，那就是规格 5.5 明令禁止的"报错"。**新放进音频文件后要重启 dev server 才认。**

要求署名的曲子填 `docs/CREDITS.md` 与 `src/data/credits.ts` 的 `BGM_CREDIT`，页脚那一行由后者控制。

减弱动效下弹幕整个关掉，连开关一并不出。

### 路由与预渲染

`/`、`/docs`、`/docs/:id` 三条路由。GitHub Pages 没有 SPA fallback，`/docs/git-flow` 直接刷新会 404，所以 `npm run build` 之后由 `scripts/prerender.ts` 给每条路由各出一张静态页（共 10 张），顺带满足「无 JS 时内容可读」。段落的虚焦是 JS 加上去的，CSS 默认态是实焦——反过来写的话没 JS 的人会看到一屏糊字。

注水脚本被打上 `fetchpriority="low"`。内容已经在预渲染 HTML 里，JS 不参与首屏出字，但 `type=module` 默认是 High 优先级，149 KB 的包会把首屏字体挤到后面——降优先级后 FCP 从 1810ms 降到 911ms，而 TTI 一毫秒都没退（2918 → 2919ms）。

首屏之下的三个分区与页脚走 `content-visibility: auto`（`app.css`），五张方向卡的立绘也走（`tracks.css`）。预渲染把整页 1230 个节点、481 条 SVG 路径一次性交给浏览器，首屏那句副标题本来要等它们全部算完布局才能上屏。两条都验过版面零变化，`contain-intrinsic-size` 一律写 `auto`。

### 字体

中文子集产物 `src/assets/fonts/` 与 `src/styles/fonts.css` 由 `scripts/subset-fonts.ts` 生成，**需要提交进仓库**，否则拉下来的人跑 build 会缺字。改了界面文案后跑一次 `npm run fonts:subset`。

语料按三个作用域切片，`unicode-range` 互不重叠：`ui` 随页面加载，`lab`（验收页）与 `docs`（长文）按需下载。700 只装标题类字段的字，正文独有的字剔掉——见 `BODY_ONLY_FIELDS`。新增正文字段往那里加一行，不要抬 `BUDGET_KB`。

`src/data/docs.ts` 在 `DOCS_OWNED` 里，扫 `ui` 时跳过，所以八篇长文的字不压首屏——**改文件名会让长文的字漏进首屏分片，直接撑爆预算**。JetBrains Mono 只切拉丁 ASCII，挂在 `code`/`pre` 上，首页没有代码块，浏览器不会去下它。

`src/lib/page-title.ts` 在 `HEAD_OWNED` 里，三个作用域一起跳过：它里面的 `title` 与 `meta description` 一个字都不上屏，标签栏与搜索结果摘要都不经过我们的 `@font-face`。**别往那个文件塞会渲染的界面文案。**

`docs` 分片排在 `lab` 前面。两组有 30 个字重叠，`unicode-range` 不许交叠，排在后面的那组要用这些字就得连带下前一组整份分片——`/docs` 是正式路由，`?lab=1` 是内部验收页，让验收页多背。**这个顺序写在 `subset-fonts.ts` 的循环里，别调。**

首屏字体由 `scripts/prerender.ts` 打 `<link rel=preload>`，按文件名前缀选（文件名带内容指纹，每次构建都变）。前缀表在那个脚本里，**改了 `subset-fonts.ts` 的输出文件名就要同步改前缀表**，对不上时构建直接 `exit(1)`。首页预载六份，`/docs` 那几页额外三份——无差别预载会让首页凭空多下 92 KB。

### 项目截图

```bash
npm run shots:build                      # 从主站默认路径取图
npm run shots:build -- --src=D:/other    # 换源目录
```

产物 `public/images/stage/` 与清单 `src/data/shots.generated.ts` **已提交进仓库**，构建期不跑这个脚本，也不依赖主站仓库存在。占位图是构建期出的 20px 内联 WebP，不是 blurhash——后者要在运行时用 canvas 解码。

### 部署

`.github/workflows/deploy.yml` 已写好但**不启用**——只有 `workflow_dispatch`，没有 push 触发。
本工程全程本地开发，仓库没有 remote。真要上线时按文件头那三步做。

`public/.nojekyll` 必须在，否则 GitHub Pages 会吃掉 `_` 开头的资源目录。

`sitemap.xml` 与 `robots.txt` 由 `scripts/prerender.ts` 出，不手写。逐页 `title` 与
`meta description` 都从 `src/lib/page-title.ts` 算，预渲染与客户端换路由共用一份。
OG 只出文本项，没有 `og:image`——本站没有 1200×630 配图，理由见 spec 第 8 节。

## 声明

站内全部角色为**原创虚构化名**，不指代任何真实社员，亦不使用任何第三方作品的角色名与美术资产。全部立绘为本工程内原创矢量绘制。

项目截图素材复用自社团官网仓库，为社团自有作品。
