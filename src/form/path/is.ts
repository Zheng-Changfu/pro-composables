import { isArray, isString } from 'lodash-es'
import type { InternalPath } from './types'

export function isInternalPath(val: any): val is InternalPath {
  return isString(val) || (isArray(val) && val.length > 0)
}
