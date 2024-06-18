import { type InjectionKey, inject, provide } from 'vue-demi'

interface RequestTipConfig {
  failureTip?: string | false | ((error: any) => string | false)
  successTip?: string | false | ((response: any) => string | false)
  tipApi?: (type: 'success' | 'failure', tipText: string, dataOrError: any) => void
}

export const requestTipConfigContextKey = Symbol('requestTipConfig') as InjectionKey<RequestTipConfig>
export function provideRequestTipConfigContext(config: RequestTipConfig) {
  provide(requestTipConfigContextKey, config)
}

export function useInjectRequestTipConfigContext() {
  return inject(requestTipConfigContextKey, {})
}
