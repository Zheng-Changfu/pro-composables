import type { ComputedRef, Ref } from 'vue'
import { isArray } from 'lodash-es'
import { computed, toRaw } from 'vue'
import { uid } from '../../utils/id'
import { useInjectInternalForm } from '../context'

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
  const listItemToUUIDMap = new WeakMap<object, string>()

  const proxy = computed({
    get,
    set,
  })

  const uidValue = computed(() => {
    const value = proxy.value
    if (!isArray(value)) {
      return value
    }
    return value.map((item) => {
      const rawItem = toRaw(item)
      if (!listItemToUUIDMap.has(rawItem)) {
        listItemToUUIDMap.set(rawItem, uid())
      }
      return {
        ...item,
        [ROW_UUID]: listItemToUUIDMap.get(rawItem),
      }
    })
  })

  function get() {
    const p = path.value
    return form
      ? form._.valueStore.getFieldValue(p)
      : undefined
  }

  function set(val: any) {
    if (form) {
      form._.valueStore.setFieldValue(path.value, val)
      const field = form._.fieldStore.getField(id)
      if (field)
        field.touching = false
    }
  }

  function doUpdateValue(value: any, ...args: any[]) {
    if (form) {
      const field = form._.fieldStore.getField(id)
      if (field) {
        field.touching = true
      }
      if (onInputValue) {
        onInputValue(proxy, value, ...args)
        return
      }
      proxy.value = value
    }
  }

  return {
    uidValue,
    doUpdateValue,
    value: proxy as ComputedRef<T>,
  }
}
