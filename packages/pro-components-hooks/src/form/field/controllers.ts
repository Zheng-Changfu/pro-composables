import { get } from 'lodash-es'
import { useInjectFormContext } from '../context'
import { useInjectParentFieldContext } from './context'
import type { BaseField } from './types'

function getBaseFieldController() {
  const form = useInjectFormContext()

  function mountFieldPathValue(field: BaseField) {
    const { path, preserve } = field
    const p = path.value
    form.pathField.set(p, field)
    if (preserve)
      return
    const initial = get(form.initialValues, p)
    form.values.set(p, initial)
  }

  function unmountFieldPathValue(field: BaseField) {
    const { path, preserve } = field
    const p = path.value
    form.pathField.delete(p)
    if (preserve)
      return
    form.values.delete(p)
  }

  function updateFieldPathValue(field: BaseField, newPath: string[], oldPath: string[]) {
    form.pathField.delete(oldPath)
    form.pathField.set(newPath, field)
    const val = form.values.get(oldPath)
    form.values.delete(oldPath)
    form.values.set(newPath, val)
  }

  return {
    mountFieldPathValue,
    updateFieldPathValue,
    unmountFieldPathValue,
  }
}

function getArrayFieldController() {
  const form = useInjectFormContext()

  function mountFieldPathValue(field: BaseField) {
    const { path } = field
    const p = path.value
    if (form.values.has(p))
      form.pathField.set(p, field)
  }

  function unmountFieldPathValue(field: BaseField) {
    const { path } = field
    const p = path.value
    if (!form.values.has(p))
      form.pathField.delete(p)
  }

  function updateFieldPathValue(field: BaseField, newPath: string[], oldPath: string[]) {
    if (form.values.has(newPath))
      form.pathField.set(newPath, field)

    if (!form.values.has(oldPath))
      form.pathField.delete(oldPath)
  }

  return {
    mountFieldPathValue,
    updateFieldPathValue,
    unmountFieldPathValue,
  }
}

export function getController() {
  const parent = useInjectParentFieldContext()
  const baseFieldController = getBaseFieldController()
  const listFieldController = getArrayFieldController()

  function mount(field: BaseField) {
    const arrayFieldUpdating = parent?.updating
    arrayFieldUpdating
      ? listFieldController.mountFieldPathValue(field)
      : baseFieldController.mountFieldPathValue(field)
  }

  function unmount(field: BaseField) {
    const arrayFieldUpdating = parent?.updating
    arrayFieldUpdating
      ? listFieldController.unmountFieldPathValue(field)
      : baseFieldController.unmountFieldPathValue(field)
  }

  function update(field: BaseField, newPath: string[], oldPath: string[]) {
    const arrayFieldUpdating = parent?.updating
    arrayFieldUpdating
      ? listFieldController.updateFieldPathValue(field, newPath, oldPath)
      : baseFieldController.updateFieldPathValue(field, newPath, oldPath)
  }
  return {
    mount,
    update,
    unmount,
  }
}
