import type { MaybeRefOrGetter, MultiWatchSources, Ref, WatchSource } from 'vue'
import type { Fetch } from './Fetch'

export type Service<Data, Params extends any[]> = (...args: Params) => Promise<Data>

type SingleWatchSource = WatchSource<unknown> | object

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

  // refreshDeps
  refreshDeps?: SingleWatchSource | MultiWatchSources
  refreshDepsAction?: () => void

  // loading delay
  loadingDelay?: MaybeRefOrGetter<number>

  // polling
  pollingInterval?: MaybeRefOrGetter<number>
  pollingWhenHidden?: MaybeRefOrGetter<boolean>
  pollingErrorRetryCount?: MaybeRefOrGetter<number>

  // refresh on window focus
  refreshOnWindowFocus?: MaybeRefOrGetter<boolean>
  focusTimespan?: MaybeRefOrGetter<number>

  // debounce
  debounceWait?: MaybeRefOrGetter<number>
  debounceLeading?: MaybeRefOrGetter<boolean>
  debounceTrailing?: MaybeRefOrGetter<boolean>
  debounceMaxWait?: MaybeRefOrGetter<number>

  // throttle
  throttleWait?: MaybeRefOrGetter<number>
  throttleLeading?: MaybeRefOrGetter<boolean>
  throttleTrailing?: MaybeRefOrGetter<boolean>

  // retry
  retryCount?: MaybeRefOrGetter<number>
  retryInterval?: MaybeRefOrGetter<number>
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
