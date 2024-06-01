import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { ArrayField } from './types'

export const fieldContextKey = Symbol('field') as InjectionKey<ArrayField>
export function provideFieldContext(field: ArrayField) {
  provide(fieldContextKey, field)
}

export function useInjectFieldContext() {
  return inject(fieldContextKey, null)
}
