import type { Ref } from 'vue'
import type { BaseField } from '../field'
import type { InternalPath, PathPattern } from '../path'
import type { ValueMergeStrategy } from '../utils/value'
import type { FieldStore } from './fieldStore'
import { cloneDeep, get, set, unset } from 'lodash-es'
import { ref } from 'vue'
import { mergeByStrategy } from '../utils/value'

interface ValueStoreOptions {
  initialValues: any
  onManualValueChange: (field: BaseField, value: any) => void
}
/**
 * 管理值
 */
export class ValueStore {
  public fieldStore: FieldStore
  public options: ValueStoreOptions
  public values: Ref<Record<string, any>>
  public initialValues: Record<string, any>

  constructor(
    fieldStore: FieldStore,
    options: ValueStoreOptions,
  ) {
    this.options = options
    this.fieldStore = fieldStore
    this.values = ref(options.initialValues ?? {})
    this.initialValues = cloneDeep(options.initialValues ?? {})
  }

  getFieldValue = (path: InternalPath) => {
    return get(this.values.value, path)
  }

  getFieldsValue = (paths?: Array<InternalPath> | true) => {
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

  delete(path: InternalPath) {
    return unset(this.values.value, path)
  }

  matchPath = (pattern: PathPattern) => {
    return this.fieldStore.matchFieldPath(pattern)
  }

  setFieldValue = (path: InternalPath, value: any) => {
    const oldValue = this.getFieldValue(path)
    set(this.values.value, path, value)
    if (!Object.is(oldValue, value)) {
      const field = this.fieldStore.getFieldByPath(path)
      if (
        field
        && !field.isList
        && field.touching
        && field.show.value
      ) {
        this.options.onManualValueChange(field, value)
      }
    }
  }

  setFieldsValue = (vals: Record<string, any>, strategy: ValueMergeStrategy = 'overwrite') => {
    this.values.value = mergeByStrategy(
      this.values.value,
      vals,
      strategy,
    )
  }

  resetFieldValue = (path: InternalPath) => {
    const initialValue = cloneDeep(get(this.initialValues, path))
    this.setFieldValue(path, initialValue)
  }

  resetFieldsValue = () => {
    this.setFieldsValue(this.initialValues)
  }

  setInitialValue = (path: InternalPath, value: any) => {
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

export function createValueStore(fieldStore: FieldStore, options: ValueStoreOptions) {
  return new ValueStore(fieldStore, options)
}
