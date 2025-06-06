import type { BaseField } from '../field'
import type { InternalPath } from '../path'
import { isNil, set } from 'lodash-es'
import { computed, shallowReactive, toRaw } from 'vue'
import { stringifyPath } from '../utils/path'

/**
 * 管理所有的字段
 */
export class FieldStore<Values = any> {
  public omitNil: boolean
  public omitEmptyString: boolean
  public idToFieldMap: Map<string, BaseField>

  constructor(omitNil: boolean, omitEmptyString: boolean) {
    this.omitNil = omitNil
    this.omitEmptyString = omitEmptyString
    this.idToFieldMap = shallowReactive(new Map())
  }

  get fieldsValue() {
    return computed<Values>(() => {
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
        if (!isList) {
          if (this.omitNil && isNil(val)) {
            return
          }
          if (this.omitEmptyString && val === '') {
            return
          }
          set(res, path.value, toRaw(val))
        }
      })
      return res
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

  getFieldByPath = (path: InternalPath) => {
    return this.fieldsPathMap.value.get(stringifyPath(path))
  }
}

export function createFieldStore<Values = any>(omitNil = true, omitEmptyString = true) {
  return new FieldStore<Values>(omitNil, omitEmptyString)
}
