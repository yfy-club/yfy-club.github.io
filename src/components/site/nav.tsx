/**
 * 顶部导航条。
 *
 * 全站唯二允许 backdrop-filter 的地方之一（另一处是弹幕输入浮层，见 danmaku.css）。
 * 规格 2.5 第 1 条，别往别处抄。
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Diamond } from '@/components/hud'
import { onScrollFrame, requestScrollFrame, scrollY } from '@/lib/scroll-frame'
import { NavTools } from './nav-tools'
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

        <NavTools />
      </div>
      <div className="nav-rail" aria-hidden="true" />
    </header>
  )
}

/**
 * 滚过阈值才给导航条上背景，首屏保持完全通透。
 *
 * 走共用滚动帧而不是自己挂 scroll + rAF：首页滚动时同时在跑的订阅者有五个，
 * 各排一个 rAF 会把单帧耗时抽成锯齿状，见 lib/scroll-frame.ts 的文件头。
 */
function useScrolled(threshold: number) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const off = onScrollFrame('read', () => {
      const next = scrollY() > threshold
      setOn((prev) => (prev === next ? prev : next))
    })
    requestScrollFrame()
    return off
  }, [threshold])
  return on
}
