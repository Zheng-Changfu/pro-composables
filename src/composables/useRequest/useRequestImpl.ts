import { isArray } from 'lodash-es'
import { onMounted, onUnmounted, toRefs } from 'vue'
import { warnOnce } from '../../utils/warn'
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

  if (process.env.NODE_ENV !== 'production') {
    if (options.defaultParams && !isArray(options.defaultParams)) {
      warnOnce(`expected defaultParams is array, got ${typeof options.defaultParams}`)
    }
  }

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
      const params = options.defaultParams ?? []
      fetchInstance.run(...params as Params)
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
