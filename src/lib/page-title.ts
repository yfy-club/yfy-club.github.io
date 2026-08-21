import { docBySlug } from '@/data/docs'

const SITE = '云飞扬开源传送门'

/**
 * 逐页标题。
 *
 * 预渲染写进静态页的 <title>，客户端换路由时同一个函数再算一遍——
 * 两边共用这一份，不许各写一套，否则刷新出来的标题和点进去的标题会不一样。
 */
export function pageTitle(pathname: string) {
  if (pathname === '/docs') return `开发者档案库 · ${SITE}`

  const doc = pathname.startsWith('/docs/')
    ? docBySlug(pathname.slice('/docs/'.length))
    : undefined

  return doc ? `${doc.title} · ${SITE}` : SITE
}
