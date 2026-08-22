/**
 * 构建期预渲染 + sitemap + robots。
 *
 *   npm run build        （vite build 之后自动跑这一步）
 *
 * GitHub Pages 是纯静态托管，没有 SPA fallback：直接访问 /docs/git-flow 或在那页按 F5，
 * 服务器找不到 docs/git-flow/index.html 就返回 404。这里给每条路由各出一张静态页顶上去。
 * 顺带满足规格第 6 节的「无 JS 时输出静态 HTML 骨架，内容可读」。
 * 取舍过程见 docs/design-spec.md 第 8 节的 M5 修正记录。
 *
 * 每张页面注入三样 head：逐页 title、逐页 meta description、canonical。
 * 三样都从 src/lib/page-title.ts 算，客户端换路由时用同一份函数，不许各写一套。
 *
 * 产物直接落在 dist/ 里，客户端 main.tsx 见到 #root 已有内容就走 hydrateRoot。
 * SSR 中间产物 dist-ssr/ 跑完就删，不上线也不进仓库。
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SSR_DIR = join(ROOT, 'dist-ssr')

/** 组织站点的线上源。sitemap 与 canonical 都要绝对地址，相对路径搜索引擎不认。 */
const ORIGIN = 'https://yfy-club.github.io'

/** 客户端产物里被替换的锚点。Vite 不动 index.html 的这一行。 */
const MOUNT = '<div id="root"></div>'

/** index.html 里那条兜底 description。逐页注入时整条换掉。 */
const DESC_RE = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/

/**
 * 注水脚本降到低优先级。
 *
 * 静态页的内容已经在 HTML 里了，JS 只负责注水与交互——它不参与首屏出字。
 * 但 type=module 默认是 High 优先级，会跟字体、CSS 抢那 1.6 Mbps 的带宽：
 * M7 实测模拟节流下 149 KB 的包把首屏字体挤到 25ms 之后才发出，FCP 1810ms。
 * 降到 Low 之后字体与 CSS 先走，FCP 912ms，而 TTI 2918 → 2919ms，一毫秒都没退。
 *
 * 只改优先级，不加 defer 也不改 async：module 脚本本来就是 defer 语义，
 * 换 async 会让注水在 DOM 还没齐的时候开跑。
 */
const SCRIPT_RE = /<script type="module" (?!fetchpriority)/

/**
 * 首屏字体预载。
 *
 * 不加这个的话字体在关键请求链上排到第三层：HTML → CSS → @font-face 解析 → woff2。
 * M7 实测移动端模拟节流下 FCP 2859ms，字体请求在 120ms 才发出，前面 120ms 全在等
 * CSS 下完再解析。预载把它们提到跟 CSS 同一批发出，FCP 降到 1960ms，Performance 88 → 92。
 *
 * 只列 woff2：Chakra Petch 的 .woff 是给不支持 woff2 的浏览器兜底的，
 * 预载它等于给所有现代浏览器多下 27 KB。
 *
 * 按前缀选，不写 hash——文件名带 Vite 的内容指纹，每次构建都变。
 *
 * `noto-sans-sc-wordmark-900` 不在这张表里：它只有 1.2 KB，
 * 低于 assetsInlineLimit 的 2048，Vite 已经把它内联成 data URI 了，没有文件可预载。
 */
const PRELOAD_ALL = [
  'noto-sans-sc-cjk-400-ui',
  'noto-sans-sc-cjk-700-ui',
  'noto-sans-sc-latin-400',
  'noto-sans-sc-latin-700',
  'chakra-petch-latin-500-normal',
  'chakra-petch-latin-600-normal',
]

/**
 * 只有 /docs 那几页要的分片。
 *
 * 长文与代码块的字全在这三份里，首页一个字都用不到——
 * 无差别预载会让首页凭空多下 92 KB，把 7.2 节按作用域切片省下来的量原封不动还回去。
 */
const PRELOAD_DOCS = [
  'noto-sans-sc-cjk-400-docs',
  'noto-sans-sc-cjk-700-docs',
  'jetbrains-mono-latin',
]

interface Entry {
  ROUTES: readonly string[]
  render: (url: string) => { html: string; title: string; description: string }
}

/** HTML 属性值转义。文案里出现引号或尖括号会直接把 meta 标签撕开。 */
const attr = (s: string) =>
  s
    .split('&')
    .join('&amp;')
    .split('"')
    .join('&quot;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')

