import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { BaseForm } from './types'

export const formContextKey = Symbol('formContext') as InjectionKey<BaseForm>
export function provideForm(form: BaseForm) {
  provide(formContextKey, form)
}

export function useInjectForm() {
  return inject(formContextKey, null)
}
