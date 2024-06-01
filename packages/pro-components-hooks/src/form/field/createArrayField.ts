import { nextTick } from 'vue'
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
import { provideFieldContext } from './context'
import { createField } from './createField'
import type { ArrayField, FieldOptions } from './types'

export function createArrayField<T = any>(options: FieldOptions<T>) {
  const field = createField(options, true)

  function callWithListUpdate(callback: () => void) {
    field.listUpdating = true
    callback()
    nextTick(() => {
      field.listUpdating = false
    })
  }

  function push(...items: T[]) {
    callWithListUpdate(() => {
      field.value.value = basePush(field.value.value, ...items)
    })
  }

  function pop() {
    callWithListUpdate(() => {
      field.value.value = basePop(field.value.value)
    })
  }

  function insert(index: number, ...items: T[]) {
    callWithListUpdate(() => {
      field.value.value = baseInsert(field.value.value, index, ...items)
    })
  }

  function remove(index: number) {
    callWithListUpdate(() => {
      field.value.value = baseRemove(field.value.value, index)
    })
  }

  function shift() {
    callWithListUpdate(() => {
      field.value.value = baseShift(field.value.value)
    })
  }

  function unshift(...items: T[]) {
    callWithListUpdate(() => {
      field.value.value = baseUnshift(field.value.value, ...items)
    })
  }

  function move(from: number, to: number) {
    callWithListUpdate(() => {
      field.value.value = baseMove(field.value.value, from, to)
    })
  }

  function moveUp(index: number) {
    callWithListUpdate(() => {
      field.value.value = baseMoveUp(field.value.value, index)
    })
  }

  function moveDown(index: number) {
    callWithListUpdate(() => {
      field.value.value = baseMoveDown(field.value.value, index)
    })
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
  provideFieldContext(arrayField)
  return arrayField
}
