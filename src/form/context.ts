import type { InjectionKey } from 'vue'
import type { BaseForm } from './types'
import { inject, provide } from 'vue'

export const formContextKey = Symbol('formContext') as InjectionKey<BaseForm>
export function provideInternalForm(form: BaseForm) {
  provide(formContextKey, form)
}

export function useInjectInternalForm() {
  return inject(formContextKey, null)
}
