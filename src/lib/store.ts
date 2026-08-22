/**
 * 极简外部 store，配 useSyncExternalStore 用。
 *
 * 为什么不用 context：弹幕开关在导航条里、轨道在 Hero 里，而 BGM 的 <audio>
 * 必须活过换路由——Nav 在 / 与 /docs 是两棵树里的两个实例，换路由整个重挂，
 * 挂在组件上的音频元素会被一起销毁，歌就断了。状态放模块级，谁订阅谁拿。
 *
 * 服务端快照与客户端首帧快照是同一个对象：所有写入都在 effect 里发生，
 * 预渲染期不碰它，注水不会错位。
 */
import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get(): T
  set(next: T): void
  subscribe(listener: () => void): () => void
}

export function createStore<T>(initial: T): Store<T> {
  let snapshot = initial
  const listeners = new Set<() => void>()

  return {
    get: () => snapshot,
    set(next) {
      if (Object.is(next, snapshot)) return
      snapshot = next
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
