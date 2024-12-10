import type { Options, Plugin, Service } from './types'
import { useRequestImpl } from './useRequestImpl'

export function useRequest<Data, Params extends any[]>(
  service: Service<Data, Params>,
  options?: Options<Data, Params>,
  plugins?: Plugin<Data, Params>[],
) {
  return useRequestImpl<Data, Params>(service, options, [
    ...(plugins ?? []),
    // useDebouncePlugin,
    // useLoadingDelayPlugin,
    // usePollingPlugin,
    // useRefreshOnWindowFocusPlugin,
    // useRefreshOnDocumentVisibilityPlugin,
    // useThrottlePlugin,
    // useAutoRunPlugin,
    // useRetryPlugin,
  ])
}
