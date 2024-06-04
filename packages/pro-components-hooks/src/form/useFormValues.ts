import { cloneDeep, get, merge, set } from 'lodash-es'
import { toRaw } from 'vue-demi'
import type { UseControlRefOptions } from '../hooks/createControlRef'
import { createControlRef } from '../hooks/createControlRef'
import type { Path } from './path'
import type { FormOptions, Store } from './types'
import type { PathField } from './pathField'

interface UseFormValuesOptions extends UseControlRefOptions {
  pathField: PathField
}

export function useFormValues(options: FormOptions<any>, config: UseFormValuesOptions) {
  const values = createControlRef({}, config)
  const initialValues = options.initialValues ?? {}

  function getFieldValue(path: Path) {
    return values.get(path)
  }

  function getFieldsValue(paths?: Array<Path> | true) {
    if (paths === true)
      return toRaw(values.get())

    if (!paths) {
      // 拿到存在的表单值返回
      return config.pathField.getValues()
    }

    return paths.reduce<Record<string, any>>(
      (p, path) => {
        const value = values.get(path)
        set(p, path, value)
        return p
      },
      {},
    )
  }

  function getFieldsTransformedValue() {
    return config.pathField.getTransformedValues()
  }

  function setFieldValue(path: Path, value: any) {
    values.set(path, value)
  }

  function setFieldsValue(vals: Store) {
    values.set(vals)
  }

  function resetFieldValue(path: Path) {
    const initialValue = get(initialValues, path)
    values.set(path, cloneDeep(initialValue))
  }

  function resetFieldsValue(paths?: Array<Path>) {
    if (!paths) {
      // reset all
      values.set(cloneDeep(initialValues), '__v_overlay__')
    }
    else {
      for (const index in paths) {
        const path = paths[index]
        const initialValue = get(initialValues, path)
        values.set(path, cloneDeep(initialValue))
      }
    }
  }

  function setInitialValue(path: Path, value: any) {
    set(initialValues, path, cloneDeep(value))
  }

  function setInitialValues(vals: Store) {
    merge(initialValues, cloneDeep(vals))
  }

  return {
    values,
    initialValues,
    getFieldValue,
    getFieldsValue,
    setFieldValue,
    setFieldsValue,
    resetFieldValue,
    resetFieldsValue,
    setInitialValue,
    setInitialValues,
    getFieldsTransformedValue,
  }
}
