import type { InjectionKey } from 'vue'
import type { ArrayField, BaseField } from './types'
import { inject, provide } from 'vue'

export const fieldContextKey = Symbol('field') as InjectionKey<BaseField | ArrayField>
export function provideField(field: BaseField) {
  provide(fieldContextKey, field)
}

export function useInjectField(): BaseField | null
export function useInjectField(isArrayField: true): ArrayField | null
export function useInjectField(_?: boolean) {
  return inject(fieldContextKey, null)
}
