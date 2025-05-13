import type { BaseField } from './field'
import type { BaseForm, FormOptions } from './types'
import { useMounted } from '@vueuse/core'
import { uid } from '../utils/id'
import { createFieldStore } from './store/fieldStore'
import { createValueStore } from './store/valueStore'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values> = {}) {
  const {
    omitNil,
    initialValues,
    omitEmptyString,
    onValueChange,
  } = options

  const mounted = useMounted()
  const fieldStore = createFieldStore<Values>(omitNil, omitEmptyString)
  const valueStore = createValueStore<Values>(fieldStore, {
    initialValues,
    onValueChange: onManualValueChange,
  })

  const {
    fieldsValue,
  } = fieldStore

  const {
    values,
    resetFieldValue,
    setInitialValue,
    resetFieldsValue,
    setInitialValues,
  } = valueStore

  const form: BaseForm<Values> = {
    mounted,
    id: uid(),
    values,
    fieldsValue,
    resetFieldValue,
    resetFieldsValue,
    setInitialValue,
    setInitialValues,
    _: {
      valueStore,
      fieldStore,
    },
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
  }

  return form
}
