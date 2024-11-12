import { createEventHook, useMounted } from '@vueuse/core'
import { computed, nextTick } from 'vue-demi'
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
  const valueStore = createValueStore(fieldStore, options)

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
    onFieldValueChange,
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
    onFieldValueChange,
    pauseDependenciesTrigger,
    resumeDependenciesTrigger,
    getFieldsTransformedValue,
  }

  function onDependenciesChange(opt: { field: BaseField, value: any }) {
    const { field, value } = opt
    const path = field.path.value
    // wait value updated
    nextTick(() => {
      matchDepend(
        field.stringPath.value,
        (dependPath) => {
          options.onDependenciesValueChange!({ field, path, dependPath, value })
        },
      )
    })
  }

  provideFormContext(form)

  if (options.onDependenciesValueChange)
    onFieldValueChange(onDependenciesChange)
  return form
}
