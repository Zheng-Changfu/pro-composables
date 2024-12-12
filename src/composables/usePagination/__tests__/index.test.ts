import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { setup } from '../../../__tests__/mount'
import type { PaginationResult } from '../types'
import { usePagination } from '../usePagination'

describe('usePagination', () => {
  let queryArgs: any
  const asyncFn = (query: any) => {
    queryArgs = query
    return Promise.resolve({
      current: query.current,
      total: 55,
      pageSize: query.pageSize,
      list: [],
    })
  }

  let composable: PaginationResult<any, any>

  it('should fetch after first render', async () => {
    queryArgs = undefined
    const unmount = setup(() => {
      composable = usePagination(asyncFn, {})
    })
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(1)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))

    expect(composable.pagination.current.value).toBe(1)
    expect(composable.pagination.pageSize.value).toBe(10)
    expect(composable.pagination.total.value).toBe(55)
    expect(composable.pagination.totalPage.value).toBe(6)
    unmount()
  })

  it('should action work', async () => {
    queryArgs = undefined
    const unmount = setup(() => {
      composable = usePagination(asyncFn, {})
    })
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(1)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    composable.pagination.changeCurrent(2)
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(2)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(2))
    composable.pagination.changeCurrent(10)
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(6)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(6))

    composable.pagination.current.value = 2
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(2)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(2))
    composable.pagination.current.value = 10
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(6)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(6))

    composable.pagination.changePageSize(20)
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(3)
    expect(queryArgs.pageSize).toBe(20)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(3))
    expect(composable.pagination.pageSize.value).toBe(20)
    expect(composable.pagination.totalPage.value).toBe(3)

    composable.pagination.onChange(2, 10)
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(2)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(2))
    expect(composable.pagination.pageSize.value).toBe(10)
    expect(composable.pagination.totalPage.value).toBe(6)

    unmount()
  })

  it('should refreshDeps work', async () => {
    queryArgs = undefined
    const dep = ref(1)

    const unmount = setup(() => {
      composable = usePagination(asyncFn, {
        refreshDeps: [dep],
      })
    })

    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(1)
    expect(queryArgs.pageSize).toBe(10)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))

    composable.pagination.onChange(3, 20)
    expect(composable.loading.value).toBe(true)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(3))
    expect(composable.pagination.pageSize.value).toBe(20)

    dep.value = 2
    await nextTick()
    expect(queryArgs.current).toBe(1)
    expect(queryArgs.pageSize).toBe(20)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(1))
    expect(composable.pagination.pageSize.value).toBe(20)
    unmount()
  })

  it('should default params work', async () => {
    queryArgs = undefined
    const unmount = setup(() => {
      composable = usePagination(asyncFn, {
        defaultCurrent: 2,
        defaultPageSize: 5,
      })
    })
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(2)
    expect(queryArgs.pageSize).toBe(5)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    expect(composable.pagination.current.value).toBe(2)
    expect(composable.pagination.pageSize.value).toBe(5)
    expect(composable.pagination.total.value).toBe(55)
    expect(composable.pagination.totalPage.value).toBe(11)

    composable.pagination.changeCurrent(3)
    expect(composable.loading.value).toBe(true)
    expect(queryArgs.current).toBe(3)
    expect(queryArgs.pageSize).toBe(5)
    await vi.waitFor(() => expect(composable.pagination.current.value).toBe(3))
    expect(composable.pagination.pageSize.value).toBe(5)

    unmount()
  })
})
