import { toRaw } from 'vue'
import type { InternalPath } from '../path'
import { useInjectInternalForm } from '../context'
import {
  insert as _insert,
  move as _move,
  moveDown as _moveDown,
  moveUp as _moveUp,
  pop as _pop,
  push as _push,
  remove as _remove,
  shift as _shift,
  unshift as _unshift,
} from '../utils/array'
import { isInternalPath, stringifyPath } from '../utils/path'
import type { ArrayField, FieldOptions } from './types'
import { createField } from './createField'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const form = useInjectInternalForm()

  const field = createField({
    ...options,
    /**
     * 考虑到性能问题，isList 为 true 时下面这些属性不在生效
     */
    onChange: undefined,
    postValue: undefined,
    onInputValue: undefined,
  }, { isList: true })

  function get(index: number, path: InternalPath) {
    if (form) {
      const fullPath = `${field.stringPath.value}.${index}.${stringifyPath(path)}`
      const value = form.getFieldValue(fullPath)
      return toRaw(value)
    }
  }

  function set(index: number, pathOrValues: InternalPath | object, value?: any) {
    if (form) {
      if (isInternalPath(pathOrValues)) {
        const path = pathOrValues
        const fullPath = `${field.stringPath.value}.${index}.${stringifyPath(path)}`
        form.setFieldValue(fullPath, value)
      }
      else {
        const values = pathOrValues
        const rowPath = `${field.stringPath.value}.${index}`
        form.setFieldValue(rowPath, values)
      }
    }
  }

  function push(...items: T[]) {
    _push(field.value.value ?? [], ...items)
  }

  function pop() {
    _pop(field.value.value ?? [])
  }

  function insert(index: number, ...items: T[]) {
    _insert(field.value.value ?? [], index, ...items)
  }

  function remove(index: number) {
    _remove(field.value.value ?? [], index)
  }

  function shift() {
    _shift(field.value.value ?? [])
  }

  function unshift(...items: T[]) {
    _unshift(field.value.value ?? [], ...items)
  }

  function move(from: number, to: number) {
    _move(field.value.value ?? [], from, to)
  }

  function moveUp(index: number) {
    _moveUp(field.value.value ?? [], index)
  }

  function moveDown(index: number) {
    _moveDown(field.value.value ?? [], index)
  }

  const arrayField: ArrayField = Object.assign(field, {
    get,
    set,
    pop,
    push,
    move,
    shift,
    insert,
    moveUp,
    remove,
    unshift,
    moveDown,
  })
  return arrayField
}
