# 署名

本站自有内容（文案、矢量立绘、代码）不需要外部署名。这份文件只用来登记**放进来的第三方素材**。

---

## BGM

暂无。`public/audio/` 是空的，页面上的声音开关处于隐藏状态。

放入曲目后，如果它的许可证要求署名，改两处：

1. 把下面这张表填上；
2. 把 `src/data/credits.ts` 的 `BGM_CREDIT` 从 `null` 改成一行字符串，格式 `BGM: 曲名 — 作者（来源站点 / 许可证）`。页脚会自动多出这一行。

| 曲名 | 作者 | 来源 | 许可证 | 下载日期 |
|---|---|---|---|---|
| —— | —— | —— | —— | —— |

音源渠道与筛选标准见 [music-sources.md](music-sources.md)，转码命令也在那里。
**游戏原声、扒站音频、来路不明的二创一律不要**，那一节写得很清楚。

## 音效

本版不做 UI 点击音效（规格 5.5）。

## 字体

| 字体 | 许可证 |
|---|---|
| Noto Sans SC | SIL Open Font License 1.1 |
| Chakra Petch | SIL Open Font License 1.1 |
| JetBrains Mono | SIL Open Font License 1.1 |

三份都经 `scripts/subset-fonts.ts` 重新切片，OFL 允许子集化与再分发，产物随仓库提交。

## 图片

`public/images/stage/` 的项目截图取自社团官网仓库，为社团自有作品。
