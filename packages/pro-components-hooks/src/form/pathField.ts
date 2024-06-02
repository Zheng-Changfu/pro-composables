import { set } from 'lodash-es'
import { toRaw } from 'vue-demi'
import type { BaseField } from './field'
import { stringifyPath, toRegexp } from './utils/path'

export class PathField {
  private map: Map<string, BaseField> = new Map()

  get = (path: Array<string | number>) => {
    if (path.length <= 0)
      return
    return this.map.get(toRaw(stringifyPath(path)))
  }

  getAll = () => {
    const res = {} as any
    this.map.forEach((field, key) => {
      const { isList, value } = field
      const val = value.value
      if (isList) {
        const len = (val ?? []).length
        set(res, key, Array.from(Array(len), () => ({})))
      }
    })

    this.map.forEach((field, key) => {
      const { isList, value } = field
      const val = value.value
      if (!isList)
        set(res, key, toRaw(val))
    })
    return res
  }

  set = (path: string[], field: BaseField) => {
    if (path.length <= 0)
      return
    this.map.set(stringifyPath(path), field)
  }

  delete = (path: string[]) => {
    if (path.length <= 0)
      return
    this.map.delete(stringifyPath(path))
  }

  keys = () => {
    return [...this.map.keys()]
  }

  query = () => {}

  match = (key: string) => {
    const reg = toRegexp(key)
    const ret: BaseField[] = []
    this.map.forEach((field, path) => {
      if (reg.test(path))
        ret.push(field)
    })
    return ret
  }
}
