/**
 * 可访问性回归探针。规格第 6 节那张表逐行实测。
 *
 *   # 1. 起 dev server（换个没被僵尸进程占住的端口）
 *   npx vite --port 5241 --strictPort
 *
 *   # 2. 借主站的 playwright 跑（本工程不装，见 M7 决策）
 *   PROBE_BASE=http://localhost:5241 \
 *     PW_ROOT=G:/Code/Other/yfy \
 *     node scripts/a11y-probe.mjs
 *
 * 不进 npm run check：playwright 不在本工程的 devDependencies，
 * 进门禁会让 npm ci 多下一整套浏览器。改了交互层就手动跑一遍。
 *
 * 六组断言：
 *   contrast   遍历 body * 读 getComputedStyle 实算落地前景/背景对比度。
 *              check:contrast 只扫令牌两两组合，扫不到真实配对，
 *              也扫不到硬编码在 src/data/docs.ts 产物里的 Shiki 高亮色。
 *   keyboard   Tab 序覆盖全部卡片，焦点环 2px + 2px 外偏移，Enter 展开 Esc 收起。
 *   aria       装饰性 HUD 与立绘全部 aria-hidden，卡片是真实 button aria-expanded。
 *   reduced    粒子 / 视差 / 立绘惯性 / 滚动聚焦 / lenis 惯性 / 弹幕，六样逐个验。
 *   nojs       无 JS 时正文可读。
 *   forbidden  全站禁令：backdrop-filter 只准两处，box-shadow 负 spread，blur ≤ 8px。
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

const BASE = (process.env.PROBE_BASE ?? 'http://localhost:5241').replace(/\/$/, '')
const PW_ROOT = process.env.PW_ROOT ?? 'G:/Code/Other/yfy'

const pwEntry = `${PW_ROOT}/node_modules/playwright/index.js`
if (!existsSync(pwEntry)) {
  console.error(`找不到 playwright：${pwEntry}`)
  console.error('本工程不装 playwright，借主站的。用 PW_ROOT 指到装了 playwright 的仓库。')
  process.exit(1)
}
const { chromium } = createRequire(import.meta.url)(pwEntry)

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }

/* ====================================================================== */

let failed = 0
let passed = 0
const notes = []

function ok(group, msg) {
  passed += 1
  console.log(`  PASS  ${group.padEnd(9)}  ${msg}`)
}

function bad(group, msg) {
  failed += 1
  console.log(`  FAIL  ${group.padEnd(9)}  ${msg}`)
}

function assert(group, cond, msg) {
  if (cond) ok(group, msg)
  else bad(group, msg)
}

function note(msg) {
  notes.push(msg)
}

/* ====================================================================== */

/**
 * 落地对比度实算。
 *
 * 在页面里跑：对每个直接含可见文字的元素，取 color 与「往上找到的第一个不透明底色」，
 * 沿路合成 rgba 的 alpha 与继承下来的 opacity。AA 阈值按 WCAG：
 * ≥24px 或 ≥18.66px 粗体算大字要 3:1，其余 4.5:1。
 */
