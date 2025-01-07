export type {
  Options as UseRequestOptions,
  Plugin as UseRequestPlugin,
  Result as UseRequestReturn,
  Service as UseRequestService,
} from './types'

/**
 * 社区没有对标 ahooks@3.8.2 的 useRequest vue 版本实现，只能加班自己干了
 */
export { useRequest } from './useRequest'
