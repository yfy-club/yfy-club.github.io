/**
 * 段落动态模糊与虚焦效果已彻底移除，正文始终保持清晰可读。
 */
import { type RefObject } from 'react'

export function useFocusScroll(
  _root: RefObject<HTMLElement | null>,
  _enabled: boolean,
  _key: string,
) {
  // no-op: 保持接口兼容
}
