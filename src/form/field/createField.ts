import type { BaseForm } from '../types'
import type { BaseField, FieldOptions } from './types'
import { has } from 'lodash-es'
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
export function createField<T = any>(fieldOptions: FieldOptions<T> = {}, { isList = false }: CreateFieldOptions = {}) {
  const {
    hidden,
    visible,
    path: propPath,
    preserve = true,
    onChange,
    onUpdateValue,
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
  } = useValue(id, path, { onUpdateValue })

  const field: BaseField = {
    id,
    show,
    path,
    index,
    parent,
    isList,
    preserve,
    stringPath,
    touching: false,
    value,
    uidValue,
    onChange,
    doUpdateValue,
    ...customValues,
  }

  if (!form) {
    if (process.env.NODE_ENV !== 'production')
      warnOnce(`missing form`)
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
    form._.fieldStore.mountField(field)
    const path = field.path.value
    let val: any
    if (has(form.values.value, path)) {
      val = form._.valueStore.getFieldValue(path)
    }
    if (field.isList && val === undefined) {
      val = []
    }
    form._.valueStore.setFieldValue(path, val)
  }
}

function unmountFieldValue(form: BaseForm, field: BaseField) {
  if (!field.preserve) {
    const oldField = form._.fieldStore.getFieldByPath(field.path.value)
    if (oldField?.id === field.id) {
      form._.valueStore.delete(field.path.value)
    }
  }
  form._.fieldStore.unmountField(field)
}
