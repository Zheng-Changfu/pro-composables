import type { Ref } from 'vue'
import type { BaseField } from '../field'
import type { InternalPath, PathPattern } from '../path'
import type { ValueMergeStrategy } from '../utils/value'
import type { FieldStore } from './fieldStore'
import { useMounted } from '@vueuse/core'
import { cloneDeep, get, has, isArray, isPlainObject, set, unset } from 'lodash-es'
import { ref } from 'vue'
import { isIndexPath, stringifyPath } from '../utils/path'
import { mergeByStrategy } from '../utils/value'

interface ValueStoreOptions {
  initialValues: any
  onFieldValueUpdated: (field: BaseField, value: any) => void
}
/**
 * 管理值
 */
export class ValueStore {
  public mounted: Ref<boolean>
  public fieldStore: FieldStore
  public options: ValueStoreOptions
  public values: Ref<Record<string, any>>
  public initialValues: Record<string, any>

  constructor(
    fieldStore: FieldStore,
    options: ValueStoreOptions,
  ) {
    this.values = ref({})
    this.options = options
    this.mounted = useMounted()
    this.fieldStore = fieldStore
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

  has(path: InternalPath) {
    return has(this.values.value, path)
  }

  delete(path: InternalPath) {
    return unset(this.values.value, path)
  }

  getFieldsTransformedValue = () => {
    return this.fieldStore.getFieldsTransformedValue()
  }

  matchPath = (pattern: PathPattern) => {
    return this.fieldStore.matchFieldPath(pattern)
  }

  resolveValueWithPostValue = (field: BaseField | undefined, value: any) => {
    return field && field.postValue
      ? field.postValue(value)
      : value
  }

  resolveValuesWithPostValue = (
    vals: any,
    strategy: ValueMergeStrategy,
    observe?: (field: BaseField, value: any) => void,
  ) => {
    const clonedVals = cloneDeep(vals)
    if (strategy === 'overwrite') {
      // 如果是覆盖表单的值，需要拿到所有的 postValue 调用
      const postValueFieldsPathMap = this.fieldStore.postValueFieldsPathMap.value
      postValueFieldsPathMap.forEach((field) => {
        const { stringPath } = field
        const rawStringPath = stringPath.value

        if (has(clonedVals, rawStringPath)) {
          const value = get(clonedVals, rawStringPath)
          const postedValue = field.postValue(value)
          if (!Object.is(value, postedValue)) {
            set(clonedVals, rawStringPath, postedValue)
            observe && observe(field, postedValue)
          }
        }
        else {
          const {
            index,
            parentPath,
          } = field.analysisPath()

          if (index !== -1 && parentPath.length > 0) {
            const listValue = get(clonedVals, parentPath, [])
            if (isArray(listValue) && index > listValue.length - 1) {
              return
            }
          }
          const postedValue = field.postValue(undefined)
          set(clonedVals, rawStringPath, postedValue)
          const oldValue = this.getFieldValue(rawStringPath)
          if (!Object.is(oldValue, postedValue)) {
            observe && observe(field, postedValue)
          }
        }
      })
    }
    else {
      const matchedPath = this.matchPath(path => has(vals, path))
      matchedPath.forEach((path) => {
        const field = this.fieldStore.getFieldByPath(path)!
        if (field.postValue) {
          const value = get(vals, path)
          const postedValue = field.postValue(value)
          if (!Object.is(value, postedValue)) {
            set(clonedVals, path, postedValue)
            observe && observe(field, postedValue)
          }
        }
      })
    }
    return clonedVals
  }

  private internalSetFieldValue = (path: InternalPath, value: any) => {
    const field = this.fieldStore.getFieldByPath(path)
    const oldValue = this.getFieldValue(path)
    const resolvedValue = this.resolveValueWithPostValue(field, value)
    set(this.values.value, path, resolvedValue)

    if (field && !Object.is(oldValue, resolvedValue))
      this.options.onFieldValueUpdated(field, resolvedValue)
  }

  setFieldValue = (path: InternalPath, value: any) => {
    const field = this.fieldStore.getFieldByPath(path)
    if (
      !field
      && this.mounted.value
      && isIndexPath(path)
      && isPlainObject(value)
    ) {
      /**
       * 索引 path
       * 想设置一行的值 setFieldValue('list.0',{a:1,b:2})
       */
      const rowPath = stringifyPath(path).replace(/\./g, '\\.')
      const matchedPath = this.matchPath(new RegExp(`${rowPath}\.+`))
      if (matchedPath.length > 0) {
        // 匹配到的当前行所有 path，包含了嵌套的
        const values = set({}, path, value)
        matchedPath.forEach((_path) => {
          if (has(values, _path)) {
            this.internalSetFieldValue(_path, get(values, _path))
          }
        })
      }
      return
    }
    this.internalSetFieldValue(path, value)
  }

  setFieldsValue = (vals: Record<string, any>, strategy: ValueMergeStrategy = 'overwrite') => {
    const observes: Array<() => void> = []
    const resolvedValues = this.resolveValuesWithPostValue(
      vals,
      strategy,
      (field, value) => {
        observes.push(() => this.options.onFieldValueUpdated(field, value))
      },
    )
    this.values.value = mergeByStrategy(
      this.values.value,
      resolvedValues,
      strategy,
    )
    while (observes.length > 0)
      observes.shift()?.()
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
