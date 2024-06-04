import type { Ref } from 'vue-demi'
import { computed } from 'vue-demi'

export function useShow(visible: Ref<boolean | undefined> | undefined, hidden: Ref<boolean | undefined> | undefined) {
  const showRef = computed(() => {
    // priority：visible > hidden
    if (visible !== undefined && visible.value !== undefined)
      return visible.value

    if (hidden !== undefined && hidden.value !== undefined)
      return !hidden.value

    return true
  })

  return {
    show: showRef,
  }
}
