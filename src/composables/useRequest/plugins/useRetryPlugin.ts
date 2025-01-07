import type { Plugin } from '../types'
import { toValue } from '@vueuse/core'
import { computed, onScopeDispose, ref } from 'vue'

export const useRetryPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    retryCount,
    retryInterval,
  },
) => {
  let timer: any
  const retryedCount = ref(0)

  const options = computed(() => {
    return {
      retryCount: toValue(retryCount),
      retryInterval: toValue(retryInterval),
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
    onSuccess() {
      retryedCount.value = 0
    },
    onCancel() {
      retryedCount.value = 0
      stop()
    },
    onError() {
      const {
        retryCount,
        retryInterval,
      } = options.value

      if (!retryCount) {
        stop()
        return
      }

      retryedCount.value++
      if (retryCount === -1 || retryedCount.value <= retryCount) {
        const timeout = retryInterval ?? Math.min(1000 * 2 ** retryedCount.value, 30000)
        timer = setTimeout(() => {
          fetchInstance.refresh()
        }, timeout)
      }
      else {
        retryedCount.value = 0
      }
    },
  }
}
