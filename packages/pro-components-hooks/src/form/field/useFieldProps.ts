import { computed, ref } from 'vue-demi'

export function useFieldProps() {
  const fieldProps = ref<Record<string, any>>({})
  return {
    fieldProps: computed(() => fieldProps.value),
    doUpdateFieldProps: (props: Record<string, any>) => fieldProps.value = props,
  }
}
