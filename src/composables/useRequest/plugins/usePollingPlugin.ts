import type { AnyFn } from '@vueuse/core'
import type { Plugin } from '../types'
import { toValue, useEventListener } from '@vueuse/core'
import { computed, onScopeDispose, ref } from 'vue'
import isBrowser from '../../../utils/isBrowser'
import { isDocumentVisible } from '../utils/isDocumentVisible'

export const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    pollingInterval,
    pollingWhenHidden = true,
    pollingErrorRetryCount = -1,
  },
) => {
  let timer: any
  let cleanup: AnyFn | undefined
  const retryedCount = ref(0)

  const options = computed(() => {
    return {
      pollingInterval: toValue(pollingInterval),
      pollingWhenHidden: toValue(pollingWhenHidden),
      pollingErrorRetryCount: toValue(pollingErrorRetryCount),
    }
  })

  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    cleanup && cleanup()
  }

  onScopeDispose(stop)
  return {
    onBefore() {
      stop()
    },
    onError() {
      retryedCount.value++
    },
    onSuccess() {
      retryedCount.value = 0
    },
    onCancel() {
      stop()
    },
    onFinally() {
      const {
        pollingInterval,
        pollingWhenHidden,
        pollingErrorRetryCount,
      } = options.value

      if (!pollingInterval || pollingInterval <= 0) {
        stop()
        return
      }
      if (
        pollingErrorRetryCount === -1
        || retryedCount.value <= pollingErrorRetryCount
      ) {
        timer = setTimeout(() => {
          if (!pollingWhenHidden && !isDocumentVisible()) {
            if (isBrowser) {
              cleanup = useEventListener(window, 'visibilitychange', () => {
                if (isDocumentVisible()) {
                  fetchInstance.refresh()
                }
              }, false)
            }
          }
          else {
            fetchInstance.refresh()
          }
        }, pollingInterval)
      }
      else {
        retryedCount.value = 0
      }
    },
  }
}
