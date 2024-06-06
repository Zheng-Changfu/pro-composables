import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { ArrayField, BaseField } from './types'

export const parentFieldContextKey = Symbol('parentField') as InjectionKey<ArrayField>
export function provideParentFieldContext(field: ArrayField) {
  provide(parentFieldContextKey, field)
}

export function useInjectParentFieldContext() {
  return inject(parentFieldContextKey, null)
}

export const fieldContextKey = Symbol('field') as InjectionKey<BaseField>
export function provideFieldContext(field: BaseField) {
  provide(fieldContextKey, field)
}

export function useInjectFieldContext() {
  return inject(fieldContextKey, null)
}
