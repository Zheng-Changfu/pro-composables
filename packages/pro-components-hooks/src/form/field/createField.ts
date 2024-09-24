import { onUnmounted, watch } from 'vue-demi'
import { cloneDeep, get, has } from 'lodash-es'
import { uid } from '../../utils/id'
import { usePath } from '../path/usePath'
import { useInjectFormContext } from '../context'
import { useCompile, useUpdate } from '../../hooks'
import type { BaseForm } from '../types'
import { useFieldProps } from './useFieldProps'
import type { ArrayField, BaseField, FieldOptions } from './types'
import { provideFieldContext, useInjectParentFieldContext } from './context'
import { useFormItemProps } from './useFormItemProps'
import { useShow } from './useShow'
import { useValue } from './useValue'
import { createScope } from './scope'

interface CreateFieldOptions {
  /**
   * 是否为列表字段
   * @default false
   */
  isList?: boolean
}
export function createField<T = any>(fieldOptions: FieldOptions<T> = {}, options: CreateFieldOptions = {}) {
  const {
    path,
    value,
    hidden,
    visible,
    defaultValue,
    initialValue,
    preserve = true,
    dependencies = [],
    scope = { value: undefined } as any,
    onChange,
    postState,
    transform,
    ...customValues
  } = fieldOptions

  const {
    isList = false,
  } = options

  return createBaseField(
    {
      path,
      value,
      scope,
      hidden,
      visible,
      preserve,
      defaultValue,
      initialValue,
      dependencies,
      onChange,
      postState,
      transform,
      ...customValues,
    },
    { isList },
  )
}

function createBaseField<T = any>(
  fieldOptions: FieldOptions<T> & Required<Pick<FieldOptions, 'scope' | 'preserve' | 'dependencies'>>,
  options: Required<CreateFieldOptions>,
) {
  const {
    onChange,
    postState,
    transform,
    preserve,
    defaultValue,
    initialValue,
    dependencies,
    path: propPath,
    value: propValue,
    scope: propScope,
    hidden: propHidden,
    visible: propVisible,
    ...customValues
  } = fieldOptions

  const id = uid()
  const { isList } = options
  const form = useInjectFormContext()
  const parent = useInjectParentFieldContext()
  const isListPath = !!parent

  const {
    path,
    index,
    stringPath,
  } = usePath(propPath)

  const scope = createScope(
    path,
    index,
    propScope,
  )

  const { show } = useShow(
    propHidden,
    propVisible,
    { scope },
  )

  const parsedPropValue = useCompile(
    propValue!,
    { scope },
  )

  const {
    fieldProps,
    doUpdateFieldProps,
  } = useFieldProps({ scope })

  const {
    formItemProps,
    doUpdateFormItemProps,
  } = useFormItemProps({ scope })

  const {
    value,
    doUpdateValue,
  } = useValue(id, path, { onChange })

  const field: BaseField = {
    id,
    show,
    path,
    value,
    scope,
    index,
    parent,
    isList,
    preserve,
    fieldProps,
    isListPath,
    stringPath,
    dependencies,
    formItemProps,
    parsedPropValue,
    updating: false,
    meta: fieldOptions,
    onChange,
    postState,
    transform,
    doUpdateValue,
    doUpdateFieldProps,
    doUpdateFormItemProps,
    ...customValues,
  }

  useUpdate((updating) => {
    field.updating = updating
  })

  watch(
    path,
    (newPath, oldPath) => {
      moveValue(form, parent, newPath, oldPath)
    },
  )

  watch(
    show,
    (visible) => {
      visible
        ? mountFieldValue(form, field)
        : unmountFieldValue(form, field, parent)
    },
  )

  watch(
    parsedPropValue,
    (val) => {
      if (show.value && path.value.length > 0)
        form.valueStore.setFieldValue(path.value, val)
    },
  )

  provideFieldContext(field)
  form.dependStore.add(field)
  mountFieldValue(form, field)
  onUnmounted(() => unmountFieldValue(form, field, parent))
  return field
}

function mountFieldValue(
  form: BaseForm,
  field: BaseField,
) {
  const {
    show,
    meta,
    path,
    parsedPropValue,
  } = field

  if (!show.value || path.value.length <= 0)
    return

  form.fieldStore.mountField(field)

  const p = path.value
  const { defaultValue, initialValue } = meta
  let val: any
  /**
   * priority：form.valueStore > value > initialValue > initialValues > defaultValue
   * defaultValue 是给部分组件库使用的，有的组件库默认值为 undefined 时表单会出问题
   */
  if (form.valueStore.has(p))
    val = form.valueStore.getFieldValue(p)

  else if (parsedPropValue.value !== undefined)
    val = parsedPropValue.value

  else if (initialValue !== undefined)
    val = initialValue

  else if (!form.mounted.value && has(form.valueStore.initialValues, p))
    val = get(form.valueStore.initialValues, p)

  if (val === undefined && defaultValue !== undefined)
    val = defaultValue

  form.valueStore.setFieldValue(p, val)
  if (!form.mounted.value)
    form.valueStore.setInitialValue(p, val)
}

function unmountFieldValue(
  form: BaseForm,
  field: BaseField,
  parent: ArrayField | null,
) {
  form.fieldStore.unmountField(field)
  if (!parent?.updating && !field.preserve)
    form.valueStore.delete(field.path.value)
}

function moveValue(
  form: BaseForm,
  parent: ArrayField | null,
  newPath: string[],
  oldPath: string[],
) {
  if (!parent?.updating) {
    const oldValue = form.valueStore.getFieldValue(oldPath)
    form.valueStore.delete(oldPath)
    form.valueStore.setFieldValue(newPath, oldValue)
  }
}
