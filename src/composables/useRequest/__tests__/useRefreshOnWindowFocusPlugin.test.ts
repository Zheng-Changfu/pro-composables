import type { Result } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { setup } from '../../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('useRefreshOnWindowFocusPlugin', () => {
  vi.useFakeTimers()

  let composable: Result<any, any>

  it('useRefreshOnWindowFocusPlugin should work', async () => {
    const unmount = setup(() => {
      composable = useRequest(request, {
        refreshOnWindowFocus: true,
        focusTimespan: 5000,
      })
    })
    expect(composable.loading.value).toBe(true)
    vi.advanceTimersByTime(1001)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    window.dispatchEvent(new Event('visibilitychange'))
    expect(composable.loading.value).toBe(true)
    vi.advanceTimersByTime(2000)
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    vi.advanceTimersByTime(3000)
    window.dispatchEvent(new Event('visibilitychange'))
    expect(composable.loading.value).toBe(true)
    unmount()
  })

  it('fix: multiple unsubscriptions should not delete the last subscription listener ', async () => {
    let composable1: any
    let composable2: any

    const unmount1 = setup(() => {
      composable1 = useRequest(request, {
        refreshOnWindowFocus: true,
      })
    })
    const unmount2 = setup(() => {
      composable2 = useRequest(request, {
        refreshOnWindowFocus: true,
      })
    })

    expect(composable1.loading.value).toBe(true)
    expect(composable2.loading.value).toBe(true)
    vi.advanceTimersByTime(1001)
    await vi.waitFor(() => expect(composable1.loading.value).toBe(false))
    expect(composable2.loading.value).toBe(false)

    window.dispatchEvent(new Event('visibilitychange'))
    expect(composable1.loading.value).toBe(true)
    expect(composable2.loading.value).toBe(true)
    vi.advanceTimersByTime(2000)

    await vi.waitFor(() => expect(composable1.loading.value).toBe(false))
    expect(composable2.loading.value).toBe(false)

    unmount1()

    vi.advanceTimersByTime(3000)
    window.dispatchEvent(new Event('visibilitychange'))

    expect(composable1.loading.value).toBe(false)
    expect(composable2.loading.value).toBe(true)

    unmount2()
  })
})
