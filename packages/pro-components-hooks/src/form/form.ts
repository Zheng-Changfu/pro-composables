import { onMounted } from 'vue-demi'
import { createEventHook } from '@vueuse/core'
import { uid } from '../utils/id'
import type { BaseForm, FormOptions } from './types'
import { useFormValues } from './useFormValues'
import { provideFormContext } from './context'
import { provideExpressionContext } from './expression'
import type { BaseField } from './field'
import { PathField } from './pathField'
import type { InternalPath } from './path'
import { Deps } from './deps'

export function createForm<Values = Record<string, any>>(options: FormOptions<Values>) {
  const deps = new Deps(options)
  const pathField = new PathField()

  const {
    on: onFieldValueChange,
    trigger: triggerFieldValueChange,
  } = createEventHook<{ field: BaseField, value: any }>()

  const {
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
  } = useFormValues(options, {
    pathField,
    onChange,
    postState,
    skipTraversal,
  })

  const form: BaseForm = {
    deps,
    values,
    id: uid(),
    pathField,
    initialValues,
    mounted: false,
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

  function onChange(path: InternalPath | null, val: any) {
    if (!path || !form.mounted)
      return
    const field = pathField.get(path)
    if (!field)
      return
    triggerFieldValueChange({ field, value: val })
    field.onChange && field.onChange(val)
  }

  function onDependenciesChange(opt: { field: BaseField, value: any }) {
    const { field, value } = opt
    const path = field.path.value
    deps.notify(form, path, { path, value })
  }

  function postState(path: InternalPath | null, val: any) {
    if (!path)
      return val
    const field = pathField.get(path)
    if (!field || !field.postState)
      return val
    return field.postState(val)
  }

  function skipTraversal(path: InternalPath | null) {
    if (!path)
      return false
    const field = pathField.get(path)
    if (!field)
      return false
    // 如果为列表中的字段，在整体赋值时(setFieldsValue)可以跳过，因为数组中存在该值，不需要处理2次
    return field.isListPath
  }

  provideFormContext(form)
  provideExpressionContext(options.expressionContext ?? {})

  onMounted(() => form.mounted = true)
  onFieldValueChange(onDependenciesChange)
  options.onFieldValueChange && onFieldValueChange(options.onFieldValueChange)
  return form
}
