import { computed, ref } from 'vue-demi'
import { compile } from '../../hooks'
import type { ExpressionScope } from './types'

interface UseFieldProps {
  scope: ExpressionScope
}
export function useFieldProps(options: UseFieldProps) {
  const { scope } = options
  const fieldProps = ref<Record<string, any>>({})

  function doUpdateFieldProps(props: Record<string, any>) {
    fieldProps.value = compile(props, scope)
  }

  return {
    fieldProps: computed(() => fieldProps.value),
    doUpdateFieldProps,
  }
}
