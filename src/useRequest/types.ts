import type { MultiWatchSources, Ref } from 'vue'
import type { Fetch } from './Fetch'

export type Service<Data, Params extends any[]> = (...args: Params) => Promise<Data>

export interface FetchState<Data, Params extends any[]> {
  loading: boolean
  params?: Params
  data?: Data
  error?: Error
}

export interface Options<Data, Params extends any[]> {
  manual?: boolean

  onBefore?: (params: Params) => void
  onSuccess?: (data: Data, params: Params) => void
  onError?: (e: Error, params: Params) => void
  onFinally?: (params: Params, data?: Data, e?: Error) => void

  defaultParams?: Params

  // refreshDeps
  refreshDeps?: MultiWatchSources
  refreshDepsAction?: () => void

  // loading delay
  loadingDelay?: number

  // polling
  pollingInterval?: number
  pollingWhenHidden?: boolean
  pollingErrorRetryCount?: number

  // refresh on window focus
  refreshOnWindowFocus?: boolean
  focusTimespan?: number

  // refresh on document visibility
  refreshOnDocumentVisibility?: boolean
  visibilityTimespan?: number

  // debounce
  debounceWait?: number
  debounceLeading?: boolean
  debounceTrailing?: boolean
  debounceMaxWait?: number

  // throttle
  throttleWait?: number
  throttleLeading?: boolean
  throttleTrailing?: boolean

  // retry
  retryCount?: number
  retryInterval?: number
}

export interface Plugin<Data, Params extends any[]> {
  (fetchInstance: Fetch<Data, Params>, options: Options<Data, Params>): PluginReturn<
    Data,
    Params
  >
  onInit?: (options: Options<Data, Params>) => Partial<FetchState<Data, Params>>
}

export interface PluginReturn<Data, Params extends any[]> {
  onBefore?: (params: Params) =>
    | ({
      stopNow?: boolean
      returnNow?: boolean
    } & Partial<FetchState<Data, Params>>)
    | void

  onRequest?: (
    service: Service<Data, Params>,
    params: Params,
  ) => {
    servicePromise?: Promise<Data>
  }

  onSuccess?: (data: Data, params: Params) => void
  onError?: (e: Error, params: Params) => void
  onFinally?: (params: Params, data?: Data, e?: Error) => void
  onCancel?: () => void
  onMutate?: (data: Data) => void
}

export interface Result<Data, Params extends any[]> {
  data: Ref<Data>
  error: Ref<Error>
  params: Ref<Params>
  loading: Ref<boolean>
  run: Fetch<Data, Params>['run']
  mutate: Fetch<Data, Params>['mutate']
  cancel: Fetch<Data, Params>['cancel']
  refresh: Fetch<Data, Params>['refresh']
  runAsync: Fetch<Data, Params>['runAsync']
  refreshAsync: Fetch<Data, Params>['refreshAsync']
}
