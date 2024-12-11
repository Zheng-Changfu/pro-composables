import { beforeAll, describe, expect, it, vi } from 'vitest'
import { setup } from '../../../__tests__/mount'
import { request } from '../utils/testingHelpers'
import type { Result } from '../types'
import { useRequest } from '../useRequest'

describe('useRequest', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  let composable: Result<any, any>

  it('useRequest should auto run', async () => {
    let value, success
    const onSuccess = vi.fn((text) => {
      success = text
    })
    const onError = vi.fn()
    const onBefore = vi.fn(() => {
      value = 'before'
    })
    const onFinally = vi.fn(() => {
      value = 'finally'
    })

    const unmount1 = setup(() => {
      composable = useRequest(request, {
        onBefore,
        onSuccess,
        onError,
        onFinally,
      })
    })

    expect(composable.loading.value).toBe(true)
    expect(value).toBe('before')
    expect(success).toBeUndefined()
    vi.runAllTimers()
    await vi.waitFor(() => {
      expect(composable.loading.value).toBe(false)
    })
    expect(success).toBe('success')
    expect(value).toBe('finally')
    expect(onError).toHaveBeenCalledTimes(0)

    // manual run fail
    const unmount2 = setup(() => {
      composable.run(0)
    })

    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => {
      expect(composable.error.value).toEqual(new Error('fail'))
    })
    expect(composable.loading.value).toBe(false)
    expect(onError).toHaveBeenCalledTimes(1)

    // manual run success
    composable.run(1)
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    expect(success).toBe('success')
    await vi.waitFor(() => {
      expect(composable.loading.value).toBe(false)
    })
    expect(onError).toHaveBeenCalledTimes(1)

    // auto run fail
    const unmount3 = setup(() => {
      composable = useRequest(() => request(0), {
        onSuccess,
        onError,
      })
    })
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => {
      expect(composable.error.value).toEqual(new Error('fail'))
    })
    expect(composable.loading.value).toBe(false)
    expect(onError).toHaveBeenCalledTimes(2)

    unmount1()
    unmount2()
    unmount3()
  })

  it('useRequest should be manually triggered', async () => {
    const unmount = setup(() => {
      composable = useRequest(request, {
        manual: true,
        onError: vi.fn(),
      })
    })
    expect(composable.loading.value).toBe(false)
    composable.run(1)
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => {
      expect(composable.loading.value).toBe(false)
    })
    expect(composable.data.value).toBe('success')

    composable.run(0)
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    await vi.waitFor(() => {
      expect(composable.error.value).toEqual(new Error('fail'))
    })
    expect(composable.loading.value).toBe(false)
    unmount()
  })

  it('useRequest runAsync should work', async () => {
    let success = ''
    let error = ''

    const unmount1 = setup(() => {
      composable = useRequest(request, {
        manual: true,
      })
    })

    composable.runAsync(0)
      .then((res) => {
        success = res
      })
      .catch((err) => {
        error = err
      })

    vi.runAllTimers()
    expect(success).toBe('')
    await vi.waitFor(() => expect(error).toEqual(new Error('fail')))

    success = ''
    error = ''
    const unmount2 = setup(() => {
      composable.runAsync(1)
        .then((res) => {
          success = res
        })
        .catch((err) => {
          error = err
        })
    })
    vi.runAllTimers()
    await vi.waitFor(() => expect(success).toBe('success'))
    expect(error).toBe('')

    unmount1()
    unmount2()
  })

  it('useRequest mutate should work', async () => {
    const unmount = setup(() => {
      composable = useRequest(request)
    })
    vi.runAllTimers()
    await vi.waitFor(() => expect(composable.data.value).toBe('success'))
    composable.mutate('hello')
    expect(composable.data.value).toBe('hello')
    unmount()
  })

  it('useRequest defaultParams should work', async () => {
    const unmount = setup(() => {
      composable = useRequest(request, {
        defaultParams: [1, 2, 3] as any,
      })
    })
    expect(composable.loading.value).toBe(true)
    vi.runAllTimers()
    expect(composable.params.value).toEqual([1, 2, 3])
    await vi.waitFor(() => expect(composable.data.value).toBe('success'))
    expect(composable.loading.value).toBe(false)
    unmount()
  })
})
