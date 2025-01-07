import { useMounted } from '@vueuse/core'
import { uid } from '../utils/id'
import type { BaseField } from './field'
import type { BaseForm, FormOptions } from './types'
import { createDepStore } from './store/depStore'
import { createFieldStore } from './store/fieldStore'
import { createValueStore } from './store/valueStore'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values> = {}) {
  const {
    omitNil,
    initialValues,
    onValueChange,
    onDependenciesValueChange,
  } = options

  const mounted = useMounted()
  const fieldStore = createFieldStore(omitNil)
  const depStore = createDepStore(fieldStore)
  const valueStore = createValueStore(fieldStore, { initialValues, onFieldValueUpdated })

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
    if (field.touching && !field.isList) {
      if (field.onChange)
        field.onChange(value)

      if (onDependenciesValueChange) {
        const path = field.stringPath.value
        matchDependencies(
          path,
          (depPath) => {
            onDependenciesValueChange({
              path,
              value,
              depPath,
            })
          },
        )
      }

      if (onValueChange) {
        onValueChange({
          value,
          path: field.stringPath.value,
        })
      }
    }
  }

  return form
}
