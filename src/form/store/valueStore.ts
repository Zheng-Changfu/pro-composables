import type { PartialDeep } from 'type-fest'
import type { Ref } from 'vue'
import type { BaseField } from '../field'
import type { InternalPath } from '../path'
import type { ValueMergeStrategy } from '../utils/value'
import type { FieldStore } from './fieldStore'
import { cloneDeep, get, set, unset } from 'lodash-es'
import { ref } from 'vue'
import { mergeByStrategy } from '../utils/value'

interface ValueStoreOptions {
  initialValues: any
  onValueChange: (field: BaseField, value: any) => void
}
/**
 * 管理值
 */
export class ValueStore<Values = Record<string, any>> {
  public values: Ref<Values>
  public fieldStore: FieldStore
  public options: ValueStoreOptions
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

  delete(path: InternalPath) {
    return unset(this.values.value, path)
  }

  setFieldValue = (path: InternalPath, value: any) => {
    const oldValue = this.getFieldValue(path)
    set(this.values.value as any, path, value)
    if (!Object.is(oldValue, value)) {
      const field = this.fieldStore.getFieldByPath(path)
      if (
        field
        && !field.isList
        && field.touching
        && field.show.value
      ) {
        this.options.onValueChange(field, value)
      }
    }
  }

  resetFieldValue = (path: InternalPath) => {
    const initialValue = cloneDeep(get(this.initialValues, path))
    this.setFieldValue(path, initialValue)
  }

  resetFieldsValue = () => {
    this.values.value = cloneDeep(this.initialValues) as any
  }

  setInitialValue = (path: InternalPath, value: any) => {
    set(this.initialValues, path, cloneDeep(value))
  }

  setInitialValues = (vals: PartialDeep<Values>, strategy?: ValueMergeStrategy) => {
    this.initialValues = mergeByStrategy(
      this.initialValues,
      cloneDeep(vals),
      strategy,
    )
  }
}

export function createValueStore<Values = Record<string, any>>(fieldStore: FieldStore, options: ValueStoreOptions) {
  return new ValueStore<Values>(fieldStore, options)
}