/** 从 dist/assets/ 里按前缀挑出带指纹的字体文件，产出 preload 标签。 */
function preloads(files: readonly string[], prefixes: readonly string[]) {
  const picked = prefixes.map((p) => files.find((f) => f.startsWith(p) && f.endsWith('.woff2')))

  const missing = prefixes.filter((_, i) => !picked[i])
  if (missing.length > 0) {
    console.error(`dist/assets 里找不到这些字体分片：${missing.join(' ')}`)
    console.error('改过 scripts/subset-fonts.ts 的文件名就要同步改这里的前缀表。')
    process.exit(1)
  }

  return picked
    .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
    .join('\n    ')
}

/**
 * 逐页 head。
 *
 * Open Graph 只出文本三项，不出 og:image。
 * 没有配图时给一张占位图或干脆指向 favicon，抓取端会拿到一张 1:1 的小图当卡片主视觉，
 * 比没有 image 时退化成的纯文本卡片更难看。twitter:card 同理取 summary 而不是
 * summary_large_image——后者明确要求 ≥300x157 的图。
 * 要做大图卡就得先有一张 1200x630 的配图，那是设计工作，不是构建脚本能变出来的。
 */
function head(route: string, title: string, description: string) {
  const url = `${ORIGIN}${route === '/' ? '/' : `${route}/`}`
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="云飞扬开源传送门" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
  ].join('\n    ')
}

/**
 * sitemap。十条路由全列，`lastmod` 取构建日期。
 *
 * 不写 changefreq 与 priority：Google 十年前就公开说这两个字段一律忽略，
 * 填了只是给自己一份要维护的假数据。
 */
function sitemap(routes: readonly string[]) {
  const today = new Date().toISOString().slice(0, 10)
  const entries = routes
    .map((r) => {
      const loc = `${ORIGIN}${r === '/' ? '/' : `${r}/`}`
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

/** robots。全站放开，只指一条 sitemap。没有后台也没有参数页，不需要 Disallow。 */
const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`

async function main() {
  await build({
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
      // 中间产物跑完就删，不用压缩
      minify: false,
    },
    logLevel: 'warn',
  })

  const entry: Entry = await import(pathToFileURL(join(SSR_DIR, 'entry-server.js')).href)
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  if (!template.includes(MOUNT)) {
    console.error(`dist/index.html 里找不到挂载点 ${MOUNT}，预渲染没法注入。`)
    process.exit(1)
  }
  if (!DESC_RE.test(template)) {
    console.error('dist/index.html 里找不到 meta description，逐页描述注入不进去。')
    process.exit(1)
  }
  if (!SCRIPT_RE.test(template)) {
    console.error('dist/index.html 里找不到 <script type="module">，改不了它的优先级。')
    process.exit(1)
  }

  const assets = await readdir(join(DIST, 'assets'))
  const fontsAll = preloads(assets, PRELOAD_ALL)
  const fontsDocs = preloads(assets, [...PRELOAD_ALL, ...PRELOAD_DOCS])

  const rows: { route: string; kb: number }[] = []

  for (const route of entry.ROUTES) {
    const { html, title, description } = entry.render(route)
    // /docs 与八篇长文额外预载 docs 分片与等宽字，首页不预载它们
    const fonts = route.startsWith('/docs') ? fontsDocs : fontsAll

    const page = template
      .replace(MOUNT, `<div id="root">${html}</div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`)
      .replace(
        DESC_RE,
        `<meta name="description" content="${attr(description)}" />\n    ` +
          `${head(route, title, description)}\n    ${fonts}`,
      )
      .replace(SCRIPT_RE, '<script type="module" fetchpriority="low" ')

    const dir = route === '/' ? DIST : join(DIST, route)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), page, 'utf8')

    rows.push({ route, kb: Buffer.byteLength(page) / 1024 })
  }

  await writeFile(join(DIST, 'sitemap.xml'), sitemap(entry.ROUTES), 'utf8')
  await writeFile(join(DIST, 'robots.txt'), ROBOTS, 'utf8')

  await rm(SSR_DIR, { recursive: true, force: true })

  const width = Math.max(...rows.map((r) => r.route.length))
  console.log(`\n预渲染 ${rows.length} 条路由`)
  for (const r of rows) {
    console.log(`  ${r.route.padEnd(width)}  ${r.kb.toFixed(1).padStart(7)} KB`)
  }
  console.log(`  ${'合计'.padEnd(width)}  ${rows.reduce((s, r) => s + r.kb, 0).toFixed(1).padStart(7)} KB`)
  console.log(`\nsitemap.xml  ${rows.length} 条 · robots.txt · ${ORIGIN}`)
}

await main()
