import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export const fieldIndexContextKey = Symbol('fieldIndex') as InjectionKey<Ref<number> | number>

export function provideFieldIndex(index: Ref<number>) {
  provide(fieldIndexContextKey, index)
}

export function useInjectFieldIndex() {
  return inject(fieldIndexContextKey, -1)
}
