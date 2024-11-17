import { nextTick, watch } from 'vue'
import type { BaseField } from '..'

export function useListUpdate(field: BaseField, fn: (updating: boolean) => void) {
  if (field.isList) {
    watch(field.value, () => {
      fn(true)
      nextTick(() => {
        fn(false)
      })
    })
  }
}
