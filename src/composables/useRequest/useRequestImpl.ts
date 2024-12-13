import { onMounted, onUnmounted, toRefs } from 'vue'
import type { Options, Plugin, Result, Service } from './types'
import { Fetch } from './Fetch'

export function useRequestImpl<Data, Params extends any[]>(
  service: Service<Data, Params>,
  options: Options<Data, Params> = {},
  plugins: Plugin<Data, Params>[] = [],
) {
  const {
    manual = false,
    ...rest
  } = options

  const fetchOptions = {
    manual,
    ...rest,
  }

  const initState = plugins.map(p => p?.onInit?.(fetchOptions)).filter(Boolean)
  const fetchInstance = new Fetch<Data, Params>(
    service,
    fetchOptions,
    Object.assign({}, ...initState),
  )
  fetchInstance.options = fetchOptions
  fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions))

  onMounted(() => {
    if (!manual) {
      // @ts-ignore
      fetchInstance.run()
    }
  })

  onUnmounted(() => {
    fetchInstance.cancel()
  })

  const {
    data,
    error,
    params,
    loading,
  } = toRefs(fetchInstance.state)

  const {
    run,
    mutate,
    cancel,
    refresh,
    runAsync,
    refreshAsync,
  } = fetchInstance

  return {
    data,
    error,
    params,
    loading,
    run,
    cancel,
    mutate,
    refresh,
    runAsync,
    refreshAsync,
  } as Result<Data, Params>
}
