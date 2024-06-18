import { get, isArray } from 'lodash-es'

type MapTreeData<R, F extends string | number | symbol> = Array<R & { [K in F]?: MapTreeData<R, K> }>

export function mapTree<T, R, F extends keyof T>(
  data: T[],
  callback: (item: T, index: number, array: T[]) => R,
  childrenField: F,
): MapTreeData<R, F> {
  childrenField = childrenField ?? 'children'
  return data.map((item, index, array) => {
    const children = get(item, childrenField, [])
    const returnedItem = callback(item, index, array)
    if (isArray(children)) {
      const mappedChildren = mapTree(children, callback, childrenField)
      return {
        ...returnedItem,
        [childrenField]: mappedChildren,
      }
    }
    return returnedItem
  }) as MapTreeData<R, F>
}

export function eachTree<T, R, F extends keyof T>(
  data: T[],
  callback: (item: T, index: number, array: T[]) => R,
  childrenField: F,
): void {
  childrenField = childrenField ?? 'children'
  data.forEach((item, index, array) => {
    const children = get(item, childrenField, [])
    callback(item, index, array)
    if (isArray(children))
      mapTree(children, callback, childrenField)
  })
}
