import { onUnmounted, unref, watch } from 'vue'
import { get, has } from 'lodash-es'
import { uid } from '../../utils/id'
import { usePath } from '../path/usePath'
import { useInjectForm } from '../context'
import type { BaseForm } from '../types'
import { warnOnce } from '../../utils/warn'
import type { ArrayField, BaseField, FieldOptions } from './types'
import { provideField, useInjectListField } from './context'
import { useShow } from './useShow'
import { useValue } from './useValue'
import { useListUpdate } from './useListUpdate'

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
    onChange,
    postValue,
    transform,
    onInputValue,
    ...customValues
  } = fieldOptions

  const {
    isList = false,
  } = options

  return createBaseField(
    {
      path,
      value,
      hidden,
      visible,
      preserve,
      defaultValue,
      initialValue,
      dependencies,
      onChange,
      postValue,
      transform,
      onInputValue,
      ...customValues,
    },
    { isList },
  )
}

function createBaseField<T = any>(
  fieldOptions: FieldOptions<T> & Required<Pick<FieldOptions, 'preserve' | 'dependencies'>>,
  options: Required<CreateFieldOptions>,
) {
  const {
    onChange,
    postValue,
    transform,
    onInputValue,
    hidden,
    visible,
    preserve,
    defaultValue,
    initialValue,
    dependencies,
    path: propPath,
    value: propValue,
    ...customValues
  } = fieldOptions

  const id = uid()
  const { isList } = options
  const form = useInjectForm()
  const parent = useInjectListField()
  const isListPath = !!parent

  const {
    path,
    index,
    stringPath,
  } = usePath(propPath)

  const { show } = useShow(
    hidden,
    visible,
  )

  const {
    value,
    doUpdateValue,
  } = useValue(id, path, { onInputValue })

  const field: BaseField = {
    id,
    show,
    path,
    value,
    index,
    parent,
    isList,
    preserve,
    propValue,
    isListPath,
    stringPath,
    dependencies,
    touching: false,
    updating: false,
    meta: fieldOptions,
    onChange,
    postValue,
    transform,
    doUpdateValue,
    ...customValues,
  }

  useListUpdate(field, (updating) => {
    field.updating = updating
  })

  if (!form) {
    if (process.env.NODE_ENV !== 'production')
      warnOnce(`You should use the 'createForm' api at the root`)
  }

  if (form) {
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
      () => unref(propValue),
      (val) => {
        if (show.value && path.value.length > 0)
          form.valueStore.setFieldValue(path.value, val)
      },
    )

    form.dependStore.add(field)
    mountFieldValue(form, field)
    onUnmounted(() => unmountFieldValue(form, field, parent))
  }
  provideField(field)
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
    propValue,
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
  else if (unref(propValue) !== undefined)
    val = unref(propValue)
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
