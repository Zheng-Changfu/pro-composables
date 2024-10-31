import type { ComputedRef } from 'vue-demi'
import { computed } from 'vue-demi'
import { useInjectFormContext } from '../context'

interface UseValueOptions {
  onChange?: (val: any) => void
}

export function useValue<T = any>(id: string, path: ComputedRef<string[]>, options: UseValueOptions) {
  let firstGetValue = true
  const { onChange } = options
  const form = useInjectFormContext()!

  const proxy = computed({
    get,
    set,
  })

  function get(oldValue: any) {
    const p = path.value
    const storeValue = form.valueStore.getFieldValue(p)

    const field = form.fieldStore.getField(id)
    const changed = !firstGetValue && !Object.is(oldValue, storeValue)
    firstGetValue = false

    if (field && changed) {
      form.triggerFieldValueChange({
        field,
        value: storeValue,
      })

      if (onChange)
        onChange(storeValue)
    }

    return storeValue
  }

  function set(val: any) {
    form.valueStore.setFieldValue(path.value, val)
  }

  return {
    value: proxy as ComputedRef<T>,
    doUpdateValue: (val: T) => proxy.value = val,
  }
}
