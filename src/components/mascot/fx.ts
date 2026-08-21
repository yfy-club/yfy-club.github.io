/**
 * 悬停方向卡的联动特效。规格 3.4，含 M4 修正记录。
 *
 * 观看位是右侧的向导挂件，不是 Hero 立绘——Hero 滚出画面后立绘不在屏上，
 * 把特效挂在那儿等于写死代码。修正记录在 spec 3.4。
 *
 * 只用三个通道，不往骨架里加新 path：
 *   tone   瞳内映色。覆盖 --iris-color，120ms 过渡进出
 *   halo   halo 反应。五种各不相同，全部作用在既有的 m-halo 组上
 *   scarf  领巾扬起。叠在惯性位移之上
 *
 * 五张卡的反应必须各不相同（规格原文的要求），差别由 halo 通道承担：
 * NAVI 的 halo 是细环加指针，同一个环做五种不同的动作，比给每张卡画一套新图层便宜。
 */
import type { TrackSlug } from '@/data/characters'

/** halo 的五种反应。真实语义命名，CSS 里按 data-fx-halo 分派。 */
export type HaloReaction = 'node' | 'spin' | 'sink' | 'wave' | 'spark'

export interface MascotFx {
  /** 瞳内映色。取角色主调令牌名，不写 hex。 */
  tone: string
  halo: HaloReaction
  /** 领巾要不要扬起。 */
  scarf: boolean
}

/**
 * 逐条对应 spec 3.4 那张表，语义不变，落点从研究员自己的立绘换成向导：
 *   ORACLE 神经节点顺序点亮   → node
 *   WEAVER 齿轮转动 + 领巾扬起 → spin + scarf
 *   VAULT  三层同心环沉降      → sink
 *   RELAY  向外扩散三圈信号    → wave
 *   FORGE  琥珀火花            → spark
 */
export const TRACK_FX: Record<TrackSlug, MascotFx> = {
  ai: { tone: 'var(--char-oracle-accent)', halo: 'node', scarf: false },
  software: { tone: 'var(--char-weaver-accent)', halo: 'spin', scarf: true },
  database: { tone: 'var(--char-vault-accent)', halo: 'sink', scarf: false },
  'cloud-iot': { tone: 'var(--char-relay-accent)', halo: 'wave', scarf: true },
  industrial: { tone: 'var(--char-forge-accent)', halo: 'spark', scarf: false },
}

/** 项目展台的 SURPRISE 瞳内映色跟随当前展台主调（spec 4.3.2 最后一句）。 */
export const stageFx = (tone: string): MascotFx => ({ tone, halo: 'wave', scarf: false })
