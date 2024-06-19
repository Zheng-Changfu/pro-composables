import { get, isArray } from 'lodash-es'

type MapTreeData<R, F extends string | number | symbol> = Array<R & { [K in F]?: MapTreeData<R, K> }>

interface TreeEachInfo<T> {
  level: number
  parent: T | null
}

export function mapTree<T, R, F extends keyof T>(
  data: T[],
  callback: (item: T, index: number, info: TreeEachInfo<T>, array: T[]) => R,
  childrenField: F,
  info: TreeEachInfo<T> = { level: 1, parent: null },
): MapTreeData<R, F> {
  childrenField = childrenField ?? 'children'
  return data.map((item, index, array) => {
    const children = get(item, childrenField, [])
    const returnedItem = callback(item, index, info, array)
    if (isArray(children)) {
      info.level += 1
      info.parent = item
      const mappedChildren = mapTree(children, callback, childrenField, info)
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
  callback: (item: T, index: number, info: TreeEachInfo<T>, array: T[]) => R,
  childrenField: F,
  info: TreeEachInfo<T> = { level: 1, parent: null },
): void {
  childrenField = childrenField ?? 'children'
  data.forEach((item, index, array) => {
    const children = get(item, childrenField, [])
    callback(item, index, info, array)
    if (isArray(children)) {
      info.level += 1
      info.parent = item
      eachTree(children, callback, childrenField, info)
    }
  })
}
