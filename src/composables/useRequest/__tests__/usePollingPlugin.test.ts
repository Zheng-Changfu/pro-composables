import type { Result } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { setup } from '../../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('usePollingPlugin', () => {
  vi.useFakeTimers()

  let composable: Result<any, any>

  it('usePollingPlugin pollingInterval=100 pollingWhenHidden=true should work', async () => {
    const callback = vi.fn()

    const unmount = setup(() => {
      composable = useRequest(() => {
        callback()
        return request(1)
      }, {
        pollingInterval: 100,
        pollingWhenHidden: true,
      })
    })
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => expect(composable.loading.value).toBe(false))
    expect(composable.data.value).toBe('success')
    expect(callback).toHaveBeenCalledTimes(1)
    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(2))
    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(3))
    composable.cancel()
    vi.runAllTimers()
    expect(callback).toHaveBeenCalledTimes(3)
    composable.run()
    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(4))
    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(5))
    unmount()
  })

  let composable2: Result<any, any>
  it('usePollingPlugin pollingErrorRetryCount=3 should work', async () => {
    // if request error and set pollingErrorRetryCount
    // and the number of consecutive failures exceeds pollingErrorRetryCount, polling stops
    let errorCallback: any

    const unmount = setup(() => {
      errorCallback = vi.fn()
      composable2 = useRequest(() => request(0), {
        pollingErrorRetryCount: 3,
        pollingInterval: 100,
        pollingWhenHidden: true,
        onError: errorCallback,
      })
    })
    expect(composable2.loading.value).toBe(true)
    expect(errorCallback).toHaveBeenCalledTimes(0)
    vi.runAllTimers()
    await vi.waitFor(() => expect(composable2.loading.value).toBe(false))
    expect(errorCallback).toHaveBeenCalledTimes(1)
    vi.runAllTimers()
    await vi.waitFor(() => expect(errorCallback).toHaveBeenCalledTimes(2))
    vi.runAllTimers()
    await vi.waitFor(() => expect(errorCallback).toHaveBeenCalledTimes(3))
    vi.runAllTimers()
    await vi.waitFor(() => expect(errorCallback).toHaveBeenCalledTimes(4))
    vi.runAllTimers()
    expect(errorCallback).toHaveBeenCalledTimes(4)
    composable2.run()
    vi.runAllTimers()
    await vi.waitFor(() => expect(errorCallback).toHaveBeenCalledTimes(5))

    unmount()
  })
})
