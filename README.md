# 云飞扬开源传送门

面向 `https://yfy-club.github.io/` 的独立站点工程——一个把社团技术方向、开源项目与开发者档案用二次元游戏化语汇重新讲一遍的极客传送门。与官网 `www.yunfeiyang.tech` 定位互补，不做内容副本。

## 当前状态

**M1 · 骨架完成。** 设计令牌、HUD 原子组件、字体子集管线、质量门禁、样板间验收页已落地。角色立绘与页面内容尚未编写。

```bash
npm ci
npm run dev      # http://localhost:5173
npm run check    # typecheck → 对比度 → 字体子集与预算 → 生产构建
```

`npm run dev` 打开的是设计系统样板间，把规格书里的数值全部摆出来供肉眼比对。M3 起被真正的首屏替换。

### 门禁

| 命令 | 卡什么 |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run check:contrast` | 14 项色彩对比度，直接从 `tokens.css` 读色值实测 |
| `npm run fonts:subset` | 重切中文子集并核对首屏字体预算（160 KB） |
| `npm run build` | 生产构建 |

### 文档

- [docs/design-spec.md](docs/design-spec.md) — 设计规格书（色彩令牌、字阶、角色系统、差分状态机、页面结构、动效参数、性能预算）
- [docs/content-docs.md](docs/content-docs.md) — 开发者档案库内容成稿（3 分类 8 篇）
- [docs/music-sources.md](docs/music-sources.md) — 合规 BGM 音源渠道清单

### 字体

中文子集产物 `src/assets/fonts/` 与 `src/styles/fonts.css` 由 `scripts/subset-fonts.ts` 生成，**需要提交进仓库**，否则拉下来的人跑 build 会缺字。改了界面文案后跑一次 `npm run fonts:subset`。

## 声明

站内全部角色为**原创虚构化名**，不指代任何真实社员，亦不使用任何第三方作品的角色名与美术资产。全部立绘为本工程内原创矢量绘制。
