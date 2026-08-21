/**
 * 向导驻留挂件。规格 3.4 的 M4 修正记录。
 *
 * Hero 出画后 NAVI 缩成右侧固定小挂件常驻，联动特效与进区状态都演在它身上。
 * 原规格把两者挂在 Hero 立绘上，但 `.hero` 是 100dvh 且立绘 align-self: end，
 * 滚到 #tracks 时 Hero 已经整块出画——那是看不见的动作。
 *
 * 空槽实测：1440 视口 .shell 外边距 60 + --content-pad 72 = 左右各 132px；
 * 1280 只有 64px；1760 以上 308px。所以挂件宽 120px，且 width < 1360 直接隐藏。
 * 窄屏只隐藏 DOM，状态机照常跑，宽屏一放大立刻看得见。
 *
 * 样式硬约束：切角面板 + 1px 描边 + --bg-paper 实色。
 * 不许圆头像、不许阴影、不许毛玻璃，否则读成客服气泡。
 */
import { Mascot } from '@/components/mascot'
import type { MascotFx } from '@/components/mascot/fx'
import type { MascotState } from '@/components/mascot/expressions'
import { NAVI } from '@/data/characters'
import './dock.css'

interface MascotDockProps {
  /** 页面算好的状态。进区切 FOCUS / SMILE / THINK（spec 3.3）。 */
  state: MascotState
  /** 联动特效。null = 没有，此时反向播放回默认态。 */
  fx: MascotFx | null
  /** Hero 还在视口里就不出挂件——同一个人不该同时出现两次。 */
  visible: boolean
}

export function MascotDock({ state, fx, visible }: MascotDockProps) {
  return (
    <aside className="dock" data-visible={visible} aria-hidden="true">
      <span className="dock-code">{NAVI.codename}</span>
      <span className="dock-portrait">
        <Mascot character={NAVI} state={state} fx={fx} crop="bust" />
      </span>
      {/*
        不把状态名当标签显示。
        SURPRISE 持续 400ms 后由状态机自己回落到 SMILE（spec 3.3），
        标签读的是传进来的值，会一直写着 SURPRISE 而脸已经在笑。实测过。
      */}
      <span className="dock-romaji">{NAVI.romaji}</span>
    </aside>
  )
}
