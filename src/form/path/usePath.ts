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

  function analysisPath() {
    const path = pathRef.value
    let index = -1
    let parentPath: string[] = []

    for (let i = path.length - 1; i >= 0; i--) {
      if (!Number.isNaN(Number(path[i]))) {
        index = Number(path[i])
        parentPath = path.slice(0, i)
        break
      }
    }

    return {
      index,
      parentPath,
    }
  }

  return {
    analysisPath,
    path: pathRef,
    index: indexRef,
    stringPath: computed(() => stringifyPath(pathRef.value)),
  }
}
