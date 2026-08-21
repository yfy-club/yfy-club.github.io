/**
 * 顶部导航条。
 *
 * 全站唯二允许 backdrop-filter 的地方之一（另一处是 M6 的弹幕输入浮层）。
 * 规格 2.5 第 1 条，别往别处抄。
 */
import { useEffect, useState } from 'react'
import { Diamond } from '@/components/hud'
import './site.css'

const CLUB_SITE = 'https://www.yunfeiyang.tech'
const GITHUB_ORG = 'https://github.com/yfy-club'

const LINKS = [
  { href: '#tracks', label: '方向' },
  { href: '#projects', label: '项目' },
  { href: '#docs', label: '档案库' },
] as const

export function Nav() {
  const lifted = useScrolled(24)

  return (
    <header className="nav" data-lifted={lifted}>
      <div className="nav-inner shell">
        <a className="nav-brand" href="#hero">
          <Diamond tone="pink" />
          <span className="nav-brand-zh">云飞扬</span>
          <span className="nav-brand-hud">YFY PORTAL</span>
        </a>

        <nav className="nav-links" aria-label="站内导航">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-side">
          <a className="nav-out" href={GITHUB_ORG} target="_blank" rel="noreferrer">
            GITHUB ↗
          </a>
          <a className="nav-out" href={CLUB_SITE} target="_blank" rel="noreferrer">
            官网 ↗
          </a>
        </div>
      </div>
      <div className="nav-rail" aria-hidden="true" />
    </header>
  )
}

/** 滚过阈值才给导航条上背景，首屏保持完全通透。 */
function useScrolled(threshold: number) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const fn = () => setOn(window.scrollY > threshold)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return on
}
