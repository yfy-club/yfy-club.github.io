/**
 * 立绘摆位。栅格立绘换掉矢量骨架后（spec M8 修正记录），这个文件是唯一的摆位真值。
 *
 * 老骨架的 halo 是写死常量（`HALO = {cx240 cy88 rx78}`），因为那时头是自己画的，
 * 头顶在哪、颅有多宽都由 geometry.ts 说了算。现在头是 NovelAI 出的栅格图，
 * 摆位必须反过来——从图里量，再把 halo 摆上去。
 *
 * 量什么、怎么量在 scripts/build-portraits.ts，结果在 src/data/portraits.generated.ts。
 * 这里只做一件事：把那些归一化的测量值换算成 viewBox 用户单位。
 *
 * 六张源图是同一次批量生成的，画幅比例 0.671~0.687、内容四边全部出血，
 * 框取本来就一致。所以**不按人缩放**：六人共用同一个图框宽度，
 * 只用测量值做两件事——横向对齐头中线，以及给每个人摆各自的 halo。
 * 按颅宽归一化试过，RELAY 的发量比别人大一圈（颅宽 85.5% vs 68~75%），
 * 归一化会把她整个人缩小 13%，五张方向卡并排时脸明显比别人小。
 */
import { PORTRAITS, type PortraitId } from '@/data/portraits.generated'

export const VIEW_W = 480
export const VIEW_H = 560

/** 图框宽度。480 里占 400，左右各留 40 给 halo 与道具的溢出。 */
const IMG_W = 400

/**
 * 发顶对齐到这一行。六人的发顶落在画幅 8.9%~15.5%，各不相同，
 * 对齐它而不是对齐画幅顶，halo 才能六人同高。
 * 130 是余量算出来的：halo 上缘 = 130 − lift − ry，最大的 RELAY 是 66，还剩 66 的余量。
 */
const HAIR_TOP_Y = 130

/** halo 环宽 / 颅宽。1.04 让环略宽于头，不然会被头发压成勒进去的箍。 */
const HALO_SPAN = 1.04

/* 透视扁率不在这里：它烘在 emblem.tsx 的 `HALO.ry / HALO.rx = 20 / 78`（0.256）里，
   这里给的是等比缩放，扁率跟着一起搬过去，不会被改变。 */

/** halo 中心抬到发顶之上多少，按环宽取比例。抬完下弧仍会压进头发，纵深靠这段重叠。 */
const HALO_LIFT = 0.1

export interface MascotPlacement {
  /** `<img>` 在 viewBox 里的位置与宽度。高度由图片自身比例决定，不写死。 */
  img: { x: number; y: number; w: number; h: number }
  /** halo authoring 空间（geometry.HALO）到这个人头顶的仿射变换。 */
  halo: { x: number; y: number; scale: number }
  /** 道具锚点。挂在头右上的空域，按实测颅宽让开头发。 */
  prop: { x: number; y: number; scale: number }
}

/** geometry.HALO 的 authoring 值。emblem.tsx 全部画在这个坐标系里。 */
const AUTHOR = { cx: 240, cy: 88, rx: 78 } as const

export function placement(id: PortraitId): MascotPlacement {
  const p = PORTRAITS[id]

  const imgW = IMG_W
  const imgH = (IMG_W * p.height) / p.width
  // 头中线对到画框中线。六张图的头并不都在正中（47.7%~51.5%）。
  const imgX = VIEW_W / 2 - p.headCenterX * imgW
  const imgY = HAIR_TOP_Y - p.hairTop * imgH

  const haloRx = ((p.skullWidth * imgW) / 2) * HALO_SPAN
  const scale = haloRx / AUTHOR.rx
  const haloCx = VIEW_W / 2
  const haloCy = HAIR_TOP_Y - haloRx * HALO_LIFT

  return {
    img: { x: imgX, y: imgY, w: imgW, h: imgH },
    // translate 后 scale：把 authoring 的 (cx,cy) 搬到目标点再等比放大。
    // 描边挂了 vector-effect="non-scaling-stroke"，放大不会把线条一起撑粗。
    halo: { x: haloCx - AUTHOR.cx * scale, y: haloCy - AUTHOR.cy * scale, scale },
    prop: {
      /*
       * 停在 halo 右上的空域。
       *
       * 这批立绘是 Q 版比例，头几乎撑满画框，「右上角」是整幅里唯一的空地——
       * 发顶之上、halo 右端之外那一块。摆在别处都会压在头发上，读成贴纸。
       * 所以横向从环右端再外推 42，且不越过画框右边 40 的安全边；
       * 纵向抬到发顶之上，环越大抬得越高。
       */
      x: Math.min(VIEW_W / 2 + haloRx + 42, VIEW_W - 40),
      y: HAIR_TOP_Y - haloRx * 0.3,
      scale: 0.9,
    },
  }
}

/**
 * 两种取景。
 *
 * `full` 是整个画框；`bust` 收到头肩，给挂件和小卡用。
 * 老代码的 bust 是 `88 32 304 440`——那是拿老矢量的 getBBox 量出来的，
 * 新立绘四边全部出血，那个框会把左右两侧头发直接削掉。
 *
 * 现在六人的头已经对齐到同一处（头中线 240、发顶 130、图框宽 400），
 * bust 因此可以是一个常量框，四条边都是算出来的：
 *   上 48  最矮的 halo 上缘是 RELAY 的 66，波纹放大到 1.25 时到 55，留 7 的余量
 *   左右   横向包住最宽的 RELAY（发量 85.5% × 400 = 342，占 69~411）
 *   下 478 六人在这一行都落在肩胸，切在这里才叫 bust；切 452 只剩一张脸
 */
export const CROP_BOX = {
  full: { x: 0, y: 0, w: VIEW_W, h: VIEW_H },
  bust: { x: 30, y: 36, w: 420, h: 470 },
} as const

export type MascotCrop = keyof typeof CROP_BOX

export const viewBoxOf = (crop: MascotCrop) => {
  const b = CROP_BOX[crop]
  return `${b.x} ${b.y} ${b.w} ${b.h}`
}