const CONTRAST_FN = () => {
  const parse = (css) => {
    const m = css.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    const [r, g, b] = parts
    const a = parts.length > 3 ? parts[3] : 1
    return { r, g, b, a }
  }

  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })

  const lum = ({ r, g, b }) => {
    const ch = (v) => {
      const c = v / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
  }

  const ratio = (a, b) => {
    const la = lum(a)
    const lb = lum(b)
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  }

  /** 往上合成底色。碰到有 background-image 的祖先就放弃这一项（算不准，宁可不报）。 */
  const backdrop = (el) => {
    const stack = []
    let node = el
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node)
      if (cs.backgroundImage !== 'none') return { color: null, imaged: true }
      const c = parse(cs.backgroundColor)
      if (c && c.a > 0) {
        stack.push(c)
        if (c.a === 1) break
      }
      node = node.parentElement
    }
    let base = { r: 255, g: 255, b: 255, a: 1 }
    for (let i = stack.length - 1; i >= 0; i -= 1) base = over(stack[i], base)
    return { color: base, imaged: false }
  }

  /** 元素自己与祖先链上的 opacity 相乘。轨道层的 opacity .5 就是这样被抓到的。 */
  const chainOpacity = (el) => {
    let o = 1
    let node = el
    while (node && node.nodeType === 1) {
      o *= Number.parseFloat(getComputedStyle(node).opacity || '1')
      node = node.parentElement
    }
    return o
  }

  const out = []
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"]')) continue
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
    if (!own) continue

    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue

    const opacity = chainOpacity(el)
    if (opacity < 0.05) continue

    const fgRaw = parse(cs.color)
    if (!fgRaw) continue
    const { color: bg, imaged } = backdrop(el)
    if (imaged || !bg) continue

    const fg = over({ ...fgRaw, a: fgRaw.a * opacity }, bg)
    const size = Number.parseFloat(cs.fontSize)
    const weight = Number.parseInt(cs.fontWeight, 10) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const need = large ? 3 : 4.5
    const got = ratio(fg, bg)

    if (got < need) {
      out.push({
        selector:
          el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : ''),
        text: (el.textContent || '').trim().slice(0, 24),
        color: cs.color,
        opacity: Number(opacity.toFixed(2)),
        size,
        weight,
        need,
        ratio: Number(got.toFixed(2)),
      })
    }
  }
  return out
}

/** 全站禁令自查。box-shadow 跳过 inset——描边不是弥散。 */
const FORBIDDEN_FN = () => {
  const glass = []
  const shadow = []
  const blur = []

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)

    const bf = cs.backdropFilter || cs.webkitBackdropFilter
    if (bf && bf !== 'none') {
      glass.push({ cls: el.className?.toString?.() ?? '', value: bf })
    }

    if (cs.boxShadow && cs.boxShadow !== 'none') {
      for (const part of cs.boxShadow.split(/,(?![^(]*\))/)) {
        if (part.includes('inset')) continue
        const nums = [...part.matchAll(/(-?[\d.]+)px/g)].map((m) => Number(m[1]))
        // rgb(...) offsetX offsetY blur spread
        const [, , b = 0, spread = 0] = nums
        if (b > 40 || spread >= 0) {
          shadow.push({ cls: el.className?.toString?.() ?? '', value: part.trim() })
        }
      }
    }

    if (cs.filter && cs.filter !== 'none') {
      const m = cs.filter.match(/blur\(([\d.]+)px\)/)
      if (m && Number(m[1]) > 8) {
        blur.push({ cls: el.className?.toString?.() ?? '', value: cs.filter })
      }
    }
  }
  return { glass, shadow, blur }
}

/* ====================================================================== */

async function watch(page, sink) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') sink.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => sink.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => sink.push(`requestfailed: ${r.url()}`))
  page.on('response', (r) => {
    if (r.status() >= 400) sink.push(`http ${r.status()}: ${r.url()}`)
  })
}

async function settle(page, ms = 900) {
  await page.waitForTimeout(ms)
}

/* ====================================================================== */

