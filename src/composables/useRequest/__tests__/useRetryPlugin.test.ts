import type { Result } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { setup } from '../../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('useRetryPlugin', () => {
  vi.useFakeTimers()

  let composable: Result<any, any>

  it('useRetryPlugin should work', async () => {
    const onError = vi.fn()
    const unmount1 = setup(() => {
      useRequest(() => request(0), {
        retryCount: 3,
        onError,
      })
    })
    vi.setConfig({ testTimeout: 10000 })
    vi.advanceTimersByTime(500)
    expect(onError).toHaveBeenCalledTimes(0)
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1))
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(2))
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(3))
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(4))
    vi.runAllTimers()
    expect(onError).toHaveBeenCalledTimes(4)
    unmount1()

    // cancel should work
    const onError2 = vi.fn()
    const unmount2 = setup(() => {
      composable = useRequest(() => request(0), {
        retryCount: 3,
        onError: onError2,
      })
    })
    expect(onError2).toHaveBeenCalledTimes(0)
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError2).toHaveBeenCalledTimes(1))
    vi.runAllTimers()
    await vi.waitFor(() => expect(onError2).toHaveBeenCalledTimes(2))
    composable.cancel()
    vi.runAllTimers()
    expect(onError2).toHaveBeenCalledTimes(2)
    unmount2()
  })
})
