import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'

export const compileScopeContextKey = Symbol('compileScope') as InjectionKey<Record<string, any>>
export function provideCompileScopeContext(ctx: Record<string, any>) {
  provide(compileScopeContextKey, ctx)
}

export function useInjectCompileScopeContext(scope: Record<string, any> = {}) {
  return {
    ...inject(compileScopeContextKey, {}),
    ...scope,
  }
}
