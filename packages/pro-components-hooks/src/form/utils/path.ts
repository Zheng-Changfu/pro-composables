import { toPath } from 'lodash-es'
import type { Path } from '../path'

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

export function toRegexp(path: string) {
  return new RegExp(path)
}