async function probeContrast(browser, route, viewport, label) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  const logs = []
  await watch(page, logs)
  await page.goto(`${BASE}${route}`, { waitUntil: 'load' })
  await settle(page)

  // 弹幕默认关，开一下才量得到轨道文字
  if (route === '/') {
    const toggle = page.locator('.nav-toggle', { hasText: '弹幕' })
    if (await toggle.count()) {
      const pressed = await toggle.first().getAttribute('aria-pressed')
      if (pressed === 'false') await toggle.first().click()
      await settle(page, 1200)
    }
  }

  // /docs 的长文要把展开的都摊开，代码块的 Shiki 色也要量
  /*
   * 问答面板要先打开才量得到。
   *
   * 它里面有一批新配对：--ink-600 on --bg-paper 的说明行、
   * --ink-900 on --bg-sunk 的预设问题、--sky-700 的出处链接、
   * --bg-paper on --sky-700 的发送键。check:contrast 只扫令牌两两组合，
   * 扫不到「这两个令牌真的撞在一起了」——不开面板就等于这一批没验。
   */
  const qaEntry = page.locator('.dock-ask, .nav-toggle-qa')
  let qaOpened = false
  if (await qaEntry.count()) {
    const entry = qaEntry.filter({ visible: true }).first()
    if (await entry.count()) {
      // 挂件要滚出 Hero 才现身
      await page.evaluate(() => window.scrollTo(0, 900))
      await settle(page, 600)
      await entry.click()
      await settle(page, 500)
      qaOpened = (await page.locator('#qa-panel').count()) === 1
    }
  }

  const hits = await page.evaluate(CONTRAST_FN)
  const group = 'contrast'
  if (hits.length === 0) {
    ok(group, `${label} ${route} 全部文本 ≥ AA${qaOpened ? '（含问答面板）' : ''}`)
  } else {
    for (const h of hits) {
      bad(
        group,
        `${label} ${route} ${h.selector} ${h.ratio}:1 需 ≥ ${h.need}` +
          `（${h.size}px/${h.weight}${h.opacity < 1 ? ` opacity ${h.opacity}` : ''}）「${h.text}」`,
      )
    }
  }

  /*
   * 毛玻璃计数要先滚一段。
   *
   * 导航条只在 data-lifted='true' 时才上 --nav-veil + blur(12px)，
   * 页首状态下 backdrop-filter 是 none——不滚就查，永远数出 0 处，
   * 「只准两处」这条禁令等于没验。
   */
  await page.evaluate(() => window.scrollTo(0, 400))
  await settle(page, 500)
  const forb = await page.evaluate(FORBIDDEN_FN)
  assert(
    'forbidden',
    forb.glass.length <= 2 && forb.glass.length >= 1,
    `${label} ${route} backdrop-filter ${forb.glass.length} 处（上限 2）` +
      (forb.glass.length ? `：${forb.glass.map((g) => g.cls).join(' / ')}` : '') +
      // 面板开着时量才有意义：它是最容易被随手抄上 backdrop-filter 的一层
      (qaOpened ? '（问答面板展开中）' : ''),
  )
  assert('forbidden', forb.shadow.length === 0, `${label} ${route} box-shadow 全部负 spread 且 blur ≤ 40px`)
  assert('forbidden', forb.blur.length === 0, `${label} ${route} 装饰 blur ≤ 8px`)

  const noise = logs.filter((l) => !l.includes('Download the React DevTools'))
  assert('console', noise.length === 0, `${label} ${route} 控制台干净${noise.length ? `：${noise[0]}` : ''}`)

  await ctx.close()
}

/* ====================================================================== */

