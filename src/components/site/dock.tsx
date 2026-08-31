/**
 * 向导驻留挂件。规格 3.4 的 M4 修正记录 + 3.6 的 M9 修正记录。
 *
 * Hero 出画后 NAVI 缩成右侧固定小挂件常驻，联动特效与进区状态都演在它身上。
 * 原规格把两者挂在 Hero 立绘上，但 `.hero` 是 100dvh 且立绘 align-self: end，
 * 滚到 #tracks 时 Hero 已经整块出画——那是看不见的动作。
 *
 * 空槽实测：1440 视口 .shell 外边距 60 + --content-pad 72 = 左右各 132px；
 * 1280 只有 64px；1760 以上 308px。所以挂件宽 148px，且 width < 1360 直接隐藏。
 * 窄屏只隐藏 DOM，状态机照常跑，宽屏一放大立刻看得见。
 *
 * 样式硬约束：切角面板 + 1px 描边 + --bg-paper 实色。
 * 不许圆头像、不许阴影、不许毛玻璃，否则读成客服气泡。
 *
 * M9：挂件从「整块一个 role=button 回顶」拆成**两枚平级的真实 button**。
 *
 *   立绘键 .dock-top   凹陷底，点了回顶。行为与 M4 完全一致，悬停才浮出 ↑ TOP 角标。
 *   问答键 .dock-ask   实心底，点了开问答面板。常驻写着「问 NAVI」，不靠悬停才被发现。
 *
 * 为什么不做成「点外框问答、点立绘回顶」：外框左右只剩 12px，低于 WCAG 2.5.8 的
 * 24px 目标尺寸，而且不悬停完全看不出有两种点法。一凹一凸是全站既有的读法
 * （代码块凹陷=可看的内容，Hero 主按钮实心=要点的动作），静态截图里就分得清。
 *
 * 为什么两枚按钮必须平级：<button> 不许嵌套可交互元素。原来的
 * <aside role="button"> 里再放按钮是同一类违规，读屏会把两个名字念成一坨。
 * aside 因此退成纯容器，code / romaji 两行转 aria-hidden——它们是装饰标签，
 * 语义由两枚按钮各自的可访问名承担。
 */
import { useCallback, useEffect } from 'react'
import { Mascot } from '@/components/mascot'
import type { MascotFx } from '@/components/mascot/fx'
import type { MascotState } from '@/components/mascot/states'
import { Diamond } from '@/components/hud'
import { QaPanel, QaTip } from '@/components/qa/panel'
import { QA_ENABLED, closeQa, initQa, qaStore, toggleQa } from '@/components/qa/store'
import { NAVI } from '@/data/characters'
import { smoothScrollToTop } from '@/lib/smooth-scroll'
import { playClick, playExpand, playPoke } from '@/lib/sound'
import { useStore } from '@/lib/store'
import './dock.css'

interface MascotDockProps {
  /** 页面算好的状态。进区切 FOCUS / SMILE / THINK（spec 3.3）。 */
  state: MascotState
  /** 联动特效。null = 没有，此时反向播放回默认态。 */
  fx: MascotFx | null
  /** Hero 还在视口里就不出挂件——同一个人不该同时出现两次。 */
  visible: boolean
}

/**
 * 问答进行中盖掉进区状态。规格 3.3 的现成枚举，不新增状态。
 *
 *   pending    等首个 token —— THINK，偏头思索
 *   streaming  正在吐字     —— FOCUS，咬住目标
 *   done       答完         —— SMILE，900ms 后由状态机自己回落
 *   error      限流 / 上游错 —— SURPRISE，400ms 后回落至 SMILE
 *
 * idle（面板开着但还没问）不在表里：那时候她该照常演当前分区的状态。
 */
const QA_STATE: Partial<Record<string, MascotState>> = {
  pending: 'THINK',
  streaming: 'FOCUS',
  done: 'SMILE',
  error: 'SURPRISE',
}

export function MascotDock({ state, fx, visible }: MascotDockProps) {
  const qa = useStore(qaStore)

  // 读过首访提示没有只有浏览器知道，必须等挂载后再补，否则注水错位
  useEffect(() => initQa(), [])

  const backToTop = useCallback(() => {
    playPoke()
    playClick()
    // 走 smooth-scroll 模块：浏览器原生的 behavior: 'smooth' 会与 lenis 的惯性同时写滚动位置
    smoothScrollToTop()
  }, [])

  const ask = useCallback(() => {
    playExpand()
    toggleQa()
  }, [])

  /*
   * 面板打开时立绘停掉戳击互动。
   * 不停的话戳三下的 POUT / 五下的 DIZZY 会抢掉答题态（THINK / FOCUS / SMILE），
   * 而这时人点立绘的意图是回顶，不是逗她。
   */
  const tabbable = visible ? 0 : -1
  const shown = QA_STATE[qa.status] ?? state

  return (
    <>
      <aside className="dock" data-visible={visible}>
        <span className="dock-code" aria-hidden="true">
          {NAVI.codename}
        </span>

        {/* 立绘键：回到顶部。M4 的原有手势，一行不改。 */}
        <button type="button" className="dock-top" tabIndex={tabbable} onClick={backToTop}>
          <span className="sr-only">返回顶部</span>
          <Mascot
            character={NAVI}
            state={shown}
            fx={fx}
            crop="bust"
            interactive={!qa.open}
          />
          <span className="dock-top-hud" aria-hidden="true">
            ↑ TOP
          </span>
        </button>

        <span className="dock-romaji" aria-hidden="true">
          {NAVI.romaji}
        </span>

        {/*
         * 问答键。端点没配置就整枚不出——规格 5.5 的「不留死按钮」，
         * 与「音频文件不在时不出声音开关」同一条道理。
         *
         * aria-controls 只在面板真的在 DOM 里时才给：
         * ARIA 要求 IDREF 指向存在的元素，指一个不存在的 id 会让读屏报“引用破损”。
         */}
        {QA_ENABLED && (
          <button
            type="button"
            className="dock-ask"
            tabIndex={tabbable}
            aria-expanded={qa.open}
            {...(qa.open ? { 'aria-controls': 'qa-panel' } : {})}
            onClick={ask}
          >
            <Diamond />
            <span>问 NAVI</span>
          </button>
        )}
      </aside>

      {/*
       * 提示与面板都在 aside 外面，原因有两条：
       *
       *   1. aside 有 clip-path（右上切角）。**clip-path 会裁剪后代**——
       *      提示框绝对定位在挂件框左外侧时，getBoundingClientRect 与 isVisible()
       *      都正常，但屏幕上一个像素都没有。M9 靠截图才发现，别再搬回去。
       *   2. aside 在 width < 1360 是 display: none，搁里面会被一起吃掉。
       *
       * 两者自己都是 position: fixed，窄屏各自另有落位。
       */}
      {QA_ENABLED && visible && !qa.open && <QaTip onAsk={ask} />}
      {QA_ENABLED && qa.open && <QaPanel onClose={closeQa} />}
    </>
  )
}
