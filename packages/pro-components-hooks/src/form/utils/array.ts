export function push<T = any>(arr: T[], ...items: T[]) {
  arr.push(...items)
}

export function pop<T = any>(arr: T[]) {
  arr.pop()
}

export function insert<T = any>(arr: T[], index: number, ...items: T[]) {
  arr.splice(index, 0, ...items)
}

export function remove<T = any>(arr: T[], index: number) {
  arr.splice(index, 1)
}

export function shift<T = any>(arr: T[]) {
  arr.shift()
}

export function unshift<T = any>(arr: T[], ...items: T[]) {
  arr.unshift(...items)
}

export function move<T = any>(arr: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex)
    return

  if (fromIndex < 0 || toIndex < 0)
    return

  if (fromIndex > arr.length - 1 || toIndex > arr.length - 1)
    return

  if (fromIndex < toIndex) {
    const fromItem = arr[fromIndex]
    for (let i = fromIndex; i < toIndex; i++)
      arr[i] = arr[i + 1]
    arr[toIndex] = fromItem
  }
  else {
    const fromItem = arr[fromIndex]
    for (let i = fromIndex; i > toIndex; i--)
      arr[i] = arr[i - 1]
    arr[toIndex] = fromItem
  }
}

export function moveUp<T = any>(arr: T[], index: number) {
  move(arr, index, (index - 1 < 0) ? arr.length - 1 : index - 1)
}

export function moveDown<T = any>(arr: T[], index: number) {
  move(arr, index, (index + 1 >= arr.length) ? 0 : index + 1)
}
