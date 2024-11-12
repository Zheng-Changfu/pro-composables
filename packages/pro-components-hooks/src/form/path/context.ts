import type { ComputedRef, InjectionKey, Ref } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { InternalPath } from './types'

export const pathContextKey = Symbol('path') as InjectionKey<ComputedRef<InternalPath> | InternalPath>
export const pathIndexContextKey = Symbol('pathIndex') as InjectionKey<Ref<number> | number>
export function providePathContext(path: ComputedRef<InternalPath>) {
  provide(pathContextKey, path)
}

export function providePathIndexContext(index: Ref<number>) {
  provide(pathIndexContextKey, index)
}

export function useInjectPathContext() {
  return inject(pathContextKey, [])
}

export function useInjectPathIndexContext() {
  return inject(pathIndexContextKey, -1)
}
