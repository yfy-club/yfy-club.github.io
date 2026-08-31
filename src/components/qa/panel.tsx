/**
 * 向导问答面板。规格 3.6（M9 新增）。
 *
 * 样式硬约束，与挂件同一条：**切角面板 + 1px 描边 + --bg-paper 实色**。
 * 不许毛玻璃——全站只准两处 backdrop-filter（导航条与弹幕输入浮层，规格 2.5 第 1 条），
 * 配额已经用满，a11y-probe 的 forbidden 组在数。别照抄 .dm-composer。
 *
 * 空态就是提示框本体：两句能力说明 + 四条预设问题 + 输入框。
 * 不写「你好，有什么可以帮你」这类客服开场白——这里是 HUD，不是工单系统。
 *
 * 诚实口径沿用弹幕那套（规格 5.4 的防「假互动」要求同源）：
 * AI 会错、档案条款以原文为准、问题会发到自建服务，三条都写在界面上，不许弱化。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Diamond, Rail } from '@/components/hud'
import { QA_KIND_NOTE, QA_PROMPTS } from '@/data/qa-prompts'
import { playClick } from '@/lib/sound'
import { useStore } from '@/lib/store'
import { MarkdownRenderer } from './markdown'
import { MAX_QUESTION, dismissTip, qaStore, resetQa } from './store'
import { abortAsk, ask } from './stream'
import './qa.css'

/** 唯一的免责措辞。面板底与首访提示共用一份，防止两处走样。 */
export const QA_DISCLAIMER = 'AI 生成，可能有误；档案条款以原文为准'

/** 问题去哪儿了，必须说清楚。规格 5.4 同源的诚实要求。 */
export const QA_PRIVACY = '问题会发送到社团自建的模型服务处理'

interface PanelProps {
  onClose: () => void
}

