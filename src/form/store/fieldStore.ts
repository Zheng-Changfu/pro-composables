import type { ArrayField, BaseField } from '../field'
import type { InternalPath, PathPattern } from '../path'
import { get, isArray, isNil, isPlainObject, merge, set } from 'lodash-es'
import { computed, shallowReactive, toRaw } from 'vue'
import { convertPatternToMatchFn, stringifyPath } from '../utils/path'

/**
 * 管理所有的字段
 */
export class FieldStore {
  public omitNil: boolean
  public idToFieldMap: Map<string, BaseField>

  constructor(omitNil: boolean) {
    this.omitNil = omitNil
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
          set(res, path.value, Array.from(new Array(len), () => ({})))
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

  get postValueFieldsPathMap() {
    return computed(() => {
      const pathMap = new Map<string, BaseField & { postValue: Exclude<BaseField['postValue'], undefined> }>()
      this.idToFieldMap.forEach((field) => {
        if (field.postValue)
          pathMap.set(field.stringPath.value, field as any)
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

  getFieldByPath = (path: InternalPath) => {
    return this.fieldsPathMap.value.get(stringifyPath(path))
  }

  private transform = (field: BaseField, values: Record<string, any>) => {
    const {
      value,
      isList,
      stringPath,
      transform,
      analysisPath,
    } = field
    /**
     * transform:
     *  返回值不是对象，直接修改字段对应的结果
     *  返回值是对象，和当前字段所在层级的对象进行合并
     */
    const val = isList ? get(values, stringPath.value) : value.value
    const transformedValue = toRaw(transform!(val, stringPath.value))
    if (!isPlainObject(transformedValue)) {
      if (!this.omitNil || !isNil(transformedValue)) {
        set(values, stringPath.value, transformedValue)
      }
    }
    else {
      const { index, parentPath } = analysisPath()
      if (index !== -1 && parentPath.length > 0) {
        const listValue = get(values, parentPath, [])
        if (isArray(listValue)) {
          const currentLevelPath = [...parentPath, index]
          const beMergeObj = get(values, currentLevelPath)
          merge(beMergeObj, transformedValue)
          return
        }
      }
      merge(values, transformedValue)
    }
  }

  getFieldsTransformedValue = () => {
    const res = {} as any
    const haveTransformListFields: ArrayField[] = []

    this.idToFieldMap.forEach((field) => {
      const { isList, path, transform, value } = field
      const val = value.value
      if (isList) {
        const len = (val ?? []).length
        set(res, path.value, Array.from(new Array(len), () => ({})))
        if (transform)
          haveTransformListFields.push(field as ArrayField)
      }
    })

    this.idToFieldMap.forEach((field) => {
      const { isList, path, transform, value } = field
      if (isList)
        return
      const val = toRaw(value.value)
      if (!transform) {
        if (!this.omitNil || !isNil(val)) {
          set(res, path.value, toRaw(val))
        }
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

export function createFieldStore(omitNil = true) {
  return new FieldStore(omitNil)
}
