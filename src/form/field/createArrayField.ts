import type { ArrayField, FieldOptions } from './types'
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
import { createField } from './createField'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const field = createField({
    ...options,
    /**
     * 考虑到性能问题，isList 为 true 时下面这些属性不在生效
     */
    onChange: undefined,
    onInputValue: undefined,
  }, { isList: true })

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