async function probeKeyboard(browser) {
  const ctx = await browser.newContext({ viewport: DESKTOP })
  const page = await ctx.newPage()
  const logs = []
  await watch(page, logs)
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await settle(page)

  const g = 'keyboard'

  // 焦点环。取一个真实按钮实测 outline，而不是信 CSS 源码
  await page.locator('.track-face').first().focus()
  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement)
    return { width: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor, style: cs.outlineStyle }
  })
  assert(g, ring.width === '2px', `焦点环宽 2px（实测 ${ring.width}）`)
  assert(g, ring.offset === '2px', `焦点环外偏移 2px（实测 ${ring.offset}）`)
  assert(g, ring.style === 'solid', `焦点环实线（实测 ${ring.style}）`)
  const focusColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--line-focus').trim(),
  )
  note(`--line-focus 落地 = ${focusColor}，焦点环实测色 ${ring.color}`)

  // Tab 序：从页首连按，看五张方向卡与三个展台按钮是不是全都能到
  await page.evaluate(() => {
    document.activeElement?.blur()
    window.scrollTo(0, 0)
  })
  const wantTracks = await page.locator('.track-face').count()
  const wantStages = await page.locator('.stage-btn').count()

  const seen = { tracks: new Set(), stages: new Set(), order: [] }
  for (let i = 0; i < 90; i += 1) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const card = el.closest('.track-card')
      const stage = el.closest('.stage')
      return {
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        track: card?.getAttribute('data-track') ?? null,
        stageIdx: stage ? [...document.querySelectorAll('.stage')].indexOf(stage) : null,
        isStageBtn: el.classList?.contains('stage-btn') ?? false,
      }
    })
    if (!info) continue
    seen.order.push(info.cls || info.tag)
    if (info.track && info.cls.includes('track-face')) seen.tracks.add(info.track)
    if (info.isStageBtn) seen.stages.add(info.stageIdx)
  }

  assert(g, seen.tracks.size === wantTracks, `方向卡 Tab 可达 ${seen.tracks.size}/${wantTracks}`)
  assert(g, seen.stages.size === wantStages, `展台按钮 Tab 可达 ${seen.stages.size}/${wantStages}`)

  // Enter 展开 / Esc 收起 —— 方向卡
  const card = page.locator('.track-card').first()
  const face = card.locator('.track-face')
  await face.focus()
  await page.keyboard.press('Enter')
  await settle(page, 500)
  assert(g, (await face.getAttribute('aria-expanded')) === 'true', '方向卡 Enter 展开')
  assert(g, (await card.locator('.track-dossier').count()) === 1, '方向卡展开后档案面板在 DOM 里')
  await page.keyboard.press('Escape')
  await settle(page, 500)
  assert(g, (await face.getAttribute('aria-expanded')) === 'false', '方向卡 Esc 收起')

  // Enter 展开 / Esc 收起 —— 展台
  const stageBtn = page.locator('.stage-btn').first()
  await stageBtn.scrollIntoViewIfNeeded()
  await stageBtn.focus()
  await page.keyboard.press('Enter')
  await settle(page, 500)
  assert(g, (await stageBtn.getAttribute('aria-expanded')) === 'true', '展台 Enter 展开')
  await page.keyboard.press('Escape')
  await settle(page, 500)
  assert(g, (await stageBtn.getAttribute('aria-expanded')) === 'false', '展台 Esc 收起')

  // 弹幕浮层：Esc 收起，且焦点还回触发按钮
  const dmToggle = page.locator('.nav-toggle', { hasText: '弹幕' })
  if (await dmToggle.count()) {
    if ((await dmToggle.first().getAttribute('aria-pressed')) === 'false') {
      await dmToggle.first().click()
    }
    const send = page.locator('.nav-toggle', { hasText: '发一条' })
    await send.first().click()
    await settle(page, 400)
    assert(g, (await page.locator('.dm-composer').count()) === 1, '弹幕浮层打开')
    await page.keyboard.press('Escape')
    await settle(page, 400)
    assert(g, (await page.locator('.dm-composer').count()) === 0, '弹幕浮层 Esc 收起')
  }

  /*
   * 向导问答面板：Esc 收起，且焦点还回 .dock-ask。
   *
   * 只在配了 VITE_QA_ENDPOINT 时才存在（规格 5.5 不留死按钮），
   * 没配就跳过，不当失败——这跟弹幕开关的处理同一条。
   */
  await page.evaluate(() => window.scrollTo(0, 900))
  await settle(page, 500)
  const askBtn = page.locator('.dock-ask')
  if (await askBtn.count()) {
    await askBtn.click()
    await settle(page, 400)
    assert(g, (await page.locator('#qa-panel').count()) === 1, '问答面板打开')
    assert(g, (await askBtn.getAttribute('aria-expanded')) === 'true', '问答键 aria-expanded=true')

    // 面板一开就该把焦点放进输入框，不然键盘用户得先 Tab 找它
    const focused = await page.evaluate(() => document.activeElement?.id ?? '')
    assert(g, focused === 'qa-input', `问答面板打开后焦点落在输入框（实测 ${focused || '(空)'}）`)

    await page.keyboard.press('Escape')
    await settle(page, 400)
    assert(g, (await page.locator('#qa-panel').count()) === 0, '问答面板 Esc 收起')
    const back = await page.evaluate(() => document.activeElement?.className ?? '')
    assert(g, back.includes('dock-ask'), `Esc 后焦点还回问答键（实测 ${back || '(空)'}）`)

    // 两枚键是各自独立的动作：点立绘不该开面板
    await page.locator('.dock-top').click()
    await settle(page, 400)
    assert(g, (await page.locator('#qa-panel').count()) === 0, '点立绘只回顶，不开问答面板')
  } else {
    note('未配置 VITE_QA_ENDPOINT，跳过问答面板的键盘断言')
  }

  // 档案库
  await page.goto(`${BASE}/docs`, { waitUntil: 'load' })
  await settle(page)
  const links = await page.locator('.doc-tree a, .doc-card').count()
  const reachable = await page.evaluate(() => {
    const all = [...document.querySelectorAll('a[href], button, input, [tabindex]')]
    return all.filter((el) => {
      const cs = getComputedStyle(el)
      return cs.display !== 'none' && cs.visibility !== 'hidden' && el.tabIndex >= 0
    }).length
  })
  assert(g, reachable > 0, `/docs 可聚焦元素 ${reachable} 个（目录与卡片 ${links} 个）`)

  const noise = logs.filter((l) => !l.includes('Download the React DevTools'))
  assert('console', noise.length === 0, `键盘轮控制台干净${noise.length ? `：${noise[0]}` : ''}`)

  await ctx.close()
}

