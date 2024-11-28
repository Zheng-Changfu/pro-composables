export function push<T = any>(list: T[], ...items: T[]) {
  list.push(...items)
}

export function pop<T = any>(list: T[]) {
  list.pop()
}

export function insert<T = any>(list: T[], index: number, ...items: T[]) {
  list.splice(index, 0, ...items)
}

export function remove<T = any>(list: T[], index: number) {
  list.splice(index, 1)
}

export function shift<T = any>(list: T[]) {
  list.shift()
}

export function unshift<T = any>(list: T[], ...items: T[]) {
  list.unshift(...items)
}

export function move<T = any>(list: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex)
    return

  if (fromIndex < 0 || toIndex < 0)
    return

  if (fromIndex > list.length - 1 || toIndex > list.length - 1)
    return

  if (fromIndex < toIndex) {
    const fromItem = list[fromIndex]
    for (let i = fromIndex; i < toIndex; i++)
      list[i] = list[i + 1]
    list[toIndex] = fromItem
  }
  else {
    const fromItem = list[fromIndex]
    for (let i = fromIndex; i > toIndex; i--)
      list[i] = list[i - 1]
    list[toIndex] = fromItem
  }
}

export function moveUp<T = any>(list: T[], index: number) {
  return move(list, index, (index - 1 < 0) ? list.length - 1 : index - 1)
}

export function moveDown<T = any>(list: T[], index: number) {
  return move(list, index, (index + 1 >= list.length) ? 0 : index + 1)
}
