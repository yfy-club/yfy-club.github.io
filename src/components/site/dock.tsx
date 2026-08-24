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
import { useCallback } from 'react'
import { Mascot } from '@/components/mascot'
import type { MascotFx } from '@/components/mascot/fx'
import type { MascotState } from '@/components/mascot/states'
import { NAVI } from '@/data/characters'
import { playClick, playPoke } from '@/lib/sound'
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
  const scrollToTop = useCallback(() => {
    playPoke()
    playClick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <aside
      className="dock"
      data-visible={visible}
      role="button"
      tabIndex={visible ? 0 : -1}
      title="点击向导快速返回顶部"
      onClick={scrollToTop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          scrollToTop()
        }
      }}
    >
      <span className="dock-code">{NAVI.codename}</span>
      <span className="dock-portrait">
        <Mascot character={NAVI} state={state} fx={fx} crop="bust" />
      </span>
      <span className="dock-romaji">{NAVI.romaji}</span>
    </aside>
  )
}
