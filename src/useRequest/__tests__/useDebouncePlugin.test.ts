import { describe, expect, it, vi } from 'vitest'
import type { Result } from '../types'
import { setup } from '../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('useDebouncePlugin', () => {
  let composable: Result<any, any>

  it('useDebouncePlugin should work', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()

    const unmount = setup(() => {
      composable = useRequest(() => {
        callback()
        return request({})
      }, {
        manual: true,
        debounceWait: 100,
      })
    })

    composable.run(1)
    vi.advanceTimersByTime(50)
    composable.run(2)
    vi.advanceTimersByTime(50)
    composable.run(3)
    vi.advanceTimersByTime(50)
    composable.run(4)

    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1))

    composable.run(1)
    vi.advanceTimersByTime(50)
    composable.run(2)
    vi.advanceTimersByTime(50)
    composable.run(3)
    vi.advanceTimersByTime(50)
    composable.run(4)

    vi.runAllTimers()
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(2))

    composable.run(1)
    vi.advanceTimersByTime(50)
    composable.run(2)
    vi.advanceTimersByTime(50)
    composable.cancel()
    vi.runAllTimers()
    expect(callback).toHaveBeenCalledTimes(2)
    unmount()
  })
})
