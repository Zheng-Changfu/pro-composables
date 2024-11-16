import { useMounted } from '@vueuse/core'
import { uid } from '../utils/id'
import type { BaseForm, FormOptions } from './types'
import { provideForm } from './context'
import type { BaseField } from './field'
import { createFieldStore } from './store/fieldStore'
import { createValueStore } from './store/valueStore'
import { createDependStore } from './store/dependStore'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values> = {}) {
  const mounted = useMounted()
  const fieldStore = createFieldStore()
  const dependStore = createDependStore(fieldStore)
  const valueStore = createValueStore(fieldStore, { onFieldValueUpdated, initialValues: options.initialValues })

  const {
    matchDepend,
    pauseDependenciesTrigger,
    resumeDependenciesTrigger,
  } = dependStore

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
    valueStore,
    fieldStore,
    dependStore,
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
      onFieldValueChange,
      onDependenciesValueChange,
    } = options

    if (field.touching) {
      if (field.onChange)
        field.onChange(value)

      if (onDependenciesValueChange) {
        const path = field.path.value
        matchDepend(
          field.stringPath.value,
          (dependPath) => {
            onDependenciesValueChange!({ field, path, dependPath, value })
          },
        )
      }
    }

    onFieldValueChange && onFieldValueChange({ field, value })
  }

  provideForm(form)
  return form
}
