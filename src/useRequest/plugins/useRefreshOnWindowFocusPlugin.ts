import { computed, toValue, watch } from 'vue'
import type { AnyFn } from '@vueuse/core'
import { useEventListener } from '@vueuse/core'
import type { Plugin } from '../types'
import { isDocumentVisible } from '../utils/isDocumentVisible'
import { isOnline } from '../utils/isOnline'
import isBrowser from '../../utils/isBrowser'
import limit from '../utils/limit'

export const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    refreshOnWindowFocus,
    focusTimespan = 5000,
  },
) => {
  const cleanups: AnyFn[] = []

  const options = computed(() => {
    return {
      focusTimespan: toValue(focusTimespan),
      refreshOnWindowFocus: toValue(refreshOnWindowFocus),
    }
  })

  function focusHandler() {
    if (!isDocumentVisible() || !isOnline())
      return
    const limitRefresh = limit(fetchInstance.refresh, options.value.focusTimespan)
    limitRefresh()
  }

  function stop() {
    cleanups.forEach(cleanup => cleanup())
    cleanups.length = 0
  }

  watch(options, () => {
    stop()
    if (isBrowser && options.value.refreshOnWindowFocus) {
      cleanups.push(
        useEventListener(window, 'focus', focusHandler, false),
        useEventListener(window, 'visibilitychange', focusHandler, false),
      )
    }
  }, { immediate: true })

  return {}
}
