import type { ComputedRef } from 'vue-demi'
import { computed } from 'vue-demi'
import { useInjectFormContext } from '../context'
import { useInjectParentFieldContext } from './context'

export type ExpressionScope = Record<string, any>
export function createScope(
  path: ComputedRef<string[]>,
  index: ComputedRef<number>,
  scope: ExpressionScope = {},
) {
  const form = useInjectFormContext()
  const parent = useInjectParentFieldContext()

  const row = computed(() => {
    if (!parent || index.value === -1)
      return {}

    const { stringPath } = parent!
    const p = stringPath.value
    const i = index.value
    const rowPath = `${p}.${i}`
    return form.valueStore.getFieldValue(rowPath)
  })

  const total = computed(() => {
    return parent
      ? parent.value.value.length
      : 0
  })

  const rowIndex = computed(() => {
    return index.value ?? -1
  })

  const selfValue = computed(() => {
    return form.valueStore.getFieldValue(path.value)
  })

  const builtInScope = {
    /**
     * 如果在列表中则为当前行数据，否则是空对象
     */
    $row: row,
    /**
     * 当前字段如果在列表中则为这个列表的长度，否则为0
     */
    $total: total,
    /**
     * 当前字段的值
     */
    $self: selfValue,
    /**
     * 如果在列表中则为当前行索引，否则是 -1
     */
    $index: rowIndex,
    /**
     * @alias $row
     */
    $record: row,
    /**
     * @alias $index
     */
    $rowIndex: rowIndex,
  }

  return {
    ...builtInScope,
    ...form.scope,
    ...scope,
  }
}
