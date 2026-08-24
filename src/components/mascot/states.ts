/**
 * 状态集。
 *
 * 老版本这里是七态**差分表**：每个状态一组眼睑 / 眉 / 嘴 / 腮红的 path。
 * 那套东西的前提是脸由我们自己画。换成 NovelAI 栅格立绘后表情已经烘死在图里，
 * 差分表整张作废（spec M8 修正记录），只留下状态枚举本身。
 *
 * 状态现在驱动的是**整体动作**，不是五官：
 *   FOCUS / SMILE / THINK  进区时的身体微姿态（mascot.css 的 .m-pose）
 *   SURPRISE               轻跳 + halo 脉冲
 *   POUT                   连点三次的弹性形变 + halo 抖
 *   IDLE_DAZE              呼吸放缓、halo 转速降一档
 *
 * 眨眼没了：栅格图眨不了眼。想找回来要么给六人各补一张闭眼图做 overlay，
 * 要么上 mesh 形变，都不是改这个文件能解决的事。
 */

export const MASCOT_STATES = [
  'NEUTRAL',
  'FOCUS',
  'SURPRISE',
  'THINK',
  'SMILE',
  'IDLE_DAZE',
  'POUT',
  'DIZZY',
] as const

export type MascotState = (typeof MASCOT_STATES)[number]

/** 一句话说清这个状态在表达什么。验收页按它标注，改动作前先确认还符合这句话。 */
export const STATE_INTENT: Record<MascotState, string> = {
  NEUTRAL: '待机。只有呼吸与惯性视差。',
  FOCUS: '专注。身体沉一点、halo 收紧，读作咬住了目标。',
  SURPRISE: '意外。整体轻跳，halo 向外脉冲一次，400ms 后回落至 SMILE。',
  THINK: '思索。身体微倾，halo 慢转，读作偏头。',
  SMILE: '愉快。轻微放大，halo 亮一档。',
  IDLE_DAZE: '发呆。呼吸拉长、下沉，halo 转速降一档。',
  POUT: '鼓脸。被连点三次，弹性形变一次并抖 halo。',
  DIZZY: '晕眩。狂戳多次后进入不倒翁摇摆，Halo 超高速暴风自转，1.8s 后回落至 SMILE。',
}
