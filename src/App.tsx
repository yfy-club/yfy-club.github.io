import { useEffect, useState, type ReactNode } from 'react'
import { Rail, Reticle, TickScale, Tag, Bracket, Diamond, HudList } from './components/hud'
import './lab.css'

/* -------------------------------------------------------------------------
   M1 验收页。设计令牌与 HUD 原子全部摆出来，方便肉眼比对规格书。
   M3 起被真正的首屏替换。
   ------------------------------------------------------------------------- */

const COLORS = [
  { group: '底层', items: [
    ['--bg-sky', '页面底'],
    ['--bg-paper', '卡片面'],
    ['--bg-sunk', '凹陷槽 / 代码块底'],
  ] },
  { group: '墨色', items: [
    ['--ink-900', '主标题与正文'],
    ['--ink-600', '次级正文'],
    ['--ink-400', '刻度与辅助图形'],
  ] },
  { group: '天蓝', items: [
    ['--sky-700', '正文与链接'],
    ['--sky-500', '图形与边框'],
    ['--sky-300', '导轨与分隔'],
    ['--sky-100', '浅色块'],
  ] },
  { group: '浅粉', items: [
    ['--pink-700', '唯一可承载文字的粉'],
    ['--pink-500', '激活态与粒子'],
    ['--pink-300', '柔粉高光'],
    ['--pink-100', '粉色标签底'],
  ] },
] as const

const TYPE_SCALE = [
  ['display', '--text-display', '云飞扬'],
  ['h1', '--text-h1', '五个技术方向'],
  ['h2', '--text-h2', '非对称交互展台'],
  ['h3', '--text-h3', '开发者档案库'],
  ['body', '--text-body', '晴空三阶做层次，1px 导轨立骨架，粉色只在交互时出现。'],
  ['caption', '--text-caption', '虚构角色 · 化名'],
] as const

const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7'] as const

const STAGES = [
  ['--stage-zgyc', '智光耀城'],
  ['--stage-zhixueban', '智学伴'],
  ['--stage-matrix', '矩阵计算器'],
] as const

/** 从运行时的计算样式里读令牌真值，避免样板间和 tokens.css 各写一份。 */
function useToken(name: string) {
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
}

function Swatch({ name, use }: { name: string; use: string }) {
  const hex = useToken(name)
  return (
    <div className="swatch">
      <div className="swatch-chip" style={{ background: `var(${name})` }} />
      <div className="swatch-meta">
        <span className="swatch-name">{name.replace('--', '')}</span>
        <span className="swatch-hex">{hex || '—'}</span>
        <span className="swatch-use">{use}</span>
      </div>
    </div>
  )
}

function Section({
  num,
  title,
  note,
  children,
}: {
  num: string
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="sec">
      <Rail />
      <div className="sec-body">
        <div className="sec-head">
          <span className="sec-num">SECTOR {num}</span>
          <h2 className="sec-title">{title}</h2>
          {note && <span className="sec-note">{note}</span>}
        </div>
        {children}
      </div>
    </section>
  )
}

function SpaceRow({ name }: { name: string }) {
  const value = useToken(name)
  return (
    <div className="space-row">
      <span className="space-name">{name.replace('--space-', 'space-')}</span>
      <span className="space-bar" style={{ width: `var(${name})` }} />
      <span className="swatch-hex">{value}</span>
    </div>
  )
}

