/**
 * subset-font 没有随包发类型。只声明我们实际用到的那部分，
 * 不去补全整个 API——补了也没人维护。
 */
declare module 'subset-font' {
  interface SubsetOptions {
    targetFormat?: 'sfnt' | 'woff' | 'woff2'
    variationAxes?: Record<string, { min?: number; max?: number; default?: number }>
    noLayoutClosure?: boolean
  }

  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: SubsetOptions,
  ): Promise<Buffer>
}
