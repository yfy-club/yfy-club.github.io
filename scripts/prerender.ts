/**
 * 构建期预渲染。
 *
 *   npm run build        （vite build 之后自动跑这一步）
 *
 * GitHub Pages 是纯静态托管，没有 SPA fallback：直接访问 /docs/git-flow 或在那页按 F5，
 * 服务器找不到 docs/git-flow/index.html 就返回 404。这里给每条路由各出一张静态页顶上去。
 * 顺带满足规格第 6 节的「无 JS 时输出静态 HTML 骨架，内容可读」。
 * 取舍过程见 docs/design-spec.md 第 8 节的 M5 修正记录。
 *
 * 产物直接落在 dist/ 里，客户端 main.tsx 见到 #root 已有内容就走 hydrateRoot。
 * SSR 中间产物 dist-ssr/ 跑完就删，不上线也不进仓库。
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SSR_DIR = join(ROOT, 'dist-ssr')

/** 客户端产物里被替换的锚点。Vite 不动 index.html 的这一行。 */
const MOUNT = '<div id="root"></div>'

interface Entry {
  ROUTES: readonly string[]
  render: (url: string) => { html: string; title: string }
}

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

  const rows: { route: string; kb: number }[] = []

  for (const route of entry.ROUTES) {
    const { html, title } = entry.render(route)

    const page = template
      .replace(MOUNT, `<div id="root">${html}</div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)

    const dir = route === '/' ? DIST : join(DIST, route)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), page, 'utf8')

    rows.push({ route, kb: Buffer.byteLength(page) / 1024 })
  }

  await rm(SSR_DIR, { recursive: true, force: true })

  const width = Math.max(...rows.map((r) => r.route.length))
  console.log(`\n预渲染 ${rows.length} 条路由`)
  for (const r of rows) {
    console.log(`  ${r.route.padEnd(width)}  ${r.kb.toFixed(1).padStart(7)} KB`)
  }
  console.log(`  ${'合计'.padEnd(width)}  ${rows.reduce((s, r) => s + r.kb, 0).toFixed(1).padStart(7)} KB`)
}

await main()
