/**
 * 顶部导航条。
 *
 * 全站唯二允许 backdrop-filter 的地方之一（另一处是 M6 的弹幕输入浮层）。
 * 规格 2.5 第 1 条，别往别处抄。
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Diamond } from '@/components/hud'
import './site.css'

const CLUB_SITE = 'https://www.yunfeiyang.tech'
const GITHUB_ORG = 'https://github.com/yfy-club'

/*
 * 全部写成带路径的绝对地址，走 Link 而不是 a：
 * 在 /docs 上点「方向」时纯 hash 锚点找不到 #tracks，人会停在原地。
 * 档案库自 M5 起是独立路由，不再是首页的一个分区。
 */
const LINKS = [
  { to: '/#tracks', label: '方向' },
  { to: '/#projects', label: '项目' },
  { to: '/docs', label: '档案库' },
] as const

export function Nav() {
  const lifted = useScrolled(24)

  return (
    <header className="nav" data-lifted={lifted}>
      <div className="nav-inner shell">
        <Link className="nav-brand" to="/">
          <Diamond tone="pink" />
          <span className="nav-brand-zh">云飞扬</span>
          <span className="nav-brand-hud">YFY PORTAL</span>
        </Link>

        <nav className="nav-links" aria-label="站内导航">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
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
