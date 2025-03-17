import type { InternalPath } from '../path'
import { toPath } from 'lodash-es'

export function stringifyPath(path: InternalPath) {
  return path ? toPath(path).join('.') : ''
}
