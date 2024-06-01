import type { ComputedRef, InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { Path } from './types'

export const pathContextKey = Symbol('path') as InjectionKey<ComputedRef<Path> | Path>
export function providePathContext(path: ComputedRef<Path>) {
  provide(pathContextKey, path)
}

export function useInjectPathContext() {
  return inject(pathContextKey, [])
}
