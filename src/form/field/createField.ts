import { get, has } from 'lodash-es'
import { onUnmounted, watch } from 'vue'
import type { BaseForm } from '../types'
import { uid } from '../../utils/id'
import { warnOnce } from '../../utils/warn'
import { useInjectInternalForm } from '../context'
import { usePath } from '../path/usePath'
import type { BaseField, FieldOptions } from './types'
import { provideField, useInjectField } from './context'
import { useShow } from './useShow'
import { useValue } from './useValue'

interface CreateFieldOptions {
  /**
   * 是否为列表字段
   * @default false
   */
  isList?: boolean
}
export function createField<T = any>(
  fieldOptions: FieldOptions<T> = {},
  { isList = false }: CreateFieldOptions = {},
) {
  const {
    hidden,
    visible,
    initialValue,
    path: propPath,
    preserve = true,
    dependencies = [],
    onChange,
    postValue,
    transform,
    onInputValue,
    ...customValues
  } = fieldOptions

  const id = uid()
  const parent = useInjectField(true)
  const form = useInjectInternalForm()

  const {
    path,
    index,
    stringPath,
    analysisPath,
  } = usePath(propPath)

  const { show } = useShow(
    hidden,
    visible,
  )

  const {
    value,
    uidValue,
    doUpdateValue,
  } = useValue(id, path, { onInputValue })

  const field: BaseField = {
    id,
    show,
    path,
    index,
    parent,
    isList,
    preserve,
    stringPath,
    dependencies,
    touching: false,
    meta: fieldOptions,
    value: isList ? uidValue : value,
    onChange,
    postValue,
    transform,
    analysisPath,
    doUpdateValue,
    ...customValues,
  }

  if (!form) {
    if (process.env.NODE_ENV !== 'production')
      warnOnce(`You should use the 'createForm' api at the root`)
  }

  if (form) {
    watch(
      show,
      (visible) => {
        visible
          ? mountFieldValue(form, field)
          : unmountFieldValue(form, field)
      },
    )

    form.depStore.add(field)
    mountFieldValue(form, field)
    onUnmounted(() => unmountFieldValue(form, field))
  }
  provideField(field)
  return field
}

function mountFieldValue(form: BaseForm, field: BaseField) {
  const {
    show,
    meta,
    path,
    isList,
  } = field

  if (!show.value || path.value.length <= 0)
    return

  form.fieldStore.mountField(field)

  const p = path.value
  const { initialValue } = meta
  let val: any
  /**
   * priority：form.valueStore > initialValue > initialValues
   */
  if (form.valueStore.has(p)) {
    val = form.valueStore.getFieldValue(p)
  }
  else if (initialValue !== undefined) {
    val = initialValue
  }
  else if (!form.mounted.value && has(form.valueStore.initialValues, p)) {
    val = get(form.valueStore.initialValues, p)
  }

  if (isList && val === undefined) {
    val = []
  }
  form.valueStore.setFieldValue(p, val)
  if (!form.mounted.value)
    form.valueStore.setInitialValue(p, val)
}

function unmountFieldValue(form: BaseForm, field: BaseField) {
  if (!field.preserve) {
    const oldField = form.fieldStore.getFieldByPath(field.path.value)
    if (oldField?.id === field.id) {
      form.valueStore.delete(field.path.value)
    }
  }
  form.fieldStore.unmountField(field)
}