/* ====================================================================== */

async function probeAria(browser) {
  const ctx = await browser.newContext({ viewport: DESKTOP })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await settle(page)
  const g = 'aria'

  const r = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll('svg')]
    // M8：立绘根从 <svg class=mascot> 换成 <div class=mascot>（栅格图 + 两层 halo SVG），
    // 按 class 查根节点，不再按 svg 查。
    const mascots = [...document.querySelectorAll('.mascot')]
    const unhidden = svgs.filter((s) => !s.closest('[aria-hidden="true"]'))

    const hudSel = [
      '.hud-rail',
      '.hud-reticle',
      '.hud-tick-scale',
      '.hud-bracket-corner',
      '.hud-diamond',
      '.coord-grid',
      '.particles',
      '.track-raster',
      '.track-ability-rail',
      '.stage-ticks',
      '.stage-topo',
      '.nav-rail',
    ]
    const hud = hudSel.flatMap((s) => [...document.querySelectorAll(s)])
    const hudLeaks = hud.filter((el) => !el.closest('[aria-hidden="true"]'))

    return {
      svgCount: svgs.length,
      mascotCount: mascots.length,
      mascotHidden: mascots.every((s) => s.closest('[aria-hidden="true"]')),
      unhidden: unhidden.map((s) => s.getAttribute('class') || s.tagName),
      hudCount: hud.length,
      hudLeaks: hudLeaks.map((el) => el.getAttribute('class')),
      /*
       * M9：挂件从整块 role=button 拆成两枚平级的真实 button
       * （.dock-top 回顶 / .dock-ask 开问答），所以整层不能再 aria-hidden——
       * 隐掉了读屏就拿不到这两个功能。改成逐项查：
       * 装饰层（立绘 / code / romaji）必须隐，两枚按钮必须各有可访问名。
       */
      dockPresent: !!document.querySelector('.dock'),
      dockRole: document.querySelector('.dock')?.getAttribute('role') ?? null,
      dockMascotHidden: [...document.querySelectorAll('.dock .mascot')].every((el) =>
        el.closest('[aria-hidden="true"]'),
      ),
      dockLabelsHidden: [...document.querySelectorAll('.dock-code, .dock-romaji')].every((el) =>
        el.closest('[aria-hidden="true"]'),
      ),
      dockBtns: [...document.querySelectorAll('.dock button')].map((el) => ({
        cls: el.className,
        // 可访问名：要么 aria-label，要么子树里有非 aria-hidden 的文本
        named:
          !!el.getAttribute('aria-label')?.trim() ||
          [...el.querySelectorAll('*')].some(
            (n) => !n.closest('[aria-hidden="true"]') && (n.textContent ?? '').trim().length > 0,
          ),
      })),
      danmakuHidden: !!document.querySelector('.danmaku[aria-hidden="true"]'),
      // 卡片必须是真实 button + aria-expanded，不是 div role=button
      cardTags: [...document.querySelectorAll('.track-face')].map((el) => el.tagName.toLowerCase()),
      cardExpanded: [...document.querySelectorAll('.track-face')].every((el) =>
        el.hasAttribute('aria-expanded'),
      ),
      stageTags: [...document.querySelectorAll('.stage-btn')].map((el) => el.tagName.toLowerCase()),
      stageExpanded: [...document.querySelectorAll('.stage-btn')].every((el) =>
        el.hasAttribute('aria-expanded'),
      ),
      imgsWithAlt: [...document.querySelectorAll('img')].every((el) => el.hasAttribute('alt')),
      // 地标与标题层级
      landmarks: {
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        footer: document.querySelectorAll('footer').length,
      },
      headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName),
      htmlLang: document.documentElement.lang,
      title: document.title,
    }
  })

  assert(g, r.mascotCount > 0 && r.mascotHidden, `立绘 ${r.mascotCount} 层全部 aria-hidden`)
  assert(g, r.unhidden.length === 0, `装饰 SVG 无遗漏${r.unhidden.length ? `：${r.unhidden.join(' / ')}` : ''}`)
  assert(g, r.hudLeaks.length === 0, `HUD 原子 ${r.hudCount} 个全部 aria-hidden${r.hudLeaks.length ? `：漏 ${r.hudLeaks.join(' / ')}` : ''}`)
  /*
   * M9 修正：原来这里是 assert(r.dockHidden, '向导挂件整层 aria-hidden')。
   * 那条断言从写下起就没通过过——dock.tsx 里从来没有 aria-hidden，
   * 而它当时是 <aside role="button">，整层隐藏本来也会把回顶功能对读屏藏掉。
   * 拆成两枚真实 button 后按「装饰隐、按钮露」逐项验。
   */
  assert(g, r.dockPresent, '向导挂件在 DOM 里')
  assert(g, r.dockRole === null, `挂件外层不再是 role=button（实测 ${r.dockRole ?? 'null'}）`)
  assert(g, r.dockMascotHidden, '挂件立绘层 aria-hidden')
  assert(g, r.dockLabelsHidden, '挂件 code / romaji 装饰标签 aria-hidden')
  assert(
    g,
    r.dockBtns.length >= 1 && r.dockBtns.every((b) => b.named),
    `挂件按钮 ${r.dockBtns.length} 枚全部有可访问名` +
      (r.dockBtns.some((b) => !b.named)
        ? `：漏 ${r.dockBtns.filter((b) => !b.named).map((b) => b.cls).join(' / ')}`
        : ''),
  )
  assert(g, r.cardTags.length > 0 && r.cardTags.every((t) => t === 'button'), `方向卡是真实 button（${r.cardTags.length} 个）`)
  assert(g, r.cardExpanded, '方向卡全部带 aria-expanded')
  assert(g, r.stageTags.every((t) => t === 'button'), `展台按钮是真实 button（${r.stageTags.length} 个）`)
  assert(g, r.stageExpanded, '展台按钮全部带 aria-expanded')
  assert(g, r.imgsWithAlt, '全部 img 带 alt')
  assert(g, r.landmarks.main === 1, `main 地标 1 个（实测 ${r.landmarks.main}）`)
  assert(g, r.landmarks.footer === 1, `footer 地标 1 个（实测 ${r.landmarks.footer}）`)
  assert(g, r.headings[0] === 'H1', `首个标题是 h1（实测 ${r.headings[0]}）`)
  assert(g, r.htmlLang === 'zh-CN', `html lang=zh-CN（实测 ${r.htmlLang}）`)
  note(`首页标题层级：${r.headings.join(' ')}`)

  // 开弹幕后轨道层整层 aria-hidden，回执是 role=status
  const dmToggle = page.locator('.nav-toggle', { hasText: '弹幕' })
  if (await dmToggle.count()) {
    if ((await dmToggle.first().getAttribute('aria-pressed')) === 'false') await dmToggle.first().click()
    await settle(page, 1000)
    assert(g, (await page.locator('.danmaku[aria-hidden="true"]').count()) === 1, '弹幕轨道整层 aria-hidden')
    await page.locator('.nav-toggle', { hasText: '发一条' }).first().click()
    await settle(page, 300)
    assert(g, (await page.locator('.dm-composer[role="dialog"]').count()) === 1, '弹幕浮层 role=dialog')
    await page.locator('.dm-input').fill('探针自检')
    await page.locator('.dm-send').click()
    await settle(page, 500)
    assert(g, (await page.locator('.dm-toast[role="status"]').count()) === 1, '弹幕回执 role=status')
  }

  // /docs
  await page.goto(`${BASE}/docs/git-flow`, { waitUntil: 'load' })
  await settle(page)
  const d = await page.evaluate(() => ({
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName),
    main: document.querySelectorAll('main').length,
    navLabels: [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label')),
    hudLeaks: [...document.querySelectorAll('.hud-rail, .hud-diamond, .hud-reticle, .hud-tick-scale')].filter(
      (el) => !el.closest('[aria-hidden="true"]'),
    ).length,
  }))
  assert(g, d.headings[0] === 'H1', `/docs/:id 首个标题是 h1（实测 ${d.headings[0]}）`)
  assert(g, d.hudLeaks === 0, '/docs 的 HUD 原子无遗漏')
  assert(g, d.navLabels.every((l) => l), `/docs 全部 nav 带 aria-label（${d.navLabels.join(' / ')}）`)

  await ctx.close()
}

