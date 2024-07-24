import { merge } from 'lodash-es'

export type ValueMergeStrategy = 'overwrite' | 'merge' | 'shallowMerge'

export function mergeByStrategy(object: any, source: any, strategy: ValueMergeStrategy = 'merge') {
  if (strategy === 'merge') {
    return merge(object, source)
  }
  else if (strategy === 'shallowMerge') {
    return {
      ...object,
      ...source,
    }
  }
  else {
    return source
  }
}
