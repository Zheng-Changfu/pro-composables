import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import { isArray } from 'lodash-es'
import { useInjectInternalForm } from '../context'
import { uid } from '../../utils/id'

interface UseValueOptions {
  onInputValue?: (fieldValue: Ref<any>, inputValue: any, ...args: any[]) => void
}

export const ROW_UUID = Symbol(
  process.env.NODE_ENV !== 'production'
    ? 'ROW_UUID'
    : '',
)
export function useValue<T = any>(id: string, path: ComputedRef<string[]>, options: UseValueOptions) {
  const form = useInjectInternalForm()
  const { onInputValue } = options

  const proxy = computed({
    get,
    set,
  })

  const uidValue = computed(() => {
    const value = proxy.value
    if (!isArray(value)) {
      return value
    }
    value.forEach((item) => {
      if (!item[ROW_UUID]) {
        item[ROW_UUID] = uid()
      }
    })
    return value
  })

  function get() {
    const p = path.value
    const storeValue = form?.valueStore.getFieldValue(p)
    return storeValue
  }

  function set(val: any) {
    form?.valueStore.setFieldValue(path.value, val)
    const field = form?.fieldStore.getField(id)
    if (field)
      field.touching = false
  }

  function doUpdateValue(value: any, ...args: any[]) {
    const field = form?.fieldStore.getField(id)
    if (field)
      field.touching = true
    if (onInputValue) {
      onInputValue(proxy, value, ...args)
      return
    }
    proxy.value = value
  }

  return {
    uidValue,
    doUpdateValue,
    value: proxy as ComputedRef<T>,
  }
}
