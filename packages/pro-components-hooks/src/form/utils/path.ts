import { isRegExp, isString, toPath } from 'lodash-es'
import type { Path, PathPattern } from '../path'

export function stringifyPath(path: Path) {
  return path ? toPath(path).join('') : ''
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
