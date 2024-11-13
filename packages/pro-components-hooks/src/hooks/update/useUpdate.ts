import { nextTick, watch } from 'vue-demi'
import type { BaseField } from '../../form'

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
