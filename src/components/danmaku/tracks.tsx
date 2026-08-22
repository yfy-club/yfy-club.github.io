/**
 * 弹幕轨道层。规格 5.4：Hero 上方 4 条轨道，13px，单次穿屏 28–42s。
 *
 * 位置见 tokens.css 的 --z-danmaku：弹幕沉在内容之下、粒子之上，
 * 从字标与立绘背后穿过。这是 M6 对规格的修正，原值 30 会压到脸上。
 *
 * 动画是纯 CSS 关键帧，没有一行 JS 跑在每帧上——四条轨道二十几个元素，
 * 用 rAF 逐帧改 transform 会跟粒子光场抢那 4ms 的帧预算。
 *
 * 整层 aria-hidden：这是环境装饰，逐条念给读屏用户没有意义。
 * 自己发的那条由提交后的 toast 负责回执。
 */
import type { CSSProperties } from 'react'
import { Diamond } from '@/components/hud'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useStore } from '@/lib/store'
import { danmakuStore } from './store'
import './danmaku.css'

export function DanmakuTracks() {
  const { on, items } = useStore(danmakuStore)
  const reduced = useReducedMotion()

  // 规格第 6 节：减弱动效下弹幕整个关掉，不是放慢
  if (!on || reduced || items.length === 0) return null

  return (
    <div className="danmaku" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className="danmaku-item"
          data-own={item.own}
          style={
            {
              '--dm-track': item.track,
              '--dm-dur': `${item.duration}s`,
              '--dm-delay': `${item.delay}s`,
            } as CSSProperties
          }
        >
          {item.own && <Diamond tone="pink" />}
          {item.text}
        </span>
      ))}
    </div>
  )
}
