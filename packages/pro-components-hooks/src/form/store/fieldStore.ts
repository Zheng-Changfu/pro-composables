import { computed, shallowReactive, toRaw } from 'vue-demi'
import { get, isPlainObject, merge, set } from 'lodash-es'
import type { ArrayField, BaseField } from '../field'
import { convertPatternToMatchFn } from '../utils/path'
import type { PathPattern } from '../path'

/**
 * 管理所有的字段
 */
export class FieldStore {
  public idToFieldMap: Map<string, BaseField>

  constructor() {
    this.idToFieldMap = shallowReactive(new Map())
  }

  get fieldsValue() {
    return computed(() => {
      const res = {} as any
      this.idToFieldMap.forEach((field) => {
        const { isList, path, value } = field
        const val = value.value
        if (isList) {
          const len = (val ?? []).length
          set(res, path.value, Array.from(Array(len), () => ({})))
        }
      })

      this.idToFieldMap.forEach((field) => {
        const { isList, path, value } = field
        const val = value.value
        if (!isList)
          set(res, path.value, val)
      })
      return res
    })
  }

  get fieldsPath() {
    return computed(() => {
      const paths: string[] = []
      this.idToFieldMap.forEach((field) => {
        paths.push(field.stringPath.value)
      })
      return paths
    })
  }

  get fieldsPathMap() {
    return computed(() => {
      const pathMap = new Map<string, BaseField>()
      this.idToFieldMap.forEach((field) => {
        pathMap.set(field.stringPath.value, field)
      })
      return pathMap
    })
  }

  getField = (id: string) => {
    return this.idToFieldMap.get(id)
  }

  mountField = (field: BaseField) => {
    this.idToFieldMap.set(field.id, field)
  }

  unmountField = (field: BaseField) => {
    this.idToFieldMap.delete(field.id)
  }

  matchFieldPath = (pattern: PathPattern) => {
    const matchedPaths: string[] = []
    const paths = this.fieldsPath.value
    const matchFn = convertPatternToMatchFn(pattern)

    this.idToFieldMap.forEach((field) => {
      const path = field.stringPath.value
      if (matchFn(path, paths))
        matchedPaths.push(path)
    })
    return matchedPaths
  }

  getFieldsValue = () => {
    return this.fieldsValue
  }

  private transform = (field: BaseField, values: Record<string, any>) => {
    const {
      index,
      value,
      parent,
      isList,
      stringPath,
      transform,
    } = field
    /**
     * transform:
     *  返回值不是对象，直接修改字段对应的结果
     *  返回值是对象，和当前字段所在层级的对象进行合并
     */
    const val = isList ? get(values, stringPath.value) : value.value
    const transformedValue = toRaw(transform!(val, stringPath.value))
    if (!isPlainObject(transformedValue)) {
      set(values, stringPath.value, transformedValue)
      return
    }
    if (!parent) {
      merge(values, transformedValue)
      return
    }
    const currentLevelPath = [...parent.path.value, index.value]
    const beMergeObj = get(values, currentLevelPath)
    merge(beMergeObj, transformedValue)
  }

  getFieldsTransformedValue = () => {
    const res = {} as any
    const haveTransformListFields: ArrayField[] = []

    this.idToFieldMap.forEach((field) => {
      const { isList, path, transform, value } = field
      const val = value.value
      if (isList) {
        const len = (val ?? []).length
        set(res, path.value, Array.from(Array(len), () => ({})))
        if (transform)
          haveTransformListFields.push(field as ArrayField)
      }
    })

    this.idToFieldMap.forEach((field) => {
      const { isList, path, transform, value } = field
      const val = value.value
      if (isList)
        return
      if (!transform) {
        set(res, path.value, toRaw(val))
        return
      }
      this.transform(field, res)
    })

    haveTransformListFields.forEach((field) => {
      this.transform(field, res)
    })
    return res
  }
}

export function createFieldStore() {
  return new FieldStore()
}
