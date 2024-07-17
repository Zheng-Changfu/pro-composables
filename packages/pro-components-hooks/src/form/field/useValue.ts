import type { ComputedRef } from 'vue-demi'
import { computed, nextTick } from 'vue-demi'
import { useInjectFormContext } from '../context'

interface UseValueOptions {
  onChange?: (val: any) => void
  postState?: (val: any) => any
}
export function useValue<T = any>(id: string, path: ComputedRef<string[]>, options: UseValueOptions) {
  let updating = false
  let firstGetValue = true
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
    if (!updating) {
      if (postState) {
        updating = true
        // #region
        // vModel Store
        const postValue = storeValue = postState(storeValue)
        form.valueStore.setFieldValue(p, postValue)
        // #endregion
        nextTick(() => {
          updating = false
        })
      }

      const changed = !firstGetValue
      const field = form.fieldStore.getField(id)
      firstGetValue = false

      if (
        changed
        && field
        && field.show.value
      ) {
        form.triggerFieldValueChange({
          field,
          value: storeValue,
        })

        if (onChange)
          onChange(storeValue)
      }
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
