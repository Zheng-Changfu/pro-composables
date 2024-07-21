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
import { provideParentFieldContext } from './context'
import { createField } from './createField'
import type { ArrayField, FieldOptions } from './types'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const field = createField(options, {
    isList: true,
  })

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
    push,
    pop,
    insert,
    remove,
    shift,
    unshift,
    move,
    moveUp,
    moveDown,
  })
  provideParentFieldContext(arrayField)
  return arrayField
}
