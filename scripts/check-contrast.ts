/**
 * 色彩令牌对比度回归。
 *
 *   npm run check:contrast
 *
 * 从 src/styles/tokens.css 直接读色值，不维护第二份副本。
 * 调色时如果把可读性调没了，这里会失败。
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const TOKENS = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))

/** WCAG 2.1 相对亮度 */
function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16)
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const r = channel((n >> 16) & 0xff)
  const g = channel((n >> 8) & 0xff)
  const b = channel(n & 0xff)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(fg: string, bg: string) {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/**
 * min 是这个令牌被允许承载的最低对比度。
 * usage 写清楚它被允许用在哪，超出用途就是 bug，不是"设计选择"。
 */
const RULES = [
  { fg: '--ink-900', bg: '--bg-sky', min: 7, usage: '主标题与正文' },
  { fg: '--ink-900', bg: '--bg-paper', min: 7, usage: '卡片内正文' },
  { fg: '--ink-600', bg: '--bg-sky', min: 4.5, usage: '次级正文' },
  { fg: '--ink-600', bg: '--bg-paper', min: 4.5, usage: '卡片内次级正文' },
  { fg: '--ink-400', bg: '--bg-sky', min: 3, usage: '仅限非文本图形与 ≥18.66px 粗体' },
  { fg: '--sky-700', bg: '--bg-sky', min: 4.5, usage: '正文与链接' },
  { fg: '--sky-700', bg: '--sky-100', min: 4.5, usage: 'Tag sky 底上的文字' },
  { fg: '--sky-500', bg: '--bg-sky', min: 3, usage: '仅限图形、边框、≥24px 大字' },
  { fg: '--pink-700', bg: '--bg-sky', min: 4.5, usage: '粉色文案' },
  { fg: '--pink-700', bg: '--pink-100', min: 4.5, usage: 'Tag pink 底上的文字' },
  { fg: '--bg-paper', bg: '--sky-700', min: 4.5, usage: 'Tag solid 反白文字' },
  // 弹幕浮层与回执：面是 --bg-paper（浮层是 88% 的它叠在 --bg-sky 上，只会更亮）
  { fg: '--pink-700', bg: '--bg-paper', min: 4.5, usage: '弹幕浮层与回执里的粉色说明' },
  { fg: '--sky-700', bg: '--bg-paper', min: 4.5, usage: '回执标题' },
  { fg: '--ink-600', bg: '--bg-sunk', min: 4.5, usage: '凹陷底上的次级文字' },
  // 展台主调只画框线与光效，按 WCAG 1.4.11 非文本对比度要求 ≥ 3:1
  { fg: '--stage-zgyc', bg: '--bg-sky', min: 3, usage: '智光耀城展台框线' },
  { fg: '--stage-zhixueban', bg: '--bg-sky', min: 3, usage: '智学伴展台框线' },
  { fg: '--stage-matrix', bg: '--bg-sky', min: 3, usage: '矩阵计算器展台框线' },
  // 角色主调承载 halo 与道具线条，同样是非文本图形，按 1.4.11 卡 3:1
  { fg: '--char-navi-accent', bg: '--bg-sky', min: 3, usage: 'NAVI halo 与道具线条' },
  { fg: '--char-oracle-accent', bg: '--bg-sky', min: 3, usage: 'ORACLE halo 与道具线条' },
  { fg: '--char-weaver-accent', bg: '--bg-sky', min: 3, usage: 'WEAVER halo 与道具线条' },
  { fg: '--char-vault-accent', bg: '--bg-sky', min: 3, usage: 'VAULT halo 与道具线条' },
  { fg: '--char-relay-accent', bg: '--bg-sky', min: 3, usage: 'RELAY halo 与道具线条' },
  { fg: '--char-forge-accent', bg: '--bg-sky', min: 3, usage: 'FORGE halo 与道具线条' },
] as const

/** 明确禁止承载文字的令牌。写进代码，免得三个月后有人"顺手"用了。 */
const TEXT_FORBIDDEN = ['--pink-500', '--pink-300', '--sky-300', '--sky-100']

async function main() {
  const css = await readFile(TOKENS, 'utf8')
  const vars = new Map<string, string>()
  for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6});/g)) {
    vars.set(name, value)
  }

  const resolve = (name: string) => {
    const v = vars.get(name)
    if (!v) throw new Error(`tokens.css 里找不到 ${name}`)
    return v
  }

  let failed = 0
  const width = Math.max(...RULES.map((r) => `${r.fg} on ${r.bg}`.length))

  for (const rule of RULES) {
    const ratio = contrast(resolve(rule.fg), resolve(rule.bg))
    const ok = ratio >= rule.min
    if (!ok) failed += 1
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${`${rule.fg} on ${rule.bg}`.padEnd(width)}  ` +
        `${ratio.toFixed(2).padStart(6)}:1  需 ≥ ${rule.min}  ${rule.usage}`,
    )
  }

  console.log(`\n  禁止承载文字：${TEXT_FORBIDDEN.join('  ')}`)

  if (failed > 0) {
    console.error(`\n对比度不达标 ${failed} 项。改色值，不要改阈值。`)
    process.exit(1)
  }
  console.log(`\n${RULES.length} 项全部通过。`)
}

await main()
