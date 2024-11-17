export function push<T = any>(arr: T[], ...items: T[]) {
  const list = [...arr]
  list.push(...items)
  return list
}

export function pop<T = any>(arr: T[]) {
  const list = [...arr]
  list.pop()
  return list
}

export function insert<T = any>(arr: T[], index: number, ...items: T[]) {
  const list = [...arr]
  list.splice(index, 0, ...items)
  return list
}

export function remove<T = any>(arr: T[], index: number) {
  const list = [...arr]
  list.splice(index, 1)
  return list
}

export function shift<T = any>(arr: T[]) {
  const list = [...arr]
  list.shift()
  return list
}

export function unshift<T = any>(arr: T[], ...items: T[]) {
  const list = [...arr]
  list.unshift(...items)
  return list
}

export function move<T = any>(arr: T[], fromIndex: number, toIndex: number) {
  const list = [...arr]
  if (fromIndex === toIndex)
    return list

  if (fromIndex < 0 || toIndex < 0)
    return list

  if (fromIndex > list.length - 1 || toIndex > list.length - 1)
    return list

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

  return list
}

export function moveUp<T = any>(arr: T[], index: number) {
  return move(arr, index, (index - 1 < 0) ? arr.length - 1 : index - 1)
}

export function moveDown<T = any>(arr: T[], index: number) {
  return move(arr, index, (index + 1 >= arr.length) ? 0 : index + 1)
}
