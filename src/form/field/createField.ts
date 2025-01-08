import type { BaseForm } from '../types'
import type { BaseField, FieldOptions } from './types'
import { get, has } from 'lodash-es'
import { onUnmounted, watch } from 'vue'
import { uid } from '../../utils/id'
import { warnOnce } from '../../utils/warn'
import { useInjectInternalForm } from '../context'
import { usePath } from '../path/usePath'
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
    onUnmounted(() => {
      unmountFieldValue(form, field)
    })
  }
  provideField(field)
  return field
}

function mountFieldValue(form: BaseForm, field: BaseField) {
  if (field.show.value && field.path.value.length > 0) {
    form.fieldStore.mountField(field)
    const path = field.path.value
    const formMounted = form.mounted.value
    const initialValue = field.meta.initialValue
    let val: any
    /**
     * priority：form.valueStore > initialValues > initialValue
     */
    if (has(form.valueStore.values.value, path)) {
      val = form.valueStore.getFieldValue(path)
    }
    else if (initialValue !== undefined) {
      val = initialValue
    }

    if (field.isList && val === undefined) {
      val = []
    }
    form.valueStore.setFieldValue(path, val)
    if (!formMounted) {
      form.valueStore.setInitialValue(path, val)
    }
  }
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
