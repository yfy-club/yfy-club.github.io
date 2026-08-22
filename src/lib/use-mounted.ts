/**
 * 挂载完成没有。
 *
 * 只在客户端才成立的界面（读 localStorage、探测音频文件、判减弱动效）
 * 必须等这个转成 true 再渲染，否则预渲染产物与首帧不一致，注水会报错。
 */
import { useEffect, useState } from 'react'

export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
