import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { ArrayField, BaseField } from './types'

export const listFieldContextKey = Symbol('listField') as InjectionKey<ArrayField>
export function provideListField(field: ArrayField) {
  provide(listFieldContextKey, field)
}

export function useInjectListField() {
  return inject(listFieldContextKey, null)
}

export const fieldContextKey = Symbol('field') as InjectionKey<BaseField>
export function provideField(field: BaseField) {
  provide(fieldContextKey, field)
}

export function useInjectField() {
  return inject(fieldContextKey, null)
}
