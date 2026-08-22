/**
 * 页脚。规格 4.5：Rail 分隔 → 三列 → 底部版权与虚构声明。
 *
 * 事实性数据（获奖、成员规模、招新时间）不在本站维护，一律引导跳主站。
 */
import { Link } from 'react-router'
import { Rail } from '@/components/hud'
import { BGM_CREDIT } from '@/data/credits'
import './site.css'

const COLUMNS = [
  {
    title: '本站',
    items: [
      { label: '方向档案', href: '/#tracks' },
      { label: '项目展台', href: '/#projects' },
      { label: '开发者档案库', href: '/docs' },
    ],
  },
  {
    title: '社团官网',
    items: [
      { label: '云飞扬 yunfeiyang.tech ↗', href: 'https://www.yunfeiyang.tech', out: true },
      { label: '加入我们 ↗', href: 'https://www.yunfeiyang.tech/join', out: true },
    ],
  },
  {
    title: '开源',
    items: [{ label: 'github.com/yfy-club ↗', href: 'https://github.com/yfy-club', out: true }],
  },
] as const

export function Footer() {
  return (
    <footer className="foot">
      <Rail />
      <div className="foot-inner shell">
        {COLUMNS.map((col) => (
          <section key={col.title} className="foot-col">
            <h2 className="foot-title">{col.title}</h2>
            <ul>
              {col.items.map((item) => (
                <li key={item.href}>
                  {'out' in item && item.out ? (
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.href}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="foot-base shell">
        <span>本站角色均为虚构化名，不指代任何真实社员。</span>
        {/* 曲子要求署名才出现这一行。空着就没有，见 src/data/credits.ts */}
        {BGM_CREDIT && <span>{BGM_CREDIT}</span>}
        <span className="foot-hud">YFY OPEN SOURCE PORTAL</span>
      </div>
    </footer>
  )
}
