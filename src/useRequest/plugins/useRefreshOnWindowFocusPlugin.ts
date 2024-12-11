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

  function stop() {
    cleanups.forEach(cleanup => cleanup())
    cleanups.length = 0
  }

  function subscribeFocus(handler: AnyFn) {
    const wrapHandler = () => {
      if (!isDocumentVisible() || !isOnline())
        return
      handler()
    }
    cleanups.push(
      useEventListener(window, 'focus', wrapHandler, false),
      useEventListener(window, 'visibilitychange', wrapHandler, false),
    )
  }

  watch(options, () => {
    stop()
    const {
      focusTimespan,
      refreshOnWindowFocus,
    } = options.value

    if (isBrowser && refreshOnWindowFocus) {
      const limitRefresh = limit(fetchInstance.refresh, focusTimespan)
      subscribeFocus(() => {
        limitRefresh()
      })
    }
  }, { immediate: true })

  return {}
}
