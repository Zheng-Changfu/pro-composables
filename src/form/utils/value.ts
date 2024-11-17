import { merge } from 'lodash-es'

export type ValueMergeStrategy = 'overwrite' | 'merge' | 'shallowMerge'

export function mergeByStrategy(object: any, source: any, strategy: ValueMergeStrategy = 'overwrite') {
  if (strategy === 'overwrite') {
    return source
  }
  else if (strategy === 'shallowMerge') {
    return {
      ...object,
      ...source,
    }
  }
  else {
    return merge(object, source)
  }
}
