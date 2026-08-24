import { docBySlug } from '@/data/docs'

const SITE = '云飞扬开源传送门'

/**
 * 逐页 head。标题与 meta description 都在这里算。
 *
 * 预渲染写进静态页（scripts/prerender.ts），客户端换路由时同一份函数再算一遍——
 * 两边共用这一份，不许各写一套，否则刷新出来的标题和点进去的标题会不一样。
 *
 * 这个文件里的中文一个字都不上屏：title 归浏览器标签栏，description 只进 head。
 * 所以它在 scripts/subset-fonts.ts 的 HEAD_OWNED 里被三个作用域一起跳过，
 * 加文案不吃字体预算。别往这里塞会渲染的界面文案。
 */
export function pageTitle(pathname: string) {
  if (pathname === '/docs') return `开发者档案库 · ${SITE}`

  const doc = pathname.startsWith('/docs/')
    ? docBySlug(pathname.slice('/docs/'.length))
    : undefined

  return doc ? `${doc.title} · ${SITE}` : SITE
}

/** 首页那句。index.html 里的 meta 与这里必须一致，改一处要改两处。 */
const HOME_DESCRIPTION =
  '云飞扬社团的开源项目矩阵与开发者档案库。让年轻的想法，变成可运行的开源工程。'

const DOCS_DESCRIPTION =
  '开发者档案库：涵盖阶段学习路线、开发工具链配置与团队工程约定，助力成员快速上手。'

/**
 * 逐页 meta description。
 *
 * 长文直接用成稿的 summary——它本来就是一句话讲清这篇讲什么，
 * 另写一份摘要必然跟正文漂移。summary 都在 60 字以内，不用截断。
 */
export function pageDescription(pathname: string) {
  if (pathname === '/docs') return DOCS_DESCRIPTION

  const doc = pathname.startsWith('/docs/')
    ? docBySlug(pathname.slice('/docs/'.length))
    : undefined

  return doc ? `${doc.summary}（开发者档案库 · ${doc.minutes} 分钟）` : HOME_DESCRIPTION
}
