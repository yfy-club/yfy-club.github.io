/**
 * 构建期注入的常量，见 vite.config.ts 的 define。
 *
 * public/audio/ 里真实存在的 BGM 文件路径（相对 BASE_URL）。
 * 空数组表示没放文件，导航条上的声音开关不出现。规格 5.5。
 */
declare const __BGM_SOURCES__: readonly string[]

/**
 * 环境变量。规格 3.6（M9）。
 *
 * VITE_QA_ENDPOINT 是向导问答的**边缘代理**地址，不是 new-api 的地址。
 * 代理才持有 new-api 的 token —— token 进了前端包就是公开的，
 * 任何人都能刷额度，受限 token 只能限制损失范围，挡不住滥用。
 *
 * 没配置时问答入口整个不渲染（规格 5.5 的「不留死按钮」），
 * 所以本地开发不配也能正常跑，只是看不到那枚键。
 */
interface ImportMetaEnv {
  readonly VITE_QA_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
