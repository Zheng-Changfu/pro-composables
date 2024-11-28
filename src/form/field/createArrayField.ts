import { createEventHook } from '@vueuse/core'
import { toRaw } from 'vue'
import { get as _get, set as _set, has } from 'lodash-es'
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
import { useInjectInternalForm } from '../context'
import type { InternalPath } from '../path'
import { isInternalPath, stringifyPath } from '../utils/path'
import { provideListField } from './context'
import { createField } from './createField'
import type { ArrayField, ArrayFieldActionName, FieldOptions } from './types'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const {
    on: onActionChange,
    trigger: triggerActionChange,
  } = createEventHook<ArrayFieldActionName>()

  const form = useInjectInternalForm()

  const field = createField(options, {
    isList: true,
  })

  function get(index: number, path: InternalPath) {
    if (form) {
      const fullPath = `${field.stringPath.value}.${index}.${stringifyPath(path)}`
      const value = form.getFieldValue(fullPath)
      triggerActionChange('get')
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
        const rowPath = `${field.stringPath.value}.${index}`
        const values = _set({}, rowPath, pathOrValues)
        const rowPattern = `${field.stringPath.value}\.${index}\.+`
        const matchedPath = form.matchPath(new RegExp(rowPattern))
        matchedPath.forEach((path) => {
          if (has(values, path)) {
            form.setFieldValue(path, _get(values, path))
          }
        })
      }
      triggerActionChange('set')
    }
  }

  function push(...items: T[]) {
    _push(field.value.value ?? [], ...items)
    triggerActionChange('push')
  }

  function pop() {
    _pop(field.value.value ?? [])
    triggerActionChange('pop')
  }

  function insert(index: number, ...items: T[]) {
    _insert(field.value.value ?? [], index, ...items)
    triggerActionChange('insert')
  }

  function remove(index: number) {
    _remove(field.value.value ?? [], index)
    triggerActionChange('remove')
  }

  function shift() {
    _shift(field.value.value ?? [])
    triggerActionChange('shift')
  }

  function unshift(...items: T[]) {
    _unshift(field.value.value ?? [], ...items)
    triggerActionChange('unshift')
  }

  function move(from: number, to: number) {
    _move(field.value.value ?? [], from, to)
    triggerActionChange('move')
  }

  function moveUp(index: number) {
    _moveUp(field.value.value ?? [], index)
    triggerActionChange('moveUp')
  }

  function moveDown(index: number) {
    _moveDown(field.value.value ?? [], index)
    triggerActionChange('moveDown')
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
    onActionChange,
  })

  provideListField(arrayField)
  return arrayField
}
