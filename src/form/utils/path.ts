import type { InternalPath, PathPattern } from '../path'
import { isArray, isRegExp, isString, toPath } from 'lodash-es'

export function stringifyPath(path: InternalPath) {
  return path ? toPath(path).join('.') : ''
}

export function convertPatternToMatchFn(pattern: PathPattern) {
  return (path: string, paths: string[]) => {
    if (isString(pattern))
      return pattern === path
    if (isRegExp(pattern))
      return pattern.test(path)
    return pattern(path, paths)
  }
}

export function isIndexPath(path: InternalPath) {
  const arrayablePath = toPath(path)
  return arrayablePath.length > 1 && /^\d+$/.test(arrayablePath[arrayablePath.length - 1])
}

export function isInternalPath(val: any): val is InternalPath {
  return isString(val) || (isArray(val) && val.length > 0)
}
