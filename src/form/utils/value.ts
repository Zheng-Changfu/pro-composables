export type ValueMergeStrategy = 'overwrite' | 'shallowMerge'

export function mergeByStrategy(object: any, source: any, strategy: ValueMergeStrategy = 'overwrite') {
  return strategy === 'overwrite'
    ? source
    : {
        ...object,
        ...source,
      }
}
