/**
 * 三个开源项目的本站文案。
 *
 * 内容是主站 src/content/works.ts 的**重述**（spec 第 0 节）。抽取口径：
 *   name      works[].nameZh 的 `·` 之前那半截，本站只用短名
 *   nameEn    works[].nameEn
 *   live      works[].liveUrl
 *   stack     works[].stackSummary，全拉丁，不吃中文字体预算
 *   metrics   works[].detail.metrics 里挑 3 条，label 压到最短
 *   tiers     works[].detail.architecture.tiers 的 code / name / techTags
 *   shots     scripts/build-shots.ts 产出的 ShotId
 *
 * 展台主调取自截图本身的界面配色（spec 4.3.2），只作用于框线与光效，
 * 面积占比 < 8%。真值在 tokens.css 的 --stage-*，这里只引令牌名。
 *
 * 文案每加一个新汉字都要过字体预算（spec 7.2），改完必须跑 npm run fonts:subset。
 */
import type { ShotId } from './shots.generated'

export interface Metric {
  /** 指标名。中文，尽量两到四字。 */
  label: string
  /** 指标值。数字与拉丁为主。 */
  value: string
}

export interface Tier {
  /** 分层代号，走 hud 字体。 */
  code: string
  name: string
  tags: readonly string[]
}

export interface Project {
  id: string
  /** 两位序号，走 hud 字体。 */
  index: string
  name: string
  nameEn: string
  /** 一句话说清它是什么。卡面主文案。 */
  brief: string
  /** 线上地址。主站维护权威链接，本站只给一个入口。 */
  live: string
  /** 展台主调的令牌名。只准用在框线与光效上。 */
  tone: string
  /** 主图。1600 / 960 两档。 */
  shot: ShotId
  /** 展开档案里的副图，只有 960 一档。 */
  gallery: readonly ShotId[]
  stack: readonly string[]
  metrics: readonly [Metric, Metric, Metric]
  tiers: readonly Tier[]
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'zgyc',
    index: '01',
    name: '智光耀城',
    nameEn: 'Smart Light Platform',
    brief: '城市道路照明与多功能灯杆的管控台。契约驱动生成前端客户端，遥测走事务后事件广播。',
    live: 'https://zht.makeup/',
    tone: 'var(--stage-zgyc)',
    shot: 'zgyc-map',
    gallery: ['zgyc-realtime', 'zgyc-policy', 'zgyc-alarm'],
    stack: ['Java 21', 'Spring Boot 3.5', 'Vue 3', 'PostgreSQL 17'],
    metrics: [
      { label: '业务闭环', value: '3' },
      { label: '契约同步', value: '100% 代码化' },
      { label: '遥测时延', value: '< 50 ms' },
    ],
    tiers: [
      { code: 'TIER 01', name: '管理台与地图', tags: ['Vue 3', 'Naive UI', 'ECharts'] },
      { code: 'TIER 02', name: '契约与事件总线', tags: ['OpenAPI 3.1', 'Orval', 'SSE'] },
      { code: 'TIER 03', name: '领域服务与鉴权', tags: ['Spring Boot', 'MyBatis-Plus', 'Sa-Token'] },
      { code: 'TIER 04', name: '持久化与仿真', tags: ['PostgreSQL', 'Flyway', 'Docker Compose'] },
    ],
  },
  {
    id: 'zhixueban',
    index: '02',
    name: '智学伴',
    nameEn: 'IntelliBuddy',
    brief: '以知识拓扑图谱牵引的学习平台。多个模型按顺序容灾降级，回答走流式管道。',
    live: 'https://intellibuddy.luck007.online/',
    tone: 'var(--stage-zhixueban)',
    shot: 'zhixueban-knowledge',
    gallery: ['zhixueban-chat', 'zhixueban-roadmap'],
    stack: ['Vue 3', 'TypeScript', 'Express', 'MongoDB', 'AntV X6'],
    metrics: [
      { label: '拓扑图谱', value: 'AntV X6' },
      { label: '首字时延', value: 'TTFT < 800 ms' },
      { label: '容灾调度', value: '99.9%' },
    ],
    tiers: [
      { code: 'TIER 01', name: '图谱与流式界面', tags: ['Vue 3', 'AntV X6', 'Pinia'] },
      { code: 'TIER 02', name: '实时网关与分发', tags: ['Node.js', 'Express', 'SSE'] },
      { code: 'TIER 03', name: '多模型容灾调度', tags: ['Failover Pool', 'RBAC'] },
      { code: 'TIER 04', name: '持久化与工程', tags: ['MongoDB', 'pnpm Monorepo'] },
    ],
  },
  {
    id: 'matrix',
    index: '03',
    name: '矩阵计算器',
    nameEn: 'Exact Rational Matrix',
    brief: '用 BigInt 在分数域上精确消元的纯前端内核。行变换按操作日志回放，推导逐步给出。',
    live: 'https://atelier.luck007.online/',
    tone: 'var(--stage-matrix)',
    shot: 'matrix-main',
    gallery: ['matrix-trace'],
    stack: ['Vue 3', 'TypeScript', 'BigInt', 'fast-check'],
    metrics: [
      { label: '截断误差', value: '0' },
      { label: '最大阶数', value: '100 × 100' },
      { label: '运行时依赖', value: '0' },
    ],
    tiers: [
      { code: 'TIER 01', name: '交互与排版', tags: ['Vue 3', 'TypeScript', 'Vite'] },
      { code: 'TIER 02', name: '调度与操作日志', tags: ['Web Worker', 'Event Sourcing'] },
      { code: 'TIER 03', name: '代数消元内核', tags: ['BigInt', 'Bareiss', 'Faddeev–LeVerrier'] },
      { code: 'TIER 04', name: '公理验证体系', tags: ['Vitest', 'fast-check', 'SymPy'] },
    ],
  },
] as const
