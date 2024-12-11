import { useAutoRunPlugin } from './plugins/useAutoRunPlugin'
import { useDebouncePlugin } from './plugins/useDebouncePlugin'
import { useLoadingDelayPlugin } from './plugins/useLoadingDelayPlugin'
import { usePollingPlugin } from './plugins/usePollingPlugin'
import { useRefreshOnWindowFocusPlugin } from './plugins/useRefreshOnWindowFocusPlugin'
import { useRetryPlugin } from './plugins/useRetryPlugin'
import { useThrottlePlugin } from './plugins/useThrottlePlugin'
import type { Options, Plugin, Service } from './types'
import { useRequestImpl } from './useRequestImpl'

export function useRequest<Data, Params extends any[]>(
  service: Service<Data, Params>,
  options?: Options<Data, Params>,
  plugins?: Plugin<Data, Params>[],
) {
  return useRequestImpl<Data, Params>(service, options, [
    ...(plugins ?? []),
    useDebouncePlugin,
    useLoadingDelayPlugin,
    usePollingPlugin,
    useRefreshOnWindowFocusPlugin,
    useThrottlePlugin,
    useAutoRunPlugin,
    useRetryPlugin,
  ] as Plugin<Data, Params>[])
}
