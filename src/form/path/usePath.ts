import type { Ref } from 'vue'
import type { InternalPath } from './types'
import { toPath } from 'lodash-es'
import { computed, unref } from 'vue'
import { useInjectField } from '../field/context'
import { stringifyPath } from '../utils/path'
import { useInjectFieldIndex } from './context'

export function usePath(path?: Ref<InternalPath | undefined>) {
  const index = useInjectFieldIndex()
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