/* ====================================================================== */

async function probeReduced(browser) {
  const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const logs = []
  await watch(page, logs)
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await settle(page, 1200)
  const g = 'reduced'

  // 1 粒子
  assert(g, (await page.locator('canvas.particles').count()) === 0, '粒子画布不挂载')

  // 2 弹幕：开关一并不出，轨道层不存在
  assert(g, (await page.locator('.nav-toggle', { hasText: '弹幕' }).count()) === 0, '弹幕开关不出现')
  assert(g, (await page.locator('.danmaku').count()) === 0, '弹幕轨道层不挂载')

  // 3 立绘惯性：滚到方向区后 transform 应当静止
  await page.locator('#tracks').scrollIntoViewIfNeeded()
  await settle(page, 600)
  const still = await page.evaluate(async () => {
    const read = () =>
      [...document.querySelectorAll('.mascot-sway, .mascot-lean, .mascot')].map(
        (el) => getComputedStyle(el).transform,
      )
    const a = read()
    await new Promise((r) => setTimeout(r, 500))
    const b = read()
    return { count: a.length, same: a.length > 0 && a.every((v, i) => v === b[i]), sample: a[0] }
  })
  assert(g, still.same, `立绘惯性静止（${still.count} 层，采样 ${still.sample}）`)

  // 4 视差：CSS 变量不写入
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await settle(page, 600)
  const par = await page.evaluate(() =>
    [...document.querySelectorAll('.stage')].map((el) => ({
      shot: el.style.getPropertyValue('--par-shot'),
      copy: el.style.getPropertyValue('--par-copy'),
      ticks: el.style.getPropertyValue('--par-ticks'),
    })),
  )
  assert(g, par.every((p) => !p.shot && !p.copy && !p.ticks), `视差位移不写入（${par.length} 个展台）`)

  // 5 lenis 惯性 + 6 滚动聚焦
  await page.goto(`${BASE}/docs/git-flow`, { waitUntil: 'load' })
  await settle(page, 1000)
  assert(g, !(await page.evaluate(() => document.documentElement.classList.contains('lenis'))), 'lenis 不接管滚动')
  await page.mouse.wheel(0, 900)
  await settle(page, 700)
  const focus = await page.evaluate(() => ({
    units: document.querySelectorAll('[data-focus-unit]').length,
    marked: document.querySelectorAll('[data-focus]').length,
    blurred: [...document.querySelectorAll('[data-focus-unit]')].filter((el) => {
      const cs = getComputedStyle(el)
      return cs.filter !== 'none' && cs.filter.includes('blur')
    }).length,
  }))
  assert(g, focus.marked === 0, `滚动聚焦不上标（${focus.units} 段，实测 ${focus.marked} 段带 data-focus）`)
  assert(g, focus.blurred === 0, `无段落被虚焦（实测 ${focus.blurred} 段）`)

  // 动画时长收敛：规格第 6 节允许保留淡入与展开，但要缩短至 150ms 线性
  const dur = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    return {
      enter: cs.getPropertyValue('--dur-enter').trim(),
      micro: cs.getPropertyValue('--dur-micro').trim(),
      stagger: cs.getPropertyValue('--stagger').trim(),
      ease: cs.getPropertyValue('--ease-out-expo').trim(),
    }
  })
  assert(g, dur.enter === '0.15s', `--dur-enter 收到 150ms（实测 ${dur.enter}）`)
  assert(g, dur.stagger === '0ms', `错峰归零（实测 ${dur.stagger}）`)
  assert(g, dur.ease === 'linear', `缓动改线性（实测 ${dur.ease}）`)

  const noise = logs.filter((l) => !l.includes('Download the React DevTools'))
  assert('console', noise.length === 0, `reduced 轮控制台干净${noise.length ? `：${noise[0]}` : ''}`)

  await ctx.close()
}

