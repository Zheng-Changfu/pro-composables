import { isArray } from 'lodash-es'
import { onMounted, onUnmounted } from 'vue'
import { warnOnce } from '../utils/warn'
import type { Options, Plugin, Result, Service } from './types'

export function useRequestImpl<Data, Params extends any[]>(
  service: Service<Data, Params>,
  options: Options<Data, Params> = {},
  plugins: Plugin<Data, Params>[] = [],
) {
  const {
    ready = true,
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
    ready,
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
    if (!manual && ready) {
      const params = options.defaultParams || []
      fetchInstance.run(...params)
    }
  })

  onUnmounted(() => {
    fetchInstance.cancel()
  })

  return {
    data: fetchInstance.data,
    error: fetchInstance.error,
    params: fetchInstance.params,
    loading: fetchInstance.loading,
    run: fetchInstance.run.bind(fetchInstance),
    cancel: fetchInstance.cancel.bind(fetchInstance),
    mutate: fetchInstance.mutate.bind(fetchInstance),
    refresh: fetchInstance.refresh.bind(fetchInstance),
    runAsync: fetchInstance.runAsync.bind(fetchInstance),
    refreshAsync: fetchInstance.refreshAsync.bind(fetchInstance),
  } as Result<Data, Params>
}
