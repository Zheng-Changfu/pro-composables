import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { BaseForm } from './types'

export const formContextKey = Symbol('formContext') as InjectionKey<BaseForm>
export function provideForm(form: BaseForm) {
  provide(formContextKey, form)
}

export function useInjectForm() {
  return inject(formContextKey, null)
}
