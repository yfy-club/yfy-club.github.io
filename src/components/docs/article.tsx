/**
 * 长文渲染。src/data/docs.ts 的块结构 → DOM。
 *
 * 段落与三级标题带 data-focus-unit，交给 use-focus-scroll 做虚焦聚焦。
 * 表格、代码块、摘要不参与：它们含 --ink-600 与等宽小字，
 * 在 opacity .7 下只有 3.32:1，过不了 AA。见 spec 4.4 的 M5 修正记录一。
 */
import { Fragment, useState } from 'react'
import type { DocBlock, DocInline } from '@/data/docs'
import { VideoPlayer, VideoModal, type VideoTarget } from './video-player'

export function DocBlocks({ blocks }: { blocks: readonly DocBlock[] }) {
  const [activeVideo, setActiveVideo] = useState<VideoTarget | null>(null)

  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} onOpenVideo={setActiveVideo} />
      ))}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </>
  )
}

function Block({
  block,
  onOpenVideo,
}: {
  block: DocBlock
  onOpenVideo: (target: VideoTarget) => void
}) {
  switch (block.kind) {
    case 'h3':
      return (
        <h2 className="doc-h3" id={block.id} data-focus-unit="">
          {block.text}
        </h2>
      )

    case 'h4':
      // 标签是 h3（篇名 h1、节标题 h2，不能跳级），字号按正文阶加粗。
      // 不进目录树也不做锚点，不给 data-focus-unit。
      return <h3 className="doc-h4">{block.text}</h3>

    case 'para':
      return (
        <p className="doc-para" data-focus-unit="">
          {block.lines.map((line, i) => (
            <span className="doc-line" key={i}>
              <Runs runs={line} onOpenVideo={onOpenVideo} />
            </span>
          ))}
        </p>
      )

    case 'code':
      return (
        <DocCodeBlock
          lang={block.lang}
          html={block.html}
          raw={block.raw}
        />
      )

    case 'details':
      // 折叠区内部是完整的块序列（段落、代码块、表格），递归走同一套渲染。
      return (
        <details className="doc-details">
          <summary className="doc-details-summary">{block.title}</summary>
          <div className="doc-details-body">
            <DocBlocks blocks={block.blocks} />
          </div>
        </details>
      )

    case 'table':
      return (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                {block.head.map((cell, i) => (
                  <th key={i} scope="col">
                    <Runs runs={cell} onOpenVideo={onOpenVideo} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <Runs runs={cell} onOpenVideo={onOpenVideo} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'iframe':
      return (
        <div className="doc-iframe-wrap">
          <iframe
            className="doc-iframe"
            src={block.src}
            title={block.title || 'Video Player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )

    case 'video':
      return (
        <VideoPlayer
          provider={block.provider}
          id={block.id}
          title={block.title}
          bvid={block.bvid}
        />
      )
  }
}

function DocCodeBlock({
  lang,
  html,
  raw,
}: {
  lang?: string | undefined
  html: string
  raw?: string | undefined
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const textToCopy =
        raw ||
        html
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时静默降级
    }
  }

  return (
    <div className="doc-code">
      <div className="doc-code-head">
        <span className="doc-code-lang">{lang ? lang.toUpperCase() : 'TEXT'}</span>
        <button
          type="button"
          className="doc-code-copy-btn"
          onClick={handleCopy}
          title={copied ? '已复制' : '复制代码'}
          aria-label={copied ? '已复制' : '复制代码'}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="doc-pre">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

/**
 * 识别 B 站与 YouTube 视频链接
 */
function parseVideoLink(href: string): { provider: 'youtube' | 'bilibili'; id: string } | null {
  if (!href) return null

  // Bilibili link: https://www.bilibili.com/video/BV...
  const biliMatch = href.match(/bilibili\.com\/(?:video|player\.html\?bvid=)\/(BV[0-9a-zA-Z]+)/i) ||
                    href.match(/bvid=(BV[0-9a-zA-Z]+)/i) ||
                    href.match(/(BV[0-9a-zA-Z]{10})/i)
  if (biliMatch && biliMatch[1]) {
    return { provider: 'bilibili', id: biliMatch[1] }
  }

  // YouTube link: https://www.youtube.com/watch?v=... or https://youtu.be/...
  const ytMatch = href.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)
  if (ytMatch && ytMatch[1]) {
    return { provider: 'youtube', id: ytMatch[1] }
  }

  return null
}

function Runs({
  runs,
  onOpenVideo,
}: {
  runs: readonly DocInline[]
  onOpenVideo: (target: VideoTarget) => void
}) {
  return (
    <>
      {runs.map((run, i) => {
        if (run.t === 'code') return <code key={i}>{run.v}</code>
        if (run.t === 'strong') return <strong key={i}>{run.v}</strong>
        if (run.t === 'link') {
          const videoInfo = parseVideoLink(run.href || '')
          return (
            <a
              key={i}
              href={run.href}
              target="_blank"
              rel="noopener noreferrer"
              className="doc-link"
              onClick={
                videoInfo
                  ? (e) => {
                      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault()
                        onOpenVideo({
                          provider: videoInfo.provider,
                          id: videoInfo.id,
                          title: run.v,
                        })
                      }
                    }
                  : undefined
              }
              title={videoInfo ? `点击预览：${run.v}` : undefined}
            >
              {run.v}
            </a>
          )
        }
        return <Fragment key={i}>{run.v}</Fragment>
      })}
    </>
  )
}
