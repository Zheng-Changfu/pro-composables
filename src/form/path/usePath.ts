import type { Ref } from 'vue'
import { computed, nextTick, shallowRef, unref, watch } from 'vue'
import { toPath } from 'lodash-es'
import { stringifyPath } from '../utils/path'
import type { InternalPath } from './types'
import { useInjectPath, useInjectPathIndex } from './context'

export function usePath(path?: Ref<InternalPath | undefined>) {
  const index = useInjectPathIndex()
  const parentPathRef = useInjectPath()
  const indexUpdatingRef = shallowRef(false)

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

  watch(
    indexRef,
    () => {
      indexUpdatingRef.value = true
    },
    { flush: 'sync' },
  )

  watch(
    indexRef,
    () => {
      indexUpdatingRef.value = false
    },
    { flush: 'post' },
  )

  return {
    path: pathRef,
    index: indexRef,
    indexUpdating: indexUpdatingRef,
    stringPath: computed(() => stringifyPath(pathRef.value)),
  }
}
