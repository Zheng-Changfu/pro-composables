import { onScopeDispose, toValue } from 'vue'
import type { Plugin } from '../types'

export const useLoadingDelayPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { loadingDelay },
) => {
  let timer: any

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
      const delay = toValue(loadingDelay)
      if (!delay) {
        return {}
      }
      else {
        timer = setTimeout(() => {
          fetchInstance.setState({
            loading: true,
          })
        }, delay)
      }

      return {
        loading: false,
      }
    },
    onFinally() {
      stop()
    },
    onCancel() {
      stop()
    },
  }
}
