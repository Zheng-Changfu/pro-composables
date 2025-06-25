import type { ComputedRef } from 'vue'
import { isArray } from 'lodash-es'
import { computed, toRaw } from 'vue'
import { uid } from '../../utils/id'
import { useInjectInternalForm } from '../context'

interface UseValueOptions {
  onUpdateValue?: (value: any, ...args: any[]) => void
}

export const ROW_UUID_KEY = Symbol(
  process.env.NODE_ENV !== 'production'
    ? 'ROW_UUID_KEY'
    : '',
)
export function useValue<T = any>(id: string, path: ComputedRef<string[]>, options: UseValueOptions) {
  const form = useInjectInternalForm()
  const { onUpdateValue } = options
  const listItemToUUIDMap = new WeakMap<object, string>()

  const proxy = computed({
    get,
    set,
  })

  const valueWithUid = computed(() => {
    const value = proxy.value
    if (!isArray(value)) {
      return []
    }
    return value.map((item) => {
      const rawItem = toRaw(item)
      if (!listItemToUUIDMap.has(rawItem)) {
        listItemToUUIDMap.set(rawItem, uid())
      }
      return {
        ...item,
        [ROW_UUID_KEY]: listItemToUUIDMap.get(rawItem),
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
      if (onUpdateValue) {
        onUpdateValue(value, ...args)
        return
      }
      proxy.value = value
    }
  }

  return {
    valueWithUid,
    doUpdateValue,
    value: proxy as ComputedRef<T>,
  }
}
