import type { BaseField } from './field'
import type { BaseForm, FormOptions } from './types'
import { useMounted } from '@vueuse/core'
import { uid } from '../utils/id'
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
  const valueStore = createValueStore(fieldStore, { initialValues, onManualValueChange })

  const {
    match: matchDependencies,
    pause: pauseDependenciesTrigger,
    resume: resumeDependenciesTrigger,
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
  }

  function onManualValueChange(field: BaseField, value: any) {
    if (field.onChange) {
      field.onChange(value)
    }

    if (onValueChange) {
      onValueChange({
        value,
        path: field.stringPath.value,
      })
    }

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
  }

  return form
}
