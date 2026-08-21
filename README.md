# 云飞扬开源传送门

面向 `https://yfy-club.github.io/` 的独立站点工程——一个把社团技术方向、开源项目与开发者档案用二次元游戏化语汇重新讲一遍的极客传送门。与官网 `www.yunfeiyang.tech` 定位互补，不做内容副本。

## 当前状态

**M4 · 主体完成。** 全屏舞台、五张方向角色卡、三个项目视差展台、向导驻留挂件已落地。`/docs` 档案库是 M5 的活。

```bash
npm ci
npm run dev      # http://localhost:5173
npm run check    # typecheck → 对比度 → 字体子集与预算 → 生产构建
```

`?lab=1` 是 M2 的立绘验收页，六人 × 七态全部摆出来供肉眼比对。

### 门禁

| 命令 | 卡什么 |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run check:contrast` | 20 项色彩对比度，直接从 `tokens.css` 读色值实测 |
| `npm run fonts:subset` | 重切中文子集并核对首屏字体预算（160 KB） |
| `npm run build` | 生产构建 |

### 文档

- [docs/design-spec.md](docs/design-spec.md) — 设计规格书（色彩令牌、字阶、角色系统、差分状态机、页面结构、动效参数、性能预算）
- [docs/content-docs.md](docs/content-docs.md) — 开发者档案库内容成稿（3 分类 8 篇）
- [docs/music-sources.md](docs/music-sources.md) — 合规 BGM 音源渠道清单

### 字体

中文子集产物 `src/assets/fonts/` 与 `src/styles/fonts.css` 由 `scripts/subset-fonts.ts` 生成，**需要提交进仓库**，否则拉下来的人跑 build 会缺字。改了界面文案后跑一次 `npm run fonts:subset`。

语料按三个作用域切片，`unicode-range` 互不重叠：`ui` 随页面加载，`lab`（验收页）与 `docs`（长文）按需下载。700 只装标题类字段的字，正文独有的字剔掉——见 `BODY_ONLY_FIELDS`。新增正文字段往那里加一行，不要抬 `BUDGET_KB`。

### 项目截图

```bash
npm run shots:build                      # 从主站默认路径取图
npm run shots:build -- --src=D:/other    # 换源目录
```

产物 `public/images/stage/` 与清单 `src/data/shots.generated.ts` **已提交进仓库**，构建期不跑这个脚本，也不依赖主站仓库存在。占位图是构建期出的 20px 内联 WebP，不是 blurhash——后者要在运行时用 canvas 解码。

## 声明

站内全部角色为**原创虚构化名**，不指代任何真实社员，亦不使用任何第三方作品的角色名与美术资产。全部立绘为本工程内原创矢量绘制。

项目截图素材复用自社团官网仓库，为社团自有作品。
