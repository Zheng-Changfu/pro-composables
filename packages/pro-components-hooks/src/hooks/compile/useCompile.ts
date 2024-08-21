import { isArray, isPlainObject, isString } from 'lodash-es'
import type { ComputedRef, Ref, UnwrapRef } from 'vue-demi'
import { computed, isProxy, unref } from 'vue-demi'
import type { ExcludeExpression } from './types'

const expressionReg = /\{\{([\s\S]*)\}\}/
const scopeToProxyWeakMap = new WeakMap<Record<string, any>, Record<string, any>>()

// scope 里面有的是 ref 数据，需要自动解包
function unwrapScope(scope: Record<string, any>) {
  if (scopeToProxyWeakMap.has(scope))
    return scopeToProxyWeakMap.get(scope)!

  const proxy = new Proxy(scope, {
    get(target, key, receiver) {
      return unref(Reflect.get(target, key, receiver))
    },
    set() {
      throw new Error('not set!')
    },
  })
  scopeToProxyWeakMap.set(scope, proxy)
  return proxy
}

export function baseCompile(source: any, scope: Record<string, any>) {
  if (!isString(source))
    return source

  const [,expression] = source.match(expressionReg) ?? []
  if (!expression)
    return source

  const unwrapedScope = unwrapScope(scope)
  // eslint-disable-next-line no-new-func
  return new Function('$ctx', `with($ctx){ return ${expression} }`)(unwrapedScope)
}

export function compile<T = any>(source: T, scope: Record<string, any>): ExcludeExpression<T> {
  if (isString(source))
    return baseCompile(source, scope)

  if (source === undefined)
    return source as any

  const traverse = (data: any) => {
    if (
      !isProxy(data)
      && !isArray(data)
      && !isPlainObject(data)
    )
      return data
    const ret: any = isArray(data) ? [] : {}
    for (const key in data) {
      const val = traverse(data[key])
      ret[key] = baseCompile(val, scope)
    }
    return ret
  }
  return traverse(source)
}

export interface UseCompileOptions {
  /**
   * 表达式可以读取到的内容
   */
  scope?: Record<string, any>
}

export function useCompile<T extends (string | Record<string, any> | Ref<any> | ComputedRef<Record<string, any>>)>(
  value: T,
  options: UseCompileOptions = {},
): ComputedRef<ExcludeExpression<UnwrapRef<T>>> {
  const { scope = {} } = options
  return computed(() => {
    const source = unref(value)
    return compile(source, scope)
  })
}
