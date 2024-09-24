import { cloneDeep, get, has, set, unset } from 'lodash-es'
import type { Ref } from 'vue-demi'
import { ref } from 'vue-demi'
import type { Path, PathPattern } from '../path'
import type { FormOptions } from '../types'
import { type ValueMergeStrategy, mergeByStrategy } from '../utils/value'
import type { FieldStore } from './fieldStore'

/**
 * 管理值
 */
export class ValueStore {
  public fieldStore: FieldStore
  public values: Ref<Record<string, any>>
  public initialValues: Record<string, any>

  constructor(
    fieldStore: FieldStore,
    options: FormOptions,
  ) {
    this.values = ref({})
    this.fieldStore = fieldStore
    this.initialValues = cloneDeep(options.initialValues ?? {})
  }

  getFieldValue = (path: Path) => {
    return get(this.values.value, path)
  }

  getFieldsValue = (paths?: Array<Path> | true) => {
    if (paths === true) {
      // 所有的值，包含用户设置的和可能被隐藏的字段
      return this.values.value
    }

    if (!paths) {
      // 拿到存在的表单值返回
      return this.fieldStore.fieldsValue.value
    }

    return paths.reduce<Record<string, any>>(
      (p, path) => {
        const value = this.getFieldValue(path)
        set(p, path, value)
        return p
      },
      {},
    )
  }

  has(path: Path) {
    return has(this.values.value, path)
  }

  delete(path: Path) {
    return unset(this.values.value, path)
  }

  getFieldsTransformedValue = () => {
    return this.fieldStore.getFieldsTransformedValue()
  }

  matchPath = (pattern: PathPattern) => {
    return this.fieldStore.matchFieldPath(pattern)
  }

  resolveValueWithPostState = (path: Path, value: any) => {
    const field = this.fieldStore.getFieldByPath(path)
    const postValue = field && field.postState ? field.postState(value) : value
    return postValue
  }

  resolveValuesWithPostState = (vals: any) => {
    const clonedVals = cloneDeep(vals)
    const postStateFieldsPathMap = this.fieldStore.getHasPostStateFieldsPathMap.value
    postStateFieldsPathMap.forEach(((field) => {
      const { stringPath } = field
      const rawStringPath = stringPath.value

      if (has(clonedVals, rawStringPath)) {
        const value = get(clonedVals, rawStringPath)
        const postedValue = field.postState(value)
        if (!Object.is(value, postedValue))
          set(clonedVals, rawStringPath, postedValue)
      }
    }))
    return clonedVals
  }

  setFieldValue = (path: Path, value: any) => {
    const resolvedValue = this.resolveValueWithPostState(path, value)
    set(this.values.value, path, resolvedValue)
  }

  setFieldsValue = (vals: Record<string, any>, strategy?: ValueMergeStrategy) => {
    const resolvedValues = this.resolveValuesWithPostState(vals)
    this.values.value = mergeByStrategy(
      this.values.value,
      resolvedValues,
      strategy,
    )
  }

  resetFieldValue = (path: Path) => {
    const initialValue = cloneDeep(get(this.initialValues, path))
    const resolvedValue = this.resolveValueWithPostState(path, initialValue)
    set(this.values.value, path, resolvedValue)
  }

  resetFieldsValue = () => {
    const resolvedValues = this.resolveValuesWithPostState(this.initialValues)
    this.values.value = resolvedValues
  }

  setInitialValue = (path: Path, value: any) => {
    set(this.initialValues, path, cloneDeep(value))
  }

  setInitialValues = (vals: Record<string, any>, strategy?: ValueMergeStrategy) => {
    this.initialValues = mergeByStrategy(
      this.initialValues,
      cloneDeep(vals),
      strategy,
    )
  }
}

export function createValueStore(fieldStore: FieldStore, options: FormOptions) {
  return new ValueStore(fieldStore, options)
}
