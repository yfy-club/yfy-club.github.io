/**
 * 是否开了系统级减弱动效。
 *
 * 预渲染与注水首帧一律按 false 走，挂载后再纠正——预渲染产物是同一份 HTML
 * 发给所有人，服务端不可能知道访客的偏好，首帧就分叉必然注水错位。
 * 依赖这个结论的组件本来也都是挂载后才出现的（见 use-mounted.ts）。
 */
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}
