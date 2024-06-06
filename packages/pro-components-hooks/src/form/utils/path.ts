import { isMap, isRegExp, isString, toPath } from 'lodash-es'
import type { Path } from '../path'
import type { PathMatch } from '../field'

/**
 * @example
 * ```js
 * _toStringPath(['list','0','name']) // 'list[0].name'
 * _toStringPath(['a','b','0','c']) // 'a.b[0].c'
 * ```
 */
function _toStringPath(path: string[]) {
  return path.map((k, i) => {
    if (i === 0)
      return k
    return /^\d+$/.test(k)
      ? `[${k}]`
      : `.${k}`
  }).join('')
}

export function stringifyPath(path: Path) {
  return path
    ? _toStringPath(toPath(path))
    : ''
}

export function normalizePathMatch(pathMatch: PathMatch) {
  return (path: string, paths: string[]) => {
    if (isString(pathMatch))
      return pathMatch === path
    if (isRegExp(pathMatch))
      return pathMatch.test(path)
    return pathMatch(path, paths)
  }
}

export function matchPath(
  target: Map<string, any> | Record<string, any>,
  pathMatch: PathMatch,
) {
  const matchFn = normalizePathMatch(pathMatch)
  const matchedPaths: string[] = []

  if (isMap(target)) {
    const keys = [...target.keys()]
    target.forEach((_, key) => {
      if (matchFn(key, keys))
        matchedPaths.push(key)
    })
    return matchedPaths
  }

  const keys = Object.keys(target)
  for (const key in target) {
    if (matchFn(key, keys))
      matchedPaths.push(key)
  }
  return matchedPaths
}
