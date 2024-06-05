import type { ComputedRef, Ref } from 'vue-demi'
import { computed, onMounted, watch } from 'vue-demi'
import { cloneDeep, get, has } from 'lodash-es'
import { useInjectFormContext } from '../context'
import type { InternalPath } from '../path'
import { useInjectFieldContext } from './context'

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
  path: ComputedRef<InternalPath>
}
export function useValue<T = any>(value: Ref<T> | undefined, options: UseValueOptions) {
  const form = useInjectFormContext()
  const parent = useInjectFieldContext()
  const { initialValue, defaultValue, path } = options

  const proxy = computed({
    get() {
      return form.values.get(path.value)
    },
    set(val) {
      form.values.set(path.value, val)
    },
  })

  if (value) {
    watch(
      value,
      (val) => {
        if (form.values.has(path.value))
          proxy.value = val
      },
    )
  }

  onMounted(() => {
    const updating = parent?.updating
    if (!updating) {
      // priority：value > initialValue > initialValues > defaultValue
      let val
      const p = path.value
      if (p.length > 0 && has(form.initialValues, p))
        val = get(form.initialValues, path.value)

      if (initialValue !== undefined)
        val = initialValue

      if (value && value.value !== undefined)
        val = value.value

      if (val === undefined && defaultValue !== undefined)
        val = defaultValue

      if (val !== undefined) {
        proxy.value = val
        if (p.length > 0)
          form.setInitialValue(p, cloneDeep(val))
      }
    }
  })

  return {
    value: proxy as ComputedRef<T>,
    doUpdateValue: (val: T) => proxy.value = val,
  }
}
