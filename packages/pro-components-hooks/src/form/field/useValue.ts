import type { ComputedRef, Ref } from 'vue-demi'
import { computed, watch } from 'vue-demi'
import { cloneDeep, get, has } from 'lodash-es'
import { useInjectFormContext } from '../context'
import { useCompile } from '../../hooks'
import { useInjectParentFieldContext } from './context'
import type { ExpressionScope } from './types'

interface UseValueOptions<T = any> {
  /**
   * 初始值
   */
  initialValue?: T
  /**
   * 默认值,优先级最低
   */
  defaultValue?: T
  /**
   * 字段路径
   */
  path: ComputedRef<string[]>
  /**
   * 表达式读取到的上下文
   */
  scope: ExpressionScope
  /**
   * 后置状态钩子，可以再次更改值
   */
  postState: ((val: T) => T) | undefined
}
export function useValue<T = any>(value: Ref<T> | undefined, options: UseValueOptions) {
  const form = useInjectFormContext()
  const parent = useInjectParentFieldContext()

  const {
    path,
    scope,
    postState,
    initialValue,
    defaultValue,
  } = options

  const proxy = computed({
    get() {
      return form.values.get(path.value)
    },
    set(val) {
      form.values.set(path.value, val)
    },
  })

  const compiledUserValue = useCompile(value!, { scope })
  watch(
    compiledUserValue,
    (val) => {
      if (form.values.has(path.value))
        proxy.value = val
    },
  )

  const updating = parent?.updating
  if (!updating && !form.values.has(path.value)) {
    // priority：value > initialValue > initialValues > defaultValue
    let val
    const p = path.value
    if (p.length > 0 && postState && !form.pathField.has(p)) {
      /**
       * 初始值的设置不应该放在 onMounted 中，因为会二次更新
       * 所以将 postState 先存进去，防止 postState 没有被触发
       */
      form.pathField.set(p, { postState } as any)
    }

    if (defaultValue !== undefined)
      val = defaultValue

    if (p.length > 0 && has(form.initialValues, p))
      val = get(form.initialValues, path.value)

    if (initialValue !== undefined)
      val = initialValue

    if (value && value.value !== undefined)
      val = compiledUserValue.value

    if (val !== undefined) {
      proxy.value = val
      if (p.length > 0)
        form.setInitialValue(p, cloneDeep(val))
    }
  }

  return {
    value: proxy as ComputedRef<T>,
    doUpdateValue: (val: T) => proxy.value = val,
  }
}
