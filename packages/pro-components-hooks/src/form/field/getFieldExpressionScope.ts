import type { ComputedRef } from 'vue-demi'
import { computed } from 'vue-demi'
import { useInjectFormContext } from '../context'
import { useInjectCompileScopeContext } from '../../hooks'
import type { BaseField, ExpressionScope } from './types'
import { useInjectParentFieldContext } from './context'

interface GetFieldExpressionScopeOptions {
  scope?: ExpressionScope
}
export function getFieldExpressionScope(
  path: ComputedRef<string[]>,
  options: GetFieldExpressionScopeOptions = {},
) {
  const form = useInjectFormContext()
  const parent = useInjectParentFieldContext()
  const injectableExpressionScope = useInjectCompileScopeContext(options.scope ?? {})

  function getRowValues(field: BaseField) {
    const { index } = field
    const { path } = parent!
    const p = path.value
    const i = index.value
    const rowPath = `${p}[${i}]`
    const values = form.values.get(rowPath)
    // 是否需要剔除掉行信息中不是表单字段的数据？
    return values
  }

  const row = computed(() => {
    const field = form.pathField.get(path.value)
    if (
      !field
      || !field.isListPath
      || !parent
    )
      return {}
    return getRowValues(field)
  })

  const len = computed(() => {
    return parent
      ? parent.value.value.length
      : 0
  })

  const rowIndex = computed(() => {
    const field = form.pathField.get(path.value)
    if (
      !field
      || !field.isListPath
      || !parent
    )
      return -1
    return field.index.value
  })

  const selfValue = computed(() => {
    return form.values.get(path.value)
  })

  const scope = {
    /**
     * 如果在列表中则为当前行数据，否则是空对象
     */
    $row: row,
    /**
     * 当前字段如果在列表中则为这个列表的长度，否则为0
     */
    $length: len,
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
     * @alias $length
     */
    $len: len,
    /**
     * @alias $index
     */
    $rowIndex: rowIndex,
    ...injectableExpressionScope,
  }

  return {
    scope,
  }
}
