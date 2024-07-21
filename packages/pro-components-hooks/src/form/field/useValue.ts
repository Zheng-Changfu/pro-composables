import type { ComputedRef } from 'vue-demi'
import { computed } from 'vue-demi'
import { useInjectFormContext } from '../context'

interface UseValueOptions {
  onChange?: (val: any) => void
  postState?: (val: any) => any
}

export function useValue<T = any>(id: string, path: ComputedRef<string[]>, options: UseValueOptions) {
  let firstGetValue = true
  let cachedValue: any = Symbol('')
  const form = useInjectFormContext()

  const {
    onChange,
    postState,
  } = options

  const proxy = computed({
    get,
    set,
  })

  function get() {
    const p = path.value
    let storeValue = form.valueStore.getFieldValue(p)

    if (postState) {
      if (Object.is(storeValue, cachedValue))
        return cachedValue
      // vModel Store
      const postValue = cachedValue = storeValue = postState(storeValue)
      form.valueStore.setFieldValue(p, postValue)
    }

    const field = form.fieldStore.getField(id)
    const changed = !firstGetValue
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
