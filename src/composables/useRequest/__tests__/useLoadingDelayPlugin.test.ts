import { describe, expect, it, vi } from 'vitest'
import type { Result } from '../types'
import { setup } from '../../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('useLoadingDelayPlugin', () => {
  vi.useFakeTimers()

  let composable: Result<any, any>

  it('useLoadingDelayPlugin should work', async () => {
    const unmount1 = setup(() => {
      composable = useRequest(request, {
        loadingDelay: 2000,
      })
    })
    expect(composable.loading.value).toBe(false)
    vi.runAllTimers()
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))

    const unmount2 = setup(() => {
      composable = useRequest(request, {
        loadingDelay: 500,
      })
    })
    expect(composable.loading.value).toBe(false)
    vi.advanceTimersByTime(501)
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    expect(composable.loading.value).toBe(false)

    unmount1()
    unmount2()
  })
})
