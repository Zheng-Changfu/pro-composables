import { type Ref, ref } from 'vue'
import type { FetchState, Options, PluginReturn, Service } from './types'

export class Fetch<Data, Params extends any[]> {
  public count: number = 0

  public pluginImpls: PluginReturn<Data, Params>[]

  public data: Ref<FetchState<Data, Params>['data']>
  public error: Ref<FetchState<Data, Params>['error']>
  public params: Ref<FetchState<Data, Params>['params']>
  public loading: Ref<FetchState<Data, Params>['loading']>

  constructor(
    public serviceRef: Service<Data, Params>,
    public options: Options<Data, Params>,
    public initState: Partial<FetchState<Data, Params>> = {},
  ) {
    const {
      data,
      error,
      params,
      loading,
    } = initState

    this.data = ref(data)
    this.error = ref(error)
    this.params = ref(params)
    this.loading = ref(loading ?? !options.manual)
  }
}
