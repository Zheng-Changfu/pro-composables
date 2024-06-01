import { isString } from 'lodash-es'
import { type ComputedRef, computed, unref } from 'vue-demi'

const expressionReg = /\{\{([\s\S]*)\}\}/

function compile(source: any, scope: Record<string, any>) {
  if (!isString(source))
    return source
  const [,expression] = source.match(expressionReg) ?? []
  if (!expression)
    return source
  // eslint-disable-next-line no-new-func
  return new Function('$ctx', `with($ctx){ return ${expression} }`)(scope)
}

export interface UseCompileOptions {
  /**
   * 表达式可以读取到的内容
   */
  scope?: Record<string, any>
}

export function useCompile<T = any>(
  value: string | Record<string, any> | ComputedRef<Record<string, any>>,
  options: UseCompileOptions = {},
): ComputedRef<T> {
  const { scope = {} } = options
  return computed(() => {
    if (isString(value))
      return compile(value, scope) as T
    const records = unref(value)
    const ret: any = {}
    for (const key in records)
      ret[key] = compile(records[key], scope)
    return ret as T
  })
}
