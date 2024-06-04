import { describe, expect, it, vi } from 'vitest'
import { computed, ref, watch } from 'vue-demi'
import { createControlRef } from './createControlRef'

describe('createControlRef', () => {
  it('get', () => {
    const controlRef = createControlRef({
      a: 1,
      c: {
        c1: 'c1',
        c2: { c21: 1 },
        c3: [1, 2, 3],
        c4: [{ a: 1, b: 2 }],
      },
      d: [{ d: 1, d1: 2, d2: { d21: null } }],
    })
    let value = controlRef.get()
    expect(value).toStrictEqual({
      a: 1,
      c: {
        c1: 'c1',
        c2: { c21: 1 },
        c3: [1, 2, 3],
        c4: [{ a: 1, b: 2 }],
      },
      d: [{ d: 1, d1: 2, d2: { d21: null } }],
    })
    value = controlRef.get('a')
    expect(value).toBe(1)
    value = controlRef.get('c')
    expect(value).toStrictEqual({
      c1: 'c1',
      c2: { c21: 1 },
      c3: [1, 2, 3],
      c4: [{ a: 1, b: 2 }],
    })
    value = controlRef.get('c.c1')
    expect(value).toBe('c1')
    value = controlRef.get('c.c2')
    expect(value).toStrictEqual({ c21: 1 })
    value = controlRef.get('c.c3.0')
    expect(value).toBe(1)
    value = controlRef.get(['d', 0, 'd2'])
    expect(value).toStrictEqual({ d21: null })
  })

  it('set & postState & onChange', () => {
    const onChange = vi.fn()
    const postState = vi.fn((_, val) => val * 2)
    const controlRef = createControlRef({}, {
      onChange,
      postState,
    })
    controlRef.set({ a: 1, b: 2 })
    expect(controlRef.value).toStrictEqual({ a: 2, b: 4 })
    expect(controlRef.get()).toStrictEqual({ a: 2, b: 4 })
    expect(postState).toHaveReturnedTimes(2)
    expect(onChange).toHaveBeenCalled()
    controlRef.set({ a: 1 }, '__v_overlay__')
    expect(controlRef.get()).toStrictEqual({ a: 2 })
  })

  it('skipTraversal', () => {
    const onChange = vi.fn()
    const postState = vi.fn((_, val) => val)
    const controlRef = createControlRef({}, {
      onChange,
      postState,
      skipTraversal: path => !!path && path.length > 1,
    })
    controlRef.set({ a: [{ a: 1, b: 2 }] })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(postState).toHaveBeenCalledTimes(1)
    controlRef.set({ a: 1, b: 2 })
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(postState).toHaveBeenCalledTimes(3)
  })

  it('v-model', () => {
    const onChange = vi.fn()
    const postState = vi.fn((_, val) => val * 2)
    const controlRef = createControlRef({}, {
      onChange,
      postState,
    })
    const propsValue = ref(1)
    const value = computed({
      get() {
        return controlRef.get('a')
      },
      set(val) {
        controlRef.set('a', val)
      },
    })
    watch(
      propsValue,
      val => value.value = val,
      { flush: 'sync', immediate: true },
    )
    expect(controlRef.get()).toStrictEqual({ a: 2 })
    expect(value.value).toBe(2)
    value.value = 3
    expect(controlRef.get()).toStrictEqual({ a: 6 })
    expect(value.value).toBe(6)
    propsValue.value = 4
    expect(controlRef.get()).toStrictEqual({ a: 8 })
    expect(value.value).toBe(8)
    controlRef.set('a', 5)
    expect(value.value).toBe(10)
  })
})
