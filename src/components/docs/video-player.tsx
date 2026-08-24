/**
 * 开发者档案库 · 视频预览与剧场播放器。
 * 融合 cult-ui 的 youtube-video-player 与 hover-video-player 交互：
 *   1. 封面悬浮微动效与渐变遮罩
 *   2. 点击即时就地播放（按需挂载 iframe，首屏零额外请求）
 *   3. 独立剧场模式模态框（支持表格内胶囊按钮唤起）
 *   4. 支持 YouTube 与 Bilibili 双源播放及直达外链
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface VideoTarget {
  provider: 'youtube' | 'bilibili'
  id: string
  title?: string | undefined
  bvid?: string | undefined
}

export interface VideoPlayerProps {
  provider: 'youtube' | 'bilibili'
  id: string
  title?: string | undefined
  bvid?: string | undefined
}

export function VideoPlayer({ provider, id, title = '视频教程', bvid }: VideoPlayerProps) {
  const [expanded, setExpanded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isYouTube = provider === 'youtube'

  const embedUrl = isYouTube
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
    : `https://player.bilibili.com/player.html?bvid=${id}&autoplay=1&high_quality=1`

  const directUrl = isYouTube
    ? `https://www.youtube.com/watch?v=${id}`
    : `https://www.bilibili.com/video/${id}`

  const thumbnailUrl = isYouTube ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPlaying(true)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <>
      <div
        className="doc-video-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="doc-video-header">
          <div className="doc-video-tags">
            <span className={`doc-video-badge ${isYouTube ? 'is-yt' : 'is-bili'}`}>
              {isYouTube ? 'YOUTUBE' : 'BILIBILI'}
            </span>
            {bvid && bvid !== id && (
              <span className="doc-video-badge is-bili">B站中字: {bvid}</span>
            )}
          </div>
          <span className="doc-video-title">{title}</span>
          <div className="doc-video-actions">
            <button
              type="button"
              className="doc-video-btn"
              onClick={toggleExpand}
              title={expanded ? '缩小' : '剧场模式'}
              aria-label={expanded ? '缩小' : '剧场模式'}
            >
              {expanded ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              )}
            </button>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="doc-video-btn"
              title="在原平台打开"
              aria-label="在原平台打开"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="doc-video-viewport">
          {!playing ? (
            <div className="doc-video-preview" onClick={handlePlay}>
              {thumbnailUrl ? (
                <motion.img
                  src={thumbnailUrl}
                  alt={title}
                  className="doc-video-thumb"
                  animate={{ scale: isHovered ? 1.03 : 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <div className="doc-video-fallback-thumb">
                  <span className="doc-video-fallback-text">{title}</span>
                </div>
              )}
              <div className="doc-video-scrim" />

              <motion.button
                type="button"
                className="doc-video-play-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="播放视频"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </motion.button>
              <span className="doc-video-play-tip">点击预览</span>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="doc-video-iframe"
            />
          )}
        </div>
      </div>

      <VideoModal
        video={expanded ? { provider, id, title, bvid } : null}
        onClose={() => setExpanded(false)}
      />
    </>
  )
}

/**
 * 剧场模式模态框组件，可由卡片展开或表格胶囊按钮直接唤起。
 */
export function VideoModal({
  video,
  onClose,
}: {
  video: VideoTarget | null
  onClose: () => void
}) {
  const isYouTube = video?.provider === 'youtube'

  const embedUrl = video
    ? isYouTube
      ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.bilibili.com/player.html?bvid=${video.id}&autoplay=1&high_quality=1`
    : ''

  const directUrl = video
    ? isYouTube
      ? `https://www.youtube.com/watch?v=${video.id}`
      : `https://www.bilibili.com/video/${video.id}`
    : ''

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && video) {
        onClose()
      }
    }
    if (video) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [video, onClose])

  return (
    <AnimatePresence>
      {video && (
        <div className="doc-video-modal-root">
          <motion.div
            className="doc-video-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="doc-video-modal-container">
            <motion.div
              className="doc-video-modal-card"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="doc-video-modal-header">
                <div className="doc-video-modal-meta">
                  <span className={`doc-video-badge ${isYouTube ? 'is-yt' : 'is-bili'}`}>
                    {isYouTube ? 'YOUTUBE' : 'BILIBILI'}
                  </span>
                  <span className="doc-video-modal-title">{video.title || '视频预览'}</span>
                </div>
                <div className="doc-video-actions">
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-video-btn"
                    title="在原平台打开"
                    aria-label="在原平台打开"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    className="doc-video-btn"
                    onClick={onClose}
                    title="关闭 (Esc)"
                    aria-label="关闭模态框"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="doc-video-modal-body">
                <iframe
                  src={embedUrl}
                  title={video.title || '视频播放器'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="doc-video-iframe"
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
