# 云飞扬开源传送门

面向 `https://yfy-club.github.io/` 的独立站点工程——一个把社团技术方向、开源项目与开发者档案用二次元游戏化语汇重新讲一遍的极客传送门。与官网 `www.yunfeiyang.tech` 定位互补，不做内容副本。

## 当前状态

**M5 · 档案库完成。** 全屏舞台、五张方向角色卡、三个项目视差展台、向导驻留挂件、`/docs` 开发者档案库均已落地。

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
| `npm run check:contrast` | 20 项色彩对比度，直接从 `tokens.css` 读色值实测 |
| `npm run fonts:subset` | 重切中文子集并核对首屏字体预算（160 KB） |
| `npm run build` | 生产构建 + 十条路由预渲染 |

### 文档

- [docs/design-spec.md](docs/design-spec.md) — 设计规格书（色彩令牌、字阶、角色系统、差分状态机、页面结构、动效参数、性能预算）
- [docs/content-docs.md](docs/content-docs.md) — 开发者档案库内容成稿（3 分类 8 篇）
- [docs/music-sources.md](docs/music-sources.md) — 合规 BGM 音源渠道清单

### 档案库内容

```bash
npm run docs:build
```

`src/data/docs.ts` 由 `scripts/build-docs.ts` 从 `docs/content-docs.md` 生成，**已提交进仓库，不要手改**。改内容改成稿再跑这条命令。

代码块的语法高亮是构建期用 Shiki 出的：产物 HTML 里只有 `tk-k` / `tk-s` / `tk-c` 三个 class，颜色留在 `docs.css` 里引令牌。`shiki` 只在 `devDependencies`，运行时零成本，不进包。高亮色是硬编码在产物里的，`check:contrast` 扫不到，对 `--bg-sunk` 的实测值记在 spec 4.4 的 M5 修正记录二，改色先回去改那张表。

### 路由与预渲染

`/`、`/docs`、`/docs/:id` 三条路由。GitHub Pages 没有 SPA fallback，`/docs/git-flow` 直接刷新会 404，所以 `npm run build` 之后由 `scripts/prerender.ts` 给每条路由各出一张静态页（共 10 张），顺带满足「无 JS 时内容可读」。段落的虚焦是 JS 加上去的，CSS 默认态是实焦——反过来写的话没 JS 的人会看到一屏糊字。

### 字体

中文子集产物 `src/assets/fonts/` 与 `src/styles/fonts.css` 由 `scripts/subset-fonts.ts` 生成，**需要提交进仓库**，否则拉下来的人跑 build 会缺字。改了界面文案后跑一次 `npm run fonts:subset`。

语料按三个作用域切片，`unicode-range` 互不重叠：`ui` 随页面加载，`lab`（验收页）与 `docs`（长文）按需下载。700 只装标题类字段的字，正文独有的字剔掉——见 `BODY_ONLY_FIELDS`。新增正文字段往那里加一行，不要抬 `BUDGET_KB`。

`src/data/docs.ts` 在 `DOCS_OWNED` 里，扫 `ui` 时跳过，所以八篇长文的字不压首屏——**改文件名会让长文的字漏进首屏分片，直接撑爆预算**。JetBrains Mono 只切拉丁 ASCII，挂在 `code`/`pre` 上，首页没有代码块，浏览器不会去下它。

### 项目截图

```bash
npm run shots:build                      # 从主站默认路径取图
npm run shots:build -- --src=D:/other    # 换源目录
```

产物 `public/images/stage/` 与清单 `src/data/shots.generated.ts` **已提交进仓库**，构建期不跑这个脚本，也不依赖主站仓库存在。占位图是构建期出的 20px 内联 WebP，不是 blurhash——后者要在运行时用 canvas 解码。

## 声明

站内全部角色为**原创虚构化名**，不指代任何真实社员，亦不使用任何第三方作品的角色名与美术资产。全部立绘为本工程内原创矢量绘制。

项目截图素材复用自社团官网仓库，为社团自有作品。
