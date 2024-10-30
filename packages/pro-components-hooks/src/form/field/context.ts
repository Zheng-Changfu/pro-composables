import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { ArrayField, BaseField } from './types'

export const listFieldContextKey = Symbol('listField') as InjectionKey<ArrayField>
export function provideParentFieldContext(field: ArrayField) {
  provide(listFieldContextKey, field)
}

export function useInjectListFieldContext() {
  return inject(listFieldContextKey, null)
}

export const fieldContextKey = Symbol('field') as InjectionKey<BaseField>
export function provideFieldContext(field: BaseField) {
  provide(fieldContextKey, field)
}

export function useInjectFieldContext() {
  return inject(fieldContextKey, null)
}
