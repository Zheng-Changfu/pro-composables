import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { toPath } from 'lodash-es'
import { stringifyPath } from '../utils/path'
import { useInjectField } from '../field/context'
import type { InternalPath } from './types'
import { useInjectPathIndex } from './context'

export function usePath(path?: Ref<InternalPath | undefined>) {
  const index = useInjectPathIndex()
  const parent = useInjectField(true)

  const indexRef = computed(() => {
    return unref(index)
  })

  const pathRef = computed(() => {
    const currentPath = unref(path?.value) ?? []
    if (currentPath.length > 0) {
      if (parent) {
        return [
          ...parent.path.value,
          String(indexRef.value),
          ...toPath(currentPath),
        ]
      }
      else {
        return toPath(currentPath)
      }
    }
    return []
  })

  return {
    path: pathRef,
    index: indexRef,
    stringPath: computed(() => stringifyPath(pathRef.value)),
  }
}
