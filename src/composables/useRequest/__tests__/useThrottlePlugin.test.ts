import type { Result } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { setup } from '../../../__tests__/mount'
import { useRequest } from '../useRequest'
import { request } from '../utils/testingHelpers'

describe('useThrottlePlugin', () => {
  let composable: Result<any, any>

  it('useThrottlePlugin should work', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()

    const unmount = setup(() => {
      composable = useRequest(() => {
        callback()
        return request({})
      }, {
        manual: true,
        throttleWait: 100,
      })
    })

    composable.run(1)
    vi.advanceTimersByTime(50)
    composable.run(2)
    vi.advanceTimersByTime(50)
    composable.run(3)
    vi.advanceTimersByTime(50)
    composable.run(4)
    vi.advanceTimersByTime(40)
    expect(callback).toHaveBeenCalledTimes(2)

    unmount()
  })
})