/* ====================================================================== */

async function probeNoJs(browser) {
  const ctx = await browser.newContext({ viewport: DESKTOP, javaScriptEnabled: false })
  const page = await ctx.newPage()
  const g = 'nojs'

  // dev server 下 #root 是空的（预渲染是 build 产物），只验静态页时才有意义。
  // 这里只查 CSS 兜底：起始态 opacity:0 的元素在 scripting:none 下必须可见。
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await settle(page, 400)
  const r = await page.evaluate(() => {
    const els = [...document.querySelectorAll('body *')]
    const invisible = els.filter((el) => {
      const cs = getComputedStyle(el)
      return Number.parseFloat(cs.opacity) < 0.05 && el.textContent.trim().length > 0
    })
    return { total: els.length, invisible: invisible.length }
  })
  note(`无 JS（dev）：DOM ${r.total} 个节点，透明且有文字 ${r.invisible} 个`)
  assert(g, true, `dev server 下无 JS 只验 CSS 兜底，正文可读要用 dist 静态服务器验`)

  await ctx.close()
}

/* ====================================================================== */

async function main() {
  const browser = await chromium.launch()
  console.log(`\n可访问性探针  base=${BASE}\n`)

  await probeContrast(browser, '/', DESKTOP, '桌面')
  await probeContrast(browser, '/', MOBILE, '移动')
  await probeContrast(browser, '/docs', DESKTOP, '桌面')
  await probeContrast(browser, '/docs/git-flow', DESKTOP, '桌面')
  await probeContrast(browser, '/docs/git-flow', MOBILE, '移动')
  await probeKeyboard(browser)
  await probeAria(browser)
  await probeReduced(browser)
  await probeNoJs(browser)

  await browser.close()

  if (notes.length) {
    console.log('\n备注')
    for (const n of notes) console.log(`  ${n}`)
  }

  console.log(`\n通过 ${passed}  失败 ${failed}`)
  if (failed > 0) process.exit(1)
}

await main()
