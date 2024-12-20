import type { Ref } from 'vue'
import { computed, nextTick, shallowRef, unref, watch } from 'vue'
import { toPath } from 'lodash-es'
import { stringifyPath } from '../utils/path'
import { useInjectListField } from '../field'
import type { InternalPath } from './types'
import { useInjectPathIndex } from './context'

export function usePath(path?: Ref<InternalPath | undefined>) {
  const index = useInjectPathIndex()
  const parent = useInjectListField()
  const indexUpdatingRef = shallowRef(false) // 索引是否在更新

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

  watch(
    indexRef,
    () => {
      indexUpdatingRef.value = true
      nextTick(() => {
        indexUpdatingRef.value = false
      })
    },
    { flush: 'sync' },
  )

  return {
    path: pathRef,
    index: indexRef,
    indexUpdating: indexUpdatingRef,
    stringPath: computed(() => stringifyPath(pathRef.value)),
  }
}
