import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export const pathIndexContextKey = Symbol('pathIndex') as InjectionKey<Ref<number> | number>

export function providePathIndex(index: Ref<number>) {
  provide(pathIndexContextKey, index)
}

export function useInjectPathIndex() {
  return inject(pathIndexContextKey, -1)
}
