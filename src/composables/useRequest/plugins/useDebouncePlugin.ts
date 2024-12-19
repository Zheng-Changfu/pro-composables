import { computed, onScopeDispose, watch } from 'vue'
import type { DebounceSettings, DebouncedFunc } from 'lodash-es'
import { debounce } from 'lodash-es'
import type { AnyFn } from '@vueuse/core'
import { toValue } from '@vueuse/core'
import type { Plugin } from '../types'

export const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    debounceWait,
    debounceLeading,
    debounceMaxWait,
    debounceTrailing,
  },
) => {
  let cleanup: AnyFn | undefined
  let debounceFunc: DebouncedFunc<AnyFn> | undefined

  const options = computed(() => {
    const ret: DebounceSettings = {}
    const leading = toValue(debounceLeading)
    const maxWait = toValue(debounceMaxWait)
    const trailing = toValue(debounceTrailing)
    if (leading !== undefined) {
      ret.leading = leading
    }
    if (maxWait !== undefined) {
      ret.maxWait = maxWait
    }
    if (trailing !== undefined) {
      ret.trailing = trailing
    }
    return ret
  })

  watch(() => [options.value, toValue(debounceWait)], (_, __, onCleanup) => {
    const wait = toValue(debounceWait)
    if (wait) {
      const { runAsync: originRunAsync } = fetchInstance

      debounceFunc = debounce(
        (callback) => {
          callback()
        },
        wait,
        options.value,
      )

      fetchInstance.runAsync = (...params: any[]) => {
        return new Promise((resolve, reject) => {
          debounceFunc!(() => {
            originRunAsync(...params)
              .then(resolve)
              .catch(reject)
          })
        })
      }

      cleanup = () => {
        if (debounceFunc) {
          debounceFunc.cancel()
          debounceFunc = undefined
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
