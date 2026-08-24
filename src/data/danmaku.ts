/**
 * 预置弹幕。规格 5.4：社团技术梗与真实开发者开发日常。
 *
 * 文案是真实语义的开发者自嘲与日常写照。严禁 Emoji，严禁中二黑话。
 *
 * 字段名 `text` 列在 scripts/subset-fonts.ts 的 BODY_ONLY_FIELDS 里：
 * 弹幕永远是 13px 常规字重，从不粗体渲染，700 那份子集把这里的独有字整个剔掉。
 */

export interface DanmakuPreset {
  /** 弹幕正文。上限 40 字，与用户输入同一条规则。 */
  text: string
}

export const DANMAKU_PRESETS: readonly DanmakuPreset[] = [
  { text: '又被 CSS 居中打败的一天' },
  { text: '这个 bug 昨天还不在' },
  { text: '本地跑得好好的' },
  { text: '提交信息写 fix 的人自己回来看' },
  { text: '合并冲突解到一半忘了改过什么' },
  { text: '谁把 node_modules 提交上来了' },
  { text: '文档写完了 在脑子里' },
  { text: '改一行 构建三分钟' },
  { text: '周五下午不要部署' },
  { text: '变量名想了十分钟' },
  { text: '新人第一次 push 到 main' },
  { text: '明天一定重构' },
  { text: '它能跑就千万别碰它' },
  { text: '在代码里留了个 TODO 从此再也没动过' },
  { text: '问就是缓存问题 强制刷新试试' },
  { text: '控制台打印了八个 11111' },
  { text: '以为是死循环 原来是网络超时' },
  { text: '谁把数据库密码硬编码进去了' },
  { text: '写代码五分钟 找错半小时' },
  { text: '注释写着 别动 动了就会崩' },
  { text: '学完指针 感觉脑子需要 free 一下' },
  { text: 'Git rebase 把自己整迷路了' },
  { text: '线上报错 本地无法复现' },
  { text: '需求很明确 只要稍微改一下' },
]
