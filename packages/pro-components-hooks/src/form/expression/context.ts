import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'

export const expressionContextKey = Symbol('expression') as InjectionKey<Record<string, any>>
export function provideExpressionContext(ctx: Record<string, any>) {
  provide(expressionContextKey, ctx)
}

export function useInjectExpressionContext(ctx: Record<string, any> = {}) {
  return {
    ...inject(expressionContextKey, {}),
    ...ctx,
  }
}
