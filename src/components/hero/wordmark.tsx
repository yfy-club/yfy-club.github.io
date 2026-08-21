/**
 * 首屏竖排巨标题。
 *
 * 三个字走 900 微分片（scripts/subset-fonts.ts 的 WORDMARK），实测约 2 KB。
 * 改字先改那边的语料常量，否则新字是豆腐块。
 *
 * 不用 writing-mode: vertical-rl —— 那个模式下中文标点与字距要靠 text-orientation
 * 二次矫正，且没法给单字加进入延迟。直接一字一行，锚点精确到每个字。
 */

const CHARS = ['云', '飞', '扬'] as const

interface WordmarkProps {
  className?: string
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <h1 className={['wordmark', className].filter(Boolean).join(' ')}>
      {/* 屏幕阅读器读这一行，下面的分字只是排版 */}
      <span className="wordmark-sr">云飞扬</span>
      {CHARS.map((ch, i) => (
        <span key={ch} className="wordmark-glyph" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
          {ch}
        </span>
      ))}
    </h1>
  )
}
