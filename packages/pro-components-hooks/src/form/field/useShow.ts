import { computed } from 'vue-demi'
import { isBoolean } from 'lodash-es'
import { useCompile } from '../../hooks'
import type { ExpressionScope, FieldOptions } from './types'

interface UseShowOptions {
  scope: ExpressionScope
}
export function useShow(
  hidden: FieldOptions['hidden'],
  visible: FieldOptions['visible'],
  options: UseShowOptions,
) {
  const { scope } = options
  const compiledHidden = useCompile(hidden!, { scope })
  const compiledVisible = useCompile(visible!, { scope })

  const showRef = computed(() => {
    // priority：visible > hidden
    const visible = compiledVisible.value
    if (isBoolean(visible))
      return visible

    const hidden = compiledHidden.value
    if (isBoolean(hidden))
      return !hidden

    return true
  })

  return {
    show: showRef,
  }
}
