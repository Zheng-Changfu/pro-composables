import type { EventHookOn } from '@vueuse/core'
import { createEventHook, useTimeoutFn } from '@vueuse/core'
import { isFunction, isString, isUndefined } from 'lodash-es'
import type { MaybeRefOrGetter, Ref, WatchSource } from 'vue-demi'
import { onMounted, ref, toValue, watch } from 'vue-demi'
import { useInjectRequestTipConfigContext } from './context'

type MaybeArray<T> = T | Array<T>
type AnyFn = (...args: any[]) => any
type InferApiReturned<Api extends AnyFn> = Awaited<ReturnType<Api>>
type InferApiParams<Api> = Api extends (...args: infer Args) => any ? Args : never

export type InferResponse<
Response,
TransformFn extends AnyFn | undefined,
> = TransformFn extends AnyFn
  ? ReturnType<TransformFn>
  : Response

export interface UseRequestReturned<
  Api extends AnyFn,
  TransformFn extends AnyFn | undefined,
> {
  error: Ref<any>
  loading: Ref<boolean>
  onFailure: EventHookOn<any>
  data: Ref<InferResponse<InferApiReturned<Api>, TransformFn>>
  runBool: (...args: InferApiParams<Api>) => Promise<boolean>
  onSuccess: EventHookOn<InferResponse<InferApiReturned<Api>, TransformFn>>
  run: (...args: InferApiParams<Api>) => Promise<[any, InferResponse<InferApiReturned<Api>, TransformFn>]>
}

export interface UseRequestOptions<
Api extends AnyFn,
TransformFn extends AnyFn | undefined,
> {
  /**
   * 初始值(使用 ts 时，请确保 initialValue 和预期类型一致，否则会导致推断错误)
   * @default undefined
   */
  initialValue?: InferResponse<InferApiReturned<Api>, TransformFn>
  /**
   * 请求函数
   */
  api: Api
  /**
   * 是否立即触发
   * @default true
   */
  immediate?: boolean
  /**
   * 请求成功后的提示，false 则不提示
   */
  successTip?: string | false | ((response: InferResponse<InferApiReturned<Api>, TransformFn>) => string | false)
  /**
   * 请求失败后的提示，false 则不提示
   */
  failureTip?: string | false | ((error: any) => string | false)
  /**
   * 转换响应结果
   */
  transform?: TransformFn
  /**
   * 依赖项，当依赖发生变化时，触发 guard，通过拦截器后，会重新调用 api
   */
  dependencies?: { watch: MaybeArray<WatchSource>, guard?: MaybeRefOrGetter<boolean> }
  /**
   * 请求成功后调用的回调
   * @param response 成功后的结果，可能会被 transform 转换
   */
  onSuccess?: (response: InferResponse<InferApiReturned<Api>, TransformFn>) => void
  /**
   * 请求失败后调用的回调
   * @param error 错误原因
   */
  onFailure?: (error: any) => void
  /**
   * 用什么形式去提示
   * @param type 请求结果
   * @param tipText 用户提供的文案，如果提供的是 false，则不会触发该函数调用
   * @param dataOrError 成功则为请求返回的结果(被transform过的)，失败则为错误信息
   */
  tipApi?: (type: 'success' | 'failure', tipText: string, dataOrError: any) => void
}
export function useRequest<
  Api extends AnyFn,
>(options: UseRequestOptions<Api, undefined>): UseRequestReturned<Api, undefined>
export function useRequest<
  Api extends AnyFn,
  TransformFn extends (res: InferApiReturned<Api>) => any,
>(options: UseRequestOptions<Api, TransformFn>): UseRequestReturned<Api, TransformFn>
export function useRequest<
  Api extends AnyFn,
  TransformFn extends AnyFn | undefined,
>(options: UseRequestOptions<Api, TransformFn>) {
  const {
    api,
    tipApi,
    transform,
    failureTip,
    successTip,
    initialValue,
    dependencies,
    immediate = true,
    onFailure: onPropFailure,
    onSuccess: onPropSuccess,
  } = options

  const {
    tipApi: globalTipApi,
    successTip: globalSuccessTip,
    failureTip: globalFailureTip,
  } = useInjectRequestTipConfigContext()

  const localTipApi = tipApi ?? globalTipApi
  const localSuccessTip = successTip ?? globalSuccessTip
  const localFailureTip = failureTip ?? globalFailureTip

  const error = ref()
  const loading = ref(false)
  const data = ref(initialValue)
  const { on: onSuccess, trigger: triggerSuccess } = createEventHook<InferResponse<InferApiReturned<Api>, TransformFn>>()
  const { on: onFailure, trigger: triggerFailure } = createEventHook<any>()

  function fetch(...args: any[]) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<[any, InferResponse<InferApiReturned<Api>, TransformFn>]>(async (resolve) => {
      if (!api) {
        resolve([undefined, initialValue as any])
        return
      }
      loading.value = true
      error.value = undefined
      try {
        const response = await api(...args)
        const transformedResponse = transform ? transform(response) : response
        data.value = transformedResponse
        triggerSuccess(transformedResponse)
        resolve([undefined, transformedResponse])
      }
      catch (err) {
        error.value = err
        data.value = initialValue as any
        triggerFailure(err)
        resolve([err, undefined as any])
      }
      finally {
        loading.value = false
      }
    })
  }

  function run(...args: any[]) {
    return fetch(...args)
  }

  async function runBool(...args: any[]) {
    const [err] = await fetch(...args)
    return isUndefined(err)
  }

  function getTipText(responseOrError: any, tip?: string | false | ((...args: any[]) => string | false)) {
    if (isString(tip))
      return tip

    if (isFunction(tip)) {
      const returned = tip(responseOrError)
      if (isString(returned))
        return returned
    }
    return false
  }

  function onSuccessTip(res: any) {
    let successTipText: string | false
    if (
      !localTipApi
      || (successTipText = getTipText(res, localSuccessTip)) === false
    )
      return
    localTipApi('success', successTipText, res)
  }

  function onFailureTip(err: any) {
    let failureTipText: string | false
    if (
      !localTipApi
      || (failureTipText = getTipText(err, localFailureTip)) === false
    )
      return
    localTipApi('failure', failureTipText, err)
  }

  const exposed = {
    run,
    data,
    error,
    loading,
    runBool,
    onSuccess,
    onFailure,
  }

  onFailure(onFailureTip)
  onSuccess(onSuccessTip as any)
  onPropFailure && onFailure(onPropFailure)
  onPropSuccess && onSuccess(onPropSuccess as any)

  onMounted(() => {
    /**
     * 确保运行 run 时外界可以拿到组件实例
     */
    immediate && useTimeoutFn(() => exposed.run(), 16)
  })

  if (dependencies) {
    const {
      guard = true,
      watch: watchSource,
    } = dependencies

    watch(
      watchSource,
      () => toValue(guard) && exposed.run(),
    )
  }

  return exposed
}
