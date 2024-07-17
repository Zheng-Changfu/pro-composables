import { onBeforeUpdate, onUpdated } from 'vue-demi'

export function useUpdate(fn: (updating: boolean) => void) {
  onUpdated(() => fn(false))
  onBeforeUpdate(() => fn(true))
}