export default function App() {
  const [tick, setTick] = useState<number | null>(3)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => ((t ?? 0) + 1) % 16), 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grain">
      <div className="lab-scale">
        <TickScale count={16} majorEvery={5} active={tick} />
      </div>

      <main className="lab coord-grid">
        <div className="shell">
          <header className="lab-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Reticle size={22} />
              <Tag tone="solid">MILESTONE 01</Tag>
              <Tag tone="ink">设计令牌与 HUD 原子</Tag>
            </div>
            <h1 className="lab-title">云飞扬开源传送门 · 设计系统样板间</h1>
            <p className="lab-sub">
              这一页只做一件事：把规格书里的数值全部落成看得见的东西。
              颜色、字阶、间距、几何、HUD 语汇，肉眼比对一遍，不对的地方现在说。
            </p>
          </header>

          <Section num="01" title="色彩令牌" note="14 项对比度全部通过 npm run check:contrast">
            {COLORS.map(({ group, items }) => (
              <div key={group} style={{ marginBottom: 'var(--space-5)' }}>
                <div className="atom-name" style={{ marginBottom: 'var(--space-3)' }}>{group}</div>
                <div className="swatches">
                  {items.map(([name, use]) => (
                    <Swatch key={name} name={name} use={use} />
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <Section num="02" title="字阶" note="Noto Sans SC 子集 400 / 700，HUD 走 Chakra Petch">
            {TYPE_SCALE.map(([label, token, sample]) => (
              <div key={label} className="type-row">
                <span className="type-label">{label}</span>
                <span
                  className="type-sample"
                  style={{
                    fontSize: `var(${token})`,
                    fontWeight: label === 'display' || label === 'h1' ? 700 : label === 'body' || label === 'caption' ? 400 : 700,
                    lineHeight: label === 'display' ? 'var(--leading-display)' : undefined,
                    letterSpacing: label === 'display' ? 'var(--tracking-display)' : undefined,
                  }}
                >
                  {sample}
                </span>
              </div>
            ))}
          </Section>

          <Section num="03" title="HUD 原子语汇" note="全站秩序感的来源，不靠模糊也不靠阴影">
            <div className="atoms">
              <div className="atom">
                <span className="atom-name">Rail</span>
                <div className="atom-stage" style={{ flexDirection: 'column', width: '100%' }}>
                  <Rail />
                  <Rail ticks={false} />
                </div>
                <p className="atom-desc">全幅 1px 导轨，两端 4px 短刻。分区与页面骨架。</p>
              </div>

              <div className="atom">
                <span className="atom-name">Reticle</span>
                <div className="atom-stage">
                  <Reticle size={28} />
                  <Reticle size={22} tone="pink" />
                  <Reticle size={16} tone="ink" />
                </div>
                <p className="atom-desc">十字准星。中心留空心方，实心点会显脏。</p>
              </div>

              <div className="atom">
                <span className="atom-name">Tag</span>
                <div className="atom-stage">
                  <Tag tone="solid">ORACLE</Tag>
                  <Tag>Vue 3</Tag>
                  <Tag tone="ink">620 CASES</Tag>
                  <Tag tone="pink">ACTIVE</Tag>
                </div>
                <p className="atom-desc">切角标签。只用真实语义的短词，不编中二黑话。</p>
              </div>

              <div className="atom">
                <span className="atom-name">Bracket</span>
                <div className="atom-stage">
                  <Bracket length={18} gap={12}>
                    <div
                      style={{
                        width: 148,
                        height: 92,
                        background: 'var(--bg-sunk)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--ink-400)',
                        fontSize: 'var(--text-caption)',
                      }}
                    >
                      截图位
                    </div>
                  </Bracket>
                </div>
                <p className="atom-desc">四角 L 形取景框，不闭合。闭合了就变普通边框。</p>
              </div>

              <div className="atom">
                <span className="atom-name">Diamond</span>
                <div className="atom-stage" style={{ alignItems: 'flex-start', width: '100%' }}>
                  <HudList
                    items={['替代全站所有 Emoji', '替代所有短横线列表符', '仅 4px，不抢正文']}
                  />
                </div>
                <p className="atom-desc">45° 实心小方块。</p>
              </div>

              <div className="atom">
                <span className="atom-name">TickScale</span>
                <div className="atom-stage">
                  <TickScale count={9} majorEvery={4} active={2} />
                  <span className="atom-desc" style={{ maxWidth: 130 }}>
                    左侧那条一直在走的刻度尺就是它，当前格转粉并加长。
                  </span>
                </div>
                <p className="atom-desc">垂直刻度尺。页面滚动进度。</p>
              </div>
            </div>
          </Section>

          <Section num="04" title="几何与阴影" note="唯一允许的阴影，且仅 hover 启用">
            <div className="atoms">
              <div className="bevel-card">
                <span className="atom-name">切角卡片</span>
                <p className="atom-desc" style={{ marginTop: 'var(--space-3)' }}>
                  右上与左下各切 18px 的 45° 角。悬停时才出阴影，blur 40px 且负 spread。
                  静止画面接近纯平面印刷品。
                </p>
              </div>
              <div className="atom">
                <span className="atom-name">禁止项</span>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <HudList
                    tone="pink"
                    items={[
                      'backdrop-filter 仅限导航条与弹幕输入浮层',
                      '装饰性 filter: blur() 不超过 8px',
                      '阴影 blur ≤ 40px 且必须负 spread',
                      '任何位置不出现 Emoji 与伪代码前缀',
                    ]}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section num="05" title="间距阶" note="斐波那契近似，编辑设计节奏">
            {SPACES.map((name) => (
              <SpaceRow key={name} name={name} />
            ))}
          </Section>

          <Section num="06" title="展台三色世界" note="仅作用于框线与光效，面积占比 < 8%">
            <div className="stages">
              {STAGES.map(([token, label]) => (
                <Bracket key={token} tone={`var(${token})`} length={26} gap={12}>
                  <div className="stage-demo">
                    <Diamond />
                    <span className="stage-demo-name">{label}</span>
                    <span className="stage-demo-hex">{token}</span>
                  </div>
                </Bracket>
              ))}
            </div>
          </Section>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <Rail />
            <p className="atom-desc" style={{ marginTop: 'var(--space-4)' }}>
              站内角色均为原创虚构化名，不指代任何真实社员。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
