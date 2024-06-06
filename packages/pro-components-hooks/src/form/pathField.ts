import { get, isPlainObject, merge, set } from 'lodash-es'
import { toRaw } from 'vue-demi'
import type { ArrayField, BaseField, PathMatch } from './field'
import { matchPath as baseMatchPath, stringifyPath } from './utils/path'
import type { InternalPath } from './path/types'

export class PathField {
  /**
   * 所有字段的映射表
   */
  private map: Map<string, BaseField> = new Map()

  get = (path: InternalPath) => {
    if (path.length <= 0)
      return
    return this.map.get(toRaw(stringifyPath(path)))
  }

  getValues = () => {
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

  getTransformedValues = () => {
    const res = {} as any
    const haveTransformListFields: ArrayField[] = []

    function internalTranform(field: BaseField, fieldKey: string) {
      const {
        index,
        value,
        parent,
        isList,
        transform,
      } = field
      /**
       * transform:
       *  返回值不是对象，直接修改字段对应的结果
       *  返回值是对象，和当前字段所在层级的对象进行合并
       */
      const val = isList ? get(res, fieldKey) : value.value
      const rawVal = toRaw(val)
      const transformedValue = transform!(rawVal, fieldKey)
      if (!isPlainObject(transformedValue)) {
        set(res, fieldKey, transformedValue)
        return
      }

      if (!parent) {
        merge(res, transformedValue)
        return
      }
      const currentLevelPath = [...parent.path.value, index.value]
      const beMergeObj = get(res, currentLevelPath)
      merge(beMergeObj, transformedValue)
    }

    this.map.forEach((field, key) => {
      const { isList, transform, value } = field
      const val = value.value
      if (isList) {
        const len = (val ?? []).length
        set(res, key, Array.from(Array(len), () => ({})))
        if (transform)
          haveTransformListFields.push(field as ArrayField)
      }
    })

    this.map.forEach((field, key) => {
      const { isList, transform, value } = field
      const val = value.value
      if (isList)
        return
      const rawVal = toRaw(val)
      if (!transform) {
        set(res, key, rawVal)
        return
      }
      internalTranform(field, key)
    })

    haveTransformListFields.forEach((field) => {
      const { path } = field
      const key = stringifyPath(path.value)
      internalTranform(field, key)
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

  matchPath = (pathMatch: PathMatch) => {
    return baseMatchPath(this.map, pathMatch)
  }
}
