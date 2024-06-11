import type { EventHookOn } from '@vueuse/core'
import { createEventHook } from '@vueuse/core'
import { isFunction, isString, isUndefined } from 'lodash-es'
import type { Ref, WatchSource } from 'vue-demi'
import { ref, watch } from 'vue-demi'

type AnyFn = (...args: any[]) => any

export type InferResponse<Response, TransformFn extends ((response: Response) => any) | undefined> = TransformFn extends AnyFn
  ? ReturnType<TransformFn> extends infer R
    ? R
    : never
  : Response

export interface UseRequestReturned<
Response,
Api extends AnyFn,
TransformFn extends ((response: Response) => any) | undefined,
> {
  error: Ref<any>
  loading: Ref<boolean>
  onFailure: EventHookOn<any>
  data: Ref<InferResponse<Response, TransformFn>>
  runBool: (...args: Parameters<Api>) => Promise<boolean>
  onSuccess: EventHookOn<InferResponse<Response, TransformFn>>
  run: (...args: Parameters<Api>) => Promise<[any, InferResponse<Response, TransformFn>]>
}

export interface UseRequestOptions<Response, Api extends (...args: any[]) => Promise<Response>, TransformFn extends ((response: Response) => any) | undefined> {
  /**
   * 初始值
   * @default undefined
   */
  initialValue?: InferResponse<Response, TransformFn>
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
  successTip?: string | false | ((response: InferResponse<Response, TransformFn>) => string | false)
  /**
   * 请求失败后的提示，false 则不提示
   */
  failureTip?: string | false | ((error: any) => string | false)
  /**
   * 转换响应结果
   */
  transform?: TransformFn
  /**
   * 依赖项数组，当依赖发生变化时，会重新调用 api
   */
  dependencies?: WatchSource[]
  /**
   * 请求成功后调用的回调
   * @param response 成功后的结果，可能会被 transform 转换
   */
  onSuccess?: (response: InferResponse<Response, TransformFn>) => void
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
Response,
Api extends (...args: any[]) => Promise<Response>,
>(options: UseRequestOptions<Response, Api, undefined>): UseRequestReturned<Response, Api, undefined>
export function useRequest<
  Response,
  Api extends (...args: any[]) => Promise<Response>,
  TransformFn extends (response: Response) => any,
>(options: UseRequestOptions<Response, Api, TransformFn>): UseRequestReturned<Response, Api, TransformFn>
export function useRequest<
  Response,
  Api extends (...args: any[]) => Promise<Response>,
  TransformFn extends AnyFn,
>(options: UseRequestOptions<Response, Api, TransformFn>) {
  const {
    api,
    tipApi,
    transform,
    failureTip,
    successTip,
    initialValue,
    dependencies,
    immediate = true,
    onFailure: onUserFailure,
    onSuccess: onUserSuccess,
  } = options

  const error = ref()
  const loading = ref(false)
  const data = ref(initialValue)
  const { on: onSuccess, trigger: triggerSuccess } = createEventHook<InferResponse<Response, typeof transform>>()
  const { on: onFailure, trigger: triggerFailure } = createEventHook<any>()

  function fetch(...args: any[]) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<[any, InferResponse<Response, typeof transform>]>(async (resolve) => {
      loading.value = true
      error.value = undefined
      data.value = initialValue
      try {
        const response = await api(...args)
        const transformedResponse = transform ? transform(response) : response
        data.value = transformedResponse
        triggerSuccess(transformedResponse)
        resolve([undefined, transformedResponse])
      }
      catch (err) {
        error.value = err
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
      !tipApi
      // eslint-disable-next-line no-cond-assign
      || (successTipText = getTipText(res, successTip)) === false
    )
      return
    tipApi('success', successTipText, res)
  }

  function onFailureTip(err: any) {
    let failureTipText: string | false
    if (
      !tipApi
      // eslint-disable-next-line no-cond-assign
      || (failureTipText = getTipText(err, failureTip)) === false
    )
      return
    tipApi('failure', failureTipText, err)
  }

  onFailure(onFailureTip)
  onSuccess(onSuccessTip as any)
  onUserFailure && onFailure(onUserFailure)
  onUserSuccess && onSuccess(onUserSuccess as any)

  immediate && run()

  dependencies
  && dependencies.length > 0
  && watch(dependencies, () => run())

  return {
    run,
    data,
    error,
    loading,
    runBool,
    onSuccess,
    onFailure,
  }
}
