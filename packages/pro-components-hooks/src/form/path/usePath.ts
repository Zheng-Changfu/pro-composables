import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { toPath } from 'lodash-es'
import { stringifyPath } from '../utils/path'
import type { Path } from './types'
import { useInjectPathContext, useInjectPathIndexContext } from './context'

export function usePath(path?: Ref<Path | undefined>) {
  const index = useInjectPathIndexContext()
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

  const indexRef = computed(() => {
    return unref(index)
  })

  return {
    path: pathRef,
    index: indexRef,
    stringPath: computed(() => stringifyPath(pathRef.value)),
  }
}
