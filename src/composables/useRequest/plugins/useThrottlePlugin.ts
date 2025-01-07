import type { AnyFn } from '@vueuse/core'
import type { DebouncedFunc, DebounceSettings } from 'lodash-es'
import type { Plugin } from '../types'
import { toValue } from '@vueuse/core'
import { throttle } from 'lodash-es'
import { computed, onScopeDispose, watch } from 'vue'

export const useThrottlePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    throttleWait,
    throttleLeading,
    throttleTrailing,
  },
) => {
  let cleanup: AnyFn | undefined
  let throttleFunc: DebouncedFunc<AnyFn> | undefined

  const options = computed(() => {
    const ret: DebounceSettings = {}
    const leading = toValue(throttleLeading)
    const trailing = toValue(throttleTrailing)
    if (leading !== undefined) {
      ret.leading = leading
    }
    if (trailing !== undefined) {
      ret.trailing = trailing
    }
    return ret
  })

  watch(() => [options.value, toValue(throttleWait)], (_, __, onCleanup) => {
    const wait = toValue(throttleWait)
    if (wait) {
      const { runAsync: originRunAsync } = fetchInstance

      throttleFunc = throttle(
        (callback) => {
          callback()
        },
        wait,
        options.value,
      )

      fetchInstance.runAsync = (...params: any[]) => {
        return new Promise((resolve, reject) => {
          throttleFunc!(() => {
            originRunAsync(...params)
              .then(resolve)
              .catch(reject)
          })
        })
      }

      cleanup = () => {
        if (throttleFunc) {
          throttleFunc.cancel()
          throttleFunc = undefined
        }
        fetchInstance.runAsync = originRunAsync
      }

      onCleanup(cleanup)
    }
  }, { immediate: true })

  onScopeDispose(() => cleanup && cleanup())
  return {
    onCancel() {
      cleanup && cleanup()
    },
  }
}
