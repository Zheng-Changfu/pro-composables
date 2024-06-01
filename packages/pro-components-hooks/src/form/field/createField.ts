import { onMounted, onUnmounted, watch } from 'vue-demi'
import { uid } from '../utils/id'
import { usePath } from '../path/usePath'
import { useInjectFormContext } from '../context'
import { useInjectFieldContext } from './context'
import type { BaseField, FieldOptions } from './types'
import { useFieldProps } from './useFieldProps'
import { useFormItemProps } from './useFormItemProps'
import { useShow } from './useShow'
import { useValue } from './useValue'

export function createField<T = any>(options: FieldOptions<T> = {}, isList = false) {
  const form = useInjectFormContext()
  const parent = useInjectFieldContext()
  const isListPath = !!parent

  const { path } = usePath(options.path)
  const { show } = useShow(options.visible, options.hidden)
  const { fieldProps, doUpdateFieldProps } = useFieldProps()
  const { formItemProps, doUpdateFormItemProps } = useFormItemProps()
  const { value, doUpdateValue } = useValue(options.value, { path, initialValue: options.initialValue })

  const baseField: BaseField = {
    id: uid(),
    show,
    path,
    value,
    isList,
    parent,
    fieldProps,
    isListPath,
    formItemProps,
    doUpdateValue,
    doUpdateFieldProps,
    listUpdating: false,
    doUpdateFormItemProps,
    onChange: options.onChange,
    postState: options.postState,
    preserve: options.preserve ?? true,
    dependencies: options.dependencies ?? [],
  }

  function isSameFieldByPath(path: string[] = []) {
    const field = form.pathField.get(path)
    return field?.id === baseField.id
  }

  function unmountFieldPathValue(field: BaseField) {
    const { path, preserve } = field
    const p = path.value
    const sameField = isSameFieldByPath(p)
    if (!sameField)
      return
    form.pathField.delete(p)
    if (preserve)
      return
    form.values.delete(p)
  }

  function mountFieldPathValue(field: BaseField) {
    const { path, value, preserve } = field
    const p = path.value
    form.pathField.set(p, field)
    if (preserve)
      return
    form.values.set(p, value.value)
  }

  function updateFieldPathValue(field: BaseField, newPath: string[], oldPath: string[] | undefined) {
    form.pathField.set(newPath, field)
    if (!oldPath)
      return

    const sameField = isSameFieldByPath(oldPath)
    if (!sameField)
      return

    form.pathField.delete(oldPath)
    if (parent?.listUpdating)
      return

    const val = form.values.get(oldPath)
    form.values.delete(oldPath)
    form.values.set(newPath, val)
  }

  watch(
    path,
    (newPath, oldPath) => {
      updateFieldPathValue(baseField, newPath, oldPath)
    },
    { immediate: true },
  )

  watch(
    show,
    (visible) => {
      visible
        ? mountFieldPathValue(baseField)
        : unmountFieldPathValue(baseField)
    },
  )

  onMounted(() => form.deps.add(baseField.dependencies))
  onUnmounted(() => unmountFieldPathValue(baseField))
  return baseField
}
