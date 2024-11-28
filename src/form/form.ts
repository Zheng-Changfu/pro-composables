import { useMounted } from '@vueuse/core'
import { uid } from '../utils/id'
import type { BaseForm, FormOptions } from './types'
import type { BaseField } from './field'
import { createFieldStore } from './store/fieldStore'
import { createValueStore } from './store/valueStore'
import { createDepStore } from './store/depStore'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values> = {}) {
  const mounted = useMounted()
  const fieldStore = createFieldStore()
  const depStore = createDepStore(fieldStore)
  const valueStore = createValueStore(fieldStore, {
    onFieldValueUpdated,
    initialValues: options.initialValues,
  })

  const {
    matchDependencies,
    pauseDependenciesTrigger,
    resumeDependenciesTrigger,
  } = depStore

  const {
    matchPath,
    getFieldValue,
    setFieldValue,
    getFieldsValue,
    setFieldsValue,
    resetFieldValue,
    setInitialValue,
    resetFieldsValue,
    setInitialValues,
    getFieldsTransformedValue,
  } = valueStore

  const form: BaseForm = {
    mounted,
    id: uid(),
    depStore,
    valueStore,
    fieldStore,
    matchPath,
    getFieldValue,
    getFieldsValue,
    setFieldValue,
    setFieldsValue,
    resetFieldValue,
    resetFieldsValue,
    setInitialValue,
    setInitialValues,
    pauseDependenciesTrigger,
    resumeDependenciesTrigger,
    getFieldsTransformedValue,
  }

  function onFieldValueUpdated(field: BaseField, value: any) {
    const {
      onValuesChange,
      onDependenciesValueChange,
    } = options

    if (field.touching && !field.isList) {
      if (field.onChange)
        field.onChange(value)

      if (onDependenciesValueChange) {
        const path = field.path.value
        matchDependencies(
          field.stringPath.value,
          (depPath) => {
            onDependenciesValueChange({
              path,
              value,
              depPath,
            })
          },
        )
      }

      if (onValuesChange) {
        onValuesChange({
          value,
          path: field.path.value,
        })
      }
    }
  }

  return form
}
