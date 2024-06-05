import { isArray, isPlainObject, isString } from 'lodash-es'
import type { ComputedRef, Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { ExcludeExpression } from './types'

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

export function useCompile<T extends (string | Record<string, any> | Ref<any> | ComputedRef<Record<string, any>>)>(
  value: T,
  options: UseCompileOptions = {},
): ComputedRef<ExcludeExpression<T>> {
  const { scope = {} } = options
  return computed(() => {
    if (isString(value))
      return compile(value, scope)

    const records = unref(value)
    if (records === undefined)
      return records

    if (!isArray(records) && !isPlainObject(records))
      return records

    const traverse = (data: any) => {
      if (!isArray(data) && !isPlainObject(data))
        return data
      const ret: any = isArray(data) ? [] : {}
      for (const key in data) {
        const val = traverse(data[key])
        ret[key] = compile(val, scope)
      }
      return ret
    }
    return traverse(records) as T
  })
}
