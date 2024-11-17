import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'
import type { InternalPath } from './types'

export const pathContextKey = Symbol('path') as InjectionKey<ComputedRef<InternalPath> | InternalPath>
export const pathIndexContextKey = Symbol('pathIndex') as InjectionKey<Ref<number> | number>
export function providePath(path: ComputedRef<InternalPath>) {
  provide(pathContextKey, path)
}

export function providePathIndex(index: Ref<number>) {
  provide(pathIndexContextKey, index)
}

export function useInjectPath() {
  return inject(pathContextKey, [])
}

export function useInjectPathIndex() {
  return inject(pathIndexContextKey, -1)
}
