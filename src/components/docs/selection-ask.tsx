/**
 * 划词向向导提问浮动按钮。
 *
 * 规范约束：
 * - 纯 --bg-paper 实色底 + 1px 细线框，严禁使用 backdrop-filter；
 * - 无表情符号；
 * - 点击后将选中的概念或代码自动填入向导问答面板并展开。
 */
import { useEffect, useRef, useState } from 'react'
import { Diamond } from '@/components/hud'
import { openQa } from '@/components/qa/store'
import { playClick } from '@/lib/sound'

interface Position {
  x: number
  y: number
  text: string
}

export function SelectionAsk() {
  const [pos, setPos] = useState<Position | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        // 如果点击的是我们自己的按钮则先不清除
        return
      }

      const text = selection.toString().trim()
      // 过滤太短或太长的无效划词
      if (text.length < 2 || text.length > 200) {
        setPos(null)
        return
      }

      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const el = container instanceof Element ? container : container.parentElement

      // 仅在正文区域内的选区触发
      if (!el || !el.closest('.docs-main')) {
        setPos(null)
        return
      }

      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setPos(null)
        return
      }

      // 计算浮动按钮在视口中的位置（选区正上方中点）
      setPos({
        x: rect.left + rect.width / 2,
        y: Math.max(12, rect.top - 36),
        text,
      })
    }

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // 点击非按钮区域时收起
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return
      }
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setPos(null)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  if (!pos) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playClick()
    const promptText = `请帮我详细解析这部分内容：\n“${pos.text}”`
    openQa(promptText)
    setPos(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className="doc-selection-ask"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      onClick={handleClick}
      aria-label={`向 NAVI 提问选中的内容: ${pos.text.slice(0, 20)}`}
    >
      <Diamond tone="sky" />
      <span>问 NAVI</span>
    </button>
  )
}
