import { nextTick, onMounted } from 'vue-demi'
import { createEventHook } from '@vueuse/core'
import { uid } from '../utils/id'
import { provideCompileScopeContext } from '../hooks'
import type { BaseForm, FormOptions } from './types'
import { useFormValues } from './useFormValues'
import { provideFormContext } from './context'
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

  const scope = {
    /**
     * 整个表单的值，等同于 getFieldsValue(true)
     */
    $values: values.value,
    /**
     * @alias $values
     */
    $vals: values.value,
    /**
     * 用户传递的
     */
    ...(options.expressionContext ?? {}),
  }

  const form: BaseForm = {
    deps,
    scope,
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
    matchPath: pathField.matchPath,
  }

  function onChange(path: InternalPath | null, val: any) {
    let field: BaseField
    if (
      !path
      || !form.mounted
      // eslint-disable-next-line no-cond-assign
      || !(field = pathField.get(path) as any)
    )
      return
    triggerFieldValueChange({ field, value: val })
    field.onChange && field.onChange(val)
  }

  function postState(path: InternalPath | null, val: any) {
    let field: BaseField
    if (
      !path
      // eslint-disable-next-line no-cond-assign
      || !(field = pathField.get(path) as any)
      || !field.postState
    )
      return val
    return field.postState(val)
  }

  function skipTraversal(path: InternalPath | null) {
    let field: BaseField
    if (
      !path
      // eslint-disable-next-line no-cond-assign
      || !(field = pathField.get(path) as any)
      || !field.isListPath
    )
      return false
    // 如果为列表中的字段，在整体赋值时(setFieldsValue)可以跳过，因为数组中存在该值，不需要处理2次
    return true
  }

  function onDependenciesChange(opt: { field: BaseField, value: any }) {
    const { field, value } = opt
    const path = field.path.value
    nextTick(() => {
      deps.notify(form, path, { path, value })
    })
  }

  provideFormContext(form)
  provideCompileScopeContext(scope)

  onMounted(() => form.mounted = true)
  onFieldValueChange(onDependenciesChange)
  options.onFieldValueChange && onFieldValueChange(options.onFieldValueChange)
  return form
}
