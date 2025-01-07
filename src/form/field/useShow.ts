import { isBoolean } from 'lodash-es'
import { computed, unref } from 'vue'
import type { FieldOptions } from './types'

export function useShow(
  propHidden: FieldOptions['hidden'],
  propVisible: FieldOptions['visible'],
) {
  const showRef = computed(() => {
    // priority：visible > hidden
    const visible = unref(propVisible)
    if (isBoolean(visible))
      return visible

    const hidden = unref(propHidden)
    if (isBoolean(hidden))
      return !hidden

    return true
  })

  return {
    show: showRef,
  }
}
