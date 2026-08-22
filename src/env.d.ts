/**
 * 构建期注入的常量，见 vite.config.ts 的 define。
 *
 * public/audio/ 里真实存在的 BGM 文件路径（相对 BASE_URL）。
 * 空数组表示没放文件，导航条上的声音开关不出现。规格 5.5。
 */
declare const __BGM_SOURCES__: readonly string[]
