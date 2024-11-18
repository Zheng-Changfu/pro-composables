import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import type { BaseForm } from './types'

export const formContextKey = Symbol('formContext') as InjectionKey<BaseForm>
export function provideInternalForm(form: BaseForm) {
  provide(formContextKey, form)
}

export function useInjectInternalForm() {
  return inject(formContextKey, null)
}