export function QaPanel({ onClose }: PanelProps) {
  const qa = useStore(qaStore)
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)

  const busy = qa.status === 'pending' || qa.status === 'streaming'

  useEffect(() => {
    input.current?.focus()
  }, [])

  /*
   * Esc 关面板，并把焦点还给开它的那枚按钮。
   * 不还焦点的话读屏用户按完 Esc 会掉回文档开头，得从头 Tab 一遍。
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (expanded) {
        setExpanded(false)
        return
      }
      onClose()
      document.querySelector<HTMLButtonElement>('.dock-ask')?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, expanded])

  /*
   * 关面板即取消在途请求。
   * 不取消的话流会继续往 store 里追加，人重新打开时看到一段自己已经放弃的回答。
   */
  useEffect(() => () => abortAsk(), [])

  // 流式追加时把记录区钉在底部。用 scrollTop 而不是 scrollIntoView——
  // 后者会把整个页面一起滚，面板是 fixed 的，页面不该动。
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [qa.turns, qa.status])

  const submit = useCallback((q: string) => {
    if (!q.trim()) return
    playClick()
    dismissTip()
    setText('')
    void ask(q)
  }, [])

  const handleNewChat = useCallback(() => {
    playClick()
    abortAsk()
    resetQa()
    setText('')
    input.current?.focus()
  }, [])

  const empty = qa.turns.length === 0

  return (
    <section
      className={`qa ${expanded ? 'is-expanded' : ''}`}
      id="qa-panel"
      aria-label="向 NAVI 提问"
    >
      <header className="qa-head">
        <div className="qa-head-title">
          <span className="qa-head-hud" aria-hidden="true">
            ASK NAVI
          </span>
          {expanded && (
            <span className="qa-badge-expanded" aria-hidden="true">
              EXPANDED
            </span>
          )}
        </div>

        <div className="qa-head-actions">
          {qa.turns.length > 0 && (
            <button
              type="button"
              className="qa-head-btn qa-head-new"
              onClick={handleNewChat}
              aria-label="开启新对话并轮换模型"
              title="开启新对话"
            >
              <span className="qa-btn-icon" aria-hidden="true">
                ↺
              </span>
              <span>新对话</span>
            </button>
          )}

          <button
            type="button"
            className="qa-head-btn qa-head-expand"
            onClick={() => {
              playClick()
              setExpanded((v) => !v)
            }}
            aria-label={expanded ? '还原面板大小' : '放大面板'}
            title={expanded ? '还原 (Esc)' : '放大'}
          >
            <span className="qa-expand-icon" aria-hidden="true">
              {expanded ? '🗗' : '🗖'}
            </span>
          </button>

          <button
            type="button"
            className="qa-close"
            onClick={() => {
              playClick()
              onClose()
            }}
            aria-label="关闭问答"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <Rail />

      <div className="qa-log" ref={log}>
        {empty ? (
          <div className="qa-empty">
            <p className="qa-empty-note">
              <Diamond />
              {QA_KIND_NOTE.concept}
            </p>
            <p className="qa-empty-note">
              <Diamond tone="pink" />
              {QA_KIND_NOTE.archive}
            </p>

            <ul className="qa-prompts">
              {QA_PROMPTS.map((p) => (
                <li key={p.text}>
                  <button
                    type="button"
                    className="qa-prompt"
                    data-kind={p.kind}
                    onClick={() => submit(p.text)}
                  >
                    <Diamond tone={p.kind === 'archive' ? 'pink' : 'sky'} />
                    <span>{p.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          /*
           * role=log + aria-live=polite：流式输出逐 token 追加，
           * assertive 会把读屏打断成一串碎字。aria-busy 期间读屏按整句节流播报。
           */
          <div className="qa-turns" role="log" aria-live="polite" aria-busy={busy}>
            {qa.turns.map((turn, i) => (
              <article className="qa-turn" key={i}>
                <p className="qa-q">
                  <span className="qa-q-hud" aria-hidden="true">
                    Q
                  </span>
                  {turn.q}
                </p>

                {turn.a && (
                  <div className="qa-answer">
                    <MarkdownRenderer content={turn.a} />
                  </div>
                )}

                {i === qa.turns.length - 1 && qa.status === 'pending' && (
                  <p className="qa-wait">
                    <span aria-hidden="true">NAVI 正在想</span>
                    <span className="sr-only">正在等待回答</span>
                  </p>
                )}

                {turn.cites.length > 0 && (
                  <nav className="qa-cites" aria-label="相关篇目">
                    <span className="qa-cites-hud" aria-hidden="true">
                      ARCHIVE
                    </span>
                    <ul>
                      {turn.cites.map((c) => (
                        <li key={`${c.slug}#${c.anchor}`}>
                          <Link
                            className="qa-cite"
                            to={`/docs/${c.slug}#${c.anchor}`}
                            onClick={onClose}
                          >
                            <span className="qa-cite-title">{c.title}</span>
                            <span className="qa-cite-sec">{c.heading}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </article>
            ))}

            {qa.error && (
              <p className="qa-error" role="status">
                {qa.error}
              </p>
            )}
          </div>
        )}
      </div>

      <form
        className="qa-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(text)
        }}
      >
        <label className="sr-only" htmlFor="qa-input">
          你的问题
        </label>
        <div className="qa-field">
          <input
            id="qa-input"
            ref={input}
            className="qa-input"
            type="text"
            autoComplete="off"
            maxLength={MAX_QUESTION}
            placeholder="问点什么…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
          />
          <button className="qa-send" type="submit" disabled={busy || !text.trim()}>
            {busy ? '…' : '问'}
          </button>
        </div>

        <p className="qa-note">
          <Diamond tone="pink" />
          <span>
            {QA_DISCLAIMER}。{QA_PRIVACY}。
          </span>
        </p>
      </form>
    </section>
  )
}

/* ---------------------------------------------------------------------- */

interface TipProps {
  onAsk: () => void
}

/**
 * 首访一次性提示。读过写 localStorage，此后不再出。
 *
 * 必须等挂载完才渲染：读过没有只有浏览器知道，
 * 预渲染产物里出现它必然注水错位。真值由 store 的 initQa() 在 effect 里补，
 * 首帧一律 tip=false，所以这里不用再判 mounted。
 */
export function QaTip({ onAsk }: TipProps) {
  const tip = useStore(qaStore).tip

  // 12 秒还没人理就自己收掉，但不写 localStorage——下次进站再提一次
  useEffect(() => {
    if (!tip) return
    const timer = window.setTimeout(() => qaStore.set({ ...qaStore.get(), tip: false }), 12000)
    return () => window.clearTimeout(timer)
  }, [tip])

  if (!tip) return null

  return (
    <p className="qa-tip">
      <button type="button" className="qa-tip-body" onClick={onAsk}>
        点这里可以问我
      </button>
      <button type="button" className="qa-tip-x" onClick={dismissTip} aria-label="不再提示">
        <span aria-hidden="true">✕</span>
      </button>
    </p>
  )
}
