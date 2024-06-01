import { computed, ref } from 'vue-demi'

export function useFormItemProps() {
  const formItemProps = ref<Record<string, any>>({})
  return {
    formItemProps: computed(() => formItemProps.value),
    doUpdateFormItemProps: (props: Record<string, any>) => formItemProps.value = props,
  }
}
