/**
 * 导航条右侧的两枚开关：弹幕与声音。
 *
 * 三条硬规矩：
 *   1. 全部等挂载完再渲染。开关状态来自 localStorage、音频文件在不在要探测、
 *      减弱动效偏好只有浏览器知道——预渲染产物里出现它们必然注水错位。
 *   2. 减弱动效下不出弹幕开关。规格第 6 节要求弹幕整个关掉，
 *      留一枚点了没反应的按钮跟规格 5.5 的「不留死按钮」是同一条道理。
 *   3. 音频文件不在时不出声音开关。在不在是构建期扫的，见 vite.config.ts。规格 5.5。
 *
 * 弹幕只活在首页 Hero 上，所以开关也只在 / 出现；BGM 是全站的，一直在。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { Diamond } from '@/components/hud'
import { DanmakuComposer, DanmakuToast } from '@/components/danmaku/composer'
import { danmakuStore, initDanmaku, setDanmakuOn } from '@/components/danmaku/store'
import { useMounted } from '@/lib/use-mounted'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useStore } from '@/lib/store'
import { isSoundEnabled, playClick, toggleSound } from '@/lib/sound'
import { bgmStore, initBgm, setBgmOn } from './bgm'

/** 回执停留时长，毫秒。够读完两行，又不至于赖着不走。 */
const TOAST_MS = 3600

export function NavTools() {
  const mounted = useMounted()
  const reduced = useReducedMotion()
  const danmaku = useStore(danmakuStore)
  const bgm = useStore(bgmStore)
  const onHome = useLocation().pathname === '/'
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())

  const tools = useRef<HTMLDivElement>(null)
  const [composing, setComposing] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    initDanmaku()
    initBgm()
  }, [])

  // 关掉弹幕、或离开首页，就把浮层一起收掉，别让它孤零零挂在导航条下面
  useEffect(() => {
    if (!danmaku.on || !onHome) setComposing(false)
  }, [danmaku.on, onHome])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast])

  const closeComposer = useCallback((sent?: string) => {
    setComposing(false)
    if (sent) setToast(sent)
  }, [])

  if (!mounted) return null

  const showDanmaku = onHome && !reduced

  return (
    <div className="nav-tools" ref={tools}>
      {showDanmaku && (
        <>
          <button
            className="nav-toggle"
            type="button"
            aria-pressed={danmaku.on}
            onClick={() => setDanmakuOn(!danmaku.on)}
          >
            <Diamond tone={danmaku.on ? 'pink' : 'ink'} />
            弹幕
          </button>

          {danmaku.on && (
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={composing}
              onClick={() => setComposing((open) => !open)}
            >
              发一条
            </button>
          )}
        </>
      )}

      {bgm.src && (
        <button
          className="nav-toggle"
          type="button"
          aria-pressed={bgm.on}
          onClick={() => setBgmOn(!bgm.on)}
        >
          <Diamond tone={bgm.on ? 'pink' : 'ink'} />
          BGM
        </button>
      )}

      <button
        className="nav-toggle"
        type="button"
        aria-pressed={soundOn}
        title="开启 / 关闭科幻交互微音效"
        onClick={() => {
          const next = toggleSound()
          setSoundOn(next)
          if (next) playClick()
        }}
      >
        <Diamond tone={soundOn ? 'pink' : 'ink'} />
        音效
      </button>

      {composing && <DanmakuComposer boundary={tools} onClose={closeComposer} />}
      {!composing && toast && <DanmakuToast text={toast} />}
    </div>
  )
}
