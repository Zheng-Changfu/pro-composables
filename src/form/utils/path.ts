import type { InternalPath, PathPattern } from '../path'
import { isRegExp, isString, toPath } from 'lodash-es'

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
