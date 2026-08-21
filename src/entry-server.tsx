/**
 * 预渲染入口。只有 scripts/prerender.ts 用它，不进客户端包。
 *
 * 为什么要有这个文件：GitHub Pages 是纯静态托管，没有 SPA fallback，
 * /docs/git-flow 直接刷新会 404。构建期把每条路由渲成静态页顶上去。
 * 见 spec 第 8 节的 M5 修正记录。
 *
 * 顺带满足规格第 6 节的「无 JS 时输出静态 HTML 骨架，内容可读」——
 * 所以段落的虚焦必须是 JS 加上去的，CSS 默认态得是实焦，否则没 JS 的人看到一屏糊字。
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { DOCS } from './data/docs'
import { pageTitle } from './lib/page-title'

/** 要出静态页的路由。/ 与 /docs 各一张，八篇各一张。 */
export const ROUTES: readonly string[] = ['/', '/docs', ...DOCS.map((d) => `/docs/${d.slug}`)]

export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )

  return { html, title: pageTitle(url) }
}
