import {
  insert as baseInsert,
  move as baseMove,
  moveDown as baseMoveDown,
  moveUp as baseMoveUp,
  pop as basePop,
  push as basePush,
  remove as baseRemove,
  shift as baseShift,
  unshift as baseUnshift,
} from '../utils/array'
import { provideParentFieldContext } from './context'
import { createField } from './createField'
import type { ArrayField, FieldOptions } from './types'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const field = createField(options, {
    isList: true,
  })

  function push(...items: T[]) {
    field.value.value = basePush(field.value.value ?? [], ...items)
  }

  function pop() {
    field.value.value = basePop(field.value.value ?? [])
  }

  function insert(index: number, ...items: T[]) {
    field.value.value = baseInsert(field.value.value ?? [], index, ...items)
  }

  function remove(index: number) {
    field.value.value = baseRemove(field.value.value ?? [], index)
  }

  function shift() {
    field.value.value = baseShift(field.value.value ?? [])
  }

  function unshift(...items: T[]) {
    field.value.value = baseUnshift(field.value.value ?? [], ...items)
  }

  function move(from: number, to: number) {
    field.value.value = baseMove(field.value.value ?? [], from, to)
  }

  function moveUp(index: number) {
    field.value.value = baseMoveUp(field.value.value ?? [], index)
  }

  function moveDown(index: number) {
    field.value.value = baseMoveDown(field.value.value ?? [], index)
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
