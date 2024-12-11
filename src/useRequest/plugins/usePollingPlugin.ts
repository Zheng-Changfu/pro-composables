import { computed, onScopeDispose, ref, toValue } from 'vue'
import type { Plugin } from '../types'

export const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    pollingInterval,
    pollingWhenHidden,
    pollingErrorRetryCount = -1,
  },
) => {
  let timer: any
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

      // if(

      // )
    },
  }
}
