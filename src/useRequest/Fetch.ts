import { reactive } from 'vue'
import { isFunction } from 'lodash-es'
import type { FetchState, Options, PluginReturn, Service } from './types'

export class Fetch<Data, Params extends any[]> {
  public count: number = 0

  public pluginImpls: PluginReturn<Data, Params>[]

  public state: FetchState<Data, Params>

  constructor(
    public service: Service<Data, Params>,
    public options: Options<Data, Params>,
    public initState: Partial<FetchState<Data, Params>> = {},
  ) {
    this.pluginImpls = []
    this.state = reactive({
      data: undefined,
      error: undefined,
      params: [],
      loading: !options.manual,
      ...initState as any,
    })
  }

  setState = (s: Partial<FetchState<Data, Params>> = {}) => {
    Object.assign(this.state, s)
  }

  runPluginHandler = (event: keyof PluginReturn<Data, Params>, ...rest: any[]) => {
    // @ts-ignore
    const r = this.pluginImpls.map(i => i[event]?.(...rest)).filter(Boolean)
    return Object.assign({}, ...r)
  }

  runAsync = async (...params: Params): Promise<Data> => {
    this.count += 1
    const currentCount = this.count

    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler('onBefore', params)

    // stop request
    if (stopNow) {
      return new Promise(() => {})
    }

    this.setState({
      loading: true,
      params,
      ...state,
    })

    if (returnNow) {
      return Promise.resolve(state.data)
    }

    this.options.onBefore?.(params)
    try {
      const res = await this.service(...params)

      if (currentCount !== this.count) {
        // 在执行期间调用了 cancel
        return new Promise(() => {})
      }

      this.setState({
        data: res,
        loading: false,
        error: undefined,
      })

      this.options.onSuccess?.(res, params)
      this.runPluginHandler('onSuccess', res, params)

      this.options.onFinally?.(params, res, undefined)
      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, undefined)
      }

      return res
    }
    catch (error: any) {
      if (currentCount !== this.count) {
        // 在执行期间调用了 cancel
        return new Promise(() => {})
      }

      this.setState({
        error,
        loading: false,
      })

      this.options.onError?.(error, params)
      this.runPluginHandler('onError', error, params)

      this.options.onFinally?.(params, undefined, error)
      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, undefined, error)
      }

      throw error
    }
  }

  run = (...params: Params) => {
    this.runAsync(...params).catch((error) => {
      if (!this.options.onError) {
        console.error(error)
      }
    })
  }

  cancel = () => {
    this.count += 1
    this.setState({
      loading: false,
    })
    this.runPluginHandler('onCancel')
  }

  refresh = () => {
    // @ts-ignore
    this.run(...(this.state.params ?? []))
  }

  refreshAsync = () => {
    // @ts-ignore
    return this.runAsync(...(this.state.params ?? []))
  }

  mutate = (data?: Data | ((oldData?: Data) => Data | undefined)) => {
    const targetData = isFunction(data) ? data(this.state.data) : data
    this.runPluginHandler('onMutate', targetData)
    this.setState({
      data: targetData,
    })
  }
}
