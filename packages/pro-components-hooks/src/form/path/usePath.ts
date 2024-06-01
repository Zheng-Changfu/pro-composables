import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { toPath } from 'lodash-es'
import type { Path } from './types'
import { useInjectPathContext } from './context'

export function usePath(path?: Ref<Path | undefined>) {
  const parentPathRef = useInjectPathContext()
  const pathRef = computed(() => {
    const currentPath = unref(path?.value) ?? []
    if (currentPath.length > 0) {
      return [
        ...toPath(unref(parentPathRef)),
        ...toPath(currentPath!),
      ]
    }
    return []
  })

  return {
    path: pathRef,
  }
}
