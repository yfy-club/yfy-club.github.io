/**
 * 弹幕输入浮层与回执。规格 5.4。
 *
 * 全站唯二允许 backdrop-filter 的第二处（另一处是导航条本身）。规格 2.5 第 1 条。
 * 别往第三个地方抄。
 *
 * placeholder 与 toast 都必须写明「仅保存在你的浏览器，别人看不到」，
 * 这是防「假互动」欺骗的硬要求，措辞不许弱化。
 */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Diamond } from '@/components/hud'
import { MAX_LEN, lengthOf, sanitize, sendDanmaku } from './store'
import './danmaku.css'

/** 唯一的免责措辞。placeholder 与 toast 共用一份，防止两处走样。 */
export const DISCLAIMER = '仅保存在你的浏览器，别人看不到'

interface ComposerProps {
  /**
   * 点到这个元素之外才算「点外面」。
   * 传导航条的工具区：开浮层的那枚按钮也在里面，否则再点它会先关后开，闪一下。
   */
  boundary: RefObject<HTMLElement | null>
  /** 关闭浮层。发送成功时带上正文，交给调用方弹回执。 */
  onClose: (sent?: string) => void
}

export function DanmakuComposer({ boundary, onClose }: ComposerProps) {
  const [text, setText] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    /*
     * 用 pointerdown 而不是 click：click 要等抬手，
     * 在浮层外按下再拖回浮层内抬手会漏判。
     */
    const onDown = (e: PointerEvent) => {
      if (!boundary.current?.contains(e.target as Node)) onClose()
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [boundary, onClose])

  const clean = sanitize(text)
  const left = MAX_LEN - lengthOf(text)

  return (
    <div className="dm-composer" role="dialog" aria-label="发一条弹幕">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const sent = sendDanmaku(text)
          if (!sent) return
          setText('')
          onClose(sent)
        }}
      >
        <label className="dm-label" htmlFor="dm-input">
          发一条弹幕
        </label>

        <div className="dm-field">
          <input
            id="dm-input"
            ref={input}
            className="dm-input"
            type="text"
            autoComplete="off"
            /*
             * maxLength 按 UTF-16 码元算，emoji 这类代理对占两格。
             * 卡在 40 码元只会比 40 码点更严，永远不会让计数出现负数；
             * 真正的口径统一在 sanitize 里，那边按码点截。
             */
            maxLength={MAX_LEN}
            placeholder={DISCLAIMER}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="dm-send" type="submit" disabled={!clean}>
            发送
          </button>
        </div>

        <p className="dm-meta">
          <span>还能输入 {left} 字</span>
          <span className="dm-note">
            <Diamond tone="pink" />
            {DISCLAIMER}
          </span>
        </p>
      </form>
    </div>
  )
}

/* ---------------------------------------------------------------------- */

interface ToastProps {
  text: string
}

/** 提交回执。由调用方定时撤掉。 */
export function DanmakuToast({ text }: ToastProps) {
  return (
    <p className="dm-toast" role="status">
      <span className="dm-toast-head">已发送</span>
      <span className="dm-toast-body">{text}</span>
      <span className="dm-toast-note">{DISCLAIMER}</span>
    </p>
  )
}
