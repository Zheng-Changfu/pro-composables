import { useMounted } from '@vueuse/core'
import { computed } from 'vue-demi'
import { uid } from '../utils/id'
import type { BaseForm, FormOptions } from './types'
import { provideFormContext } from './context'
import type { BaseField } from './field'
import { createFieldStore } from './store/fieldStore'
import { createValueStore } from './store/valueStore'
import { createDependStore } from './store/dependStore'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values>) {
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
    values,
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

  const scope = computed(() => {
    return {
      /**
       * 用户传递的
       */
      ...(options.expressionScope?.value ?? {}),
      /**
       * 整个表单的值，等同于 getFieldsValue(true)
       */
      $values: values.value,
      /**
       * @alias $values
       */
      $vals: values.value,
    }
  })

  const form: BaseForm = {
    scope,
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

  provideFormContext(form)
  return form
}
