import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { mount } from '../../__tests__/mount'
import type { BaseForm } from '../types'
import type { BaseField } from '../field'
import { createForm } from '../form'
import { FormItem, FormList } from './components'

describe('not use `createForm` api', () => {
  it('not throw error', async () => {
    const Comp = defineComponent({
      setup() {
        return () => {
          return [
            h(FormItem, { path: 'a.b.c1' }),
            h(FormItem, { path: 'a.b.c2' }),
            h(FormItem, { path: 'a.b.c3' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    vm.unmount()
  })
})

describe('form props', () => {
  it('initialValues', async () => {
    let val: any
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
            c: 3,
            d: {
              e: 1,
            },
          },
        })
        onMounted(() => {
          val = form.valueStore.initialValues
        })
        return () => {
          return null
        }
      },
    })

    const vm = mount(Comp)
    expect(val).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
      d: {
        e: 1,
      },
    })
    vm.unmount()
  })

  it('onFieldValueChange', async () => {
    const onFieldValueChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          onFieldValueChange,
        })
        onMounted(() => {
          form.setFieldValue('a.b.c', 1)
        })
        return () => {
          return h(FormItem, { path: 'a.b.c' })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onFieldValueChange).toBeCalledTimes(1)
    vm.unmount()
  })

  // it('call onFieldValueChange on before render', async () => {
  //   const onFieldValueChange = vi.fn()
  //   const Comp = defineComponent({
  //     setup() {
  //       const form = createForm({
  //         onFieldValueChange,
  //       })
  //       form.setFieldValue('a.b.c', 1)
  //       return () => {
  //         return h(FormItem, { path: 'a.b.c' })
  //       }
  //     },
  //   })

  //   const vm = mount(Comp)
  //   await nextTick()
  //   expect(onFieldValueChange).toBeCalledTimes(1)
  //   vm.unmount()
  // })

  it('onDependenciesValueChange', async () => {
    const depsAuguments: any = []
    const matchFnArguments: any = []
    const match = vi.fn((path, paths) => {
      matchFnArguments.push(path, paths)
      return path === 'b'
    })
    const onDependenciesValueChange = vi.fn(({ path, dependPath }) => {
      if (depsAuguments.length <= 0)
        depsAuguments.push(path, dependPath)
    })
    const Comp = defineComponent({
      setup() {
        let _field: BaseField
        createForm({
          onDependenciesValueChange,
        })

        function onFieldMounted(field: BaseField) {
          _field = field
        }

        onMounted(() => {
          _field.doUpdateValue(1)
        })

        return () => {
          return [
            h(FormItem, { path: 'a', dependencies: ['b'] }),
            h(FormItem, { path: 'b', onFieldMounted }),
            h(FormItem, { path: 'c', dependencies: 'b' }),
            h(FormItem, { path: 'd', dependencies: /b/ }),
            h(FormItem, { path: 'e', dependencies: match }),
            h(FormItem, { path: 'f', dependencies: ['a', 'b'] }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    await nextTick()
    expect(onDependenciesValueChange).toBeCalledTimes(5)
    expect(depsAuguments).toStrictEqual([['b'], ['a']])
    expect(match).toHaveReturnedWith(true)
    expect(matchFnArguments).toStrictEqual([
      'b',
      ['a', 'b', 'c', 'd', 'e', 'f'],
    ])
    vm.unmount()
  })

  it('onDependenciesValueChange called should with before nextTick', async () => {
    let aVal: any
    const onDependenciesValueChangeMock = vi.fn((form: BaseForm) => {
      aVal = form.getFieldValue('a')
    })
    const Comp = defineComponent({
      setup() {
        let _field: BaseField

        const form = createForm({
          onDependenciesValueChange() {
            onDependenciesValueChangeMock(form)
          },
        })

        function onFieldMounted(field: BaseField) {
          _field = field
        }

        onMounted(() => {
          _field.doUpdateValue(1)
        })

        return () => {
          return [
            h(FormItem, {
              path: 'a',
              dependencies: ['b'],
              value: form.valueStore.values.value.b === 1 ? 2 : null,
            }),
            h(FormItem, { path: 'b', onFieldMounted }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    await nextTick()
    expect(onDependenciesValueChangeMock).toHaveBeenCalled()
    expect(aVal).toBe(null)
    vm.unmount()
  })
})

describe('form api', () => {
  it('getFieldValue', async () => {
    let val: any
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: {
              b: {
                c: 1,
              },
            },
          },
        })

        onMounted(() => {
          val = form.getFieldValue('a.b.c')
        })

        return () => {
          return h(FormItem, { path: 'a.b.c' })
        }
      },
    })

    const vm = mount(Comp)
    expect(val).toBe(1)
    vm.unmount()
  })

  it('getFieldsValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
            form.getFieldsValue(['a']),
          )
        })
        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 1, b: 2 })
    expect(vals[1]).toStrictEqual({ a: 1, b: 2 })
    expect(vals[2]).toStrictEqual({ a: 1 })
    vm.unmount()
  })

  it('getFieldsTransformedValue', async () => {
    const vals: any[] = []
    const paths: string[] = []
    const transformA = vi.fn((val, path) => {
      paths.push(path)
      return val
    })
    const transformB = vi.fn((val, path) => {
      paths.push(path)
      return { c: val }
    })
    const transformListA = vi.fn((val, path) => {
      paths.push(path)
      return val.toString()
    })
    const transformListB = vi.fn((val, path) => {
      paths.push(path)
      return { c: val }
    })
    const transformList = vi.fn((val, path) => {
      paths.push(path)
      return val.map((item: any) => ({ ...item, z: 'z' }))
    })

    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
            list: [
              { a: 1, b: 1, d: 1, dd2: 3 },
            ],
          },
        })

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsTransformedValue() },
          )
        })

        return () => {
          return [
            h(FormItem, { path: 'a', transform: transformA }),
            h(FormItem, { path: 'b', transform: transformB }),
            h(FormList, {
              path: 'list',
              transform: transformList,
            }, [
              h(FormItem, { path: 'a', transform: transformListA }),
              h(FormItem, { path: 'b', transform: transformListB }),
              h(FormItem, { path: 'd' }),
            ]),
          ]
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({
      a: 1,
      b: 2,
      list: [
        { a: 1, b: 1, d: 1 },
      ],
    })
    expect(vals[1]).toStrictEqual({
      a: 1,
      c: 2,
      list: [
        { a: '1', c: 1, d: 1, z: 'z' },
      ],
    })
    expect(paths).toStrictEqual([
      'a',
      'b',
      'list.0.a',
      'list.0.b',
      'list',
    ])
    vm.unmount()
  })

  it('setFieldValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setFieldValue('a', 2)
          vals.push(form.getFieldValue('a'))
        })

        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual(2)
    vm.unmount()
  })

  it('setFieldsValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setFieldsValue({ a: 2, id: 1 })
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
            form.getFieldsValue(['a']),
            form.getFieldsValue(['id']),
          )
        })
        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: undefined })
    expect(vals[1]).toStrictEqual({ a: 2, id: 1 })
    expect(vals[2]).toStrictEqual({ a: 2 })
    expect(vals[3]).toStrictEqual({ id: 1 })
    vm.unmount()
  })

  it('resetFieldValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setFieldsValue({ a: 2, b: 3, id: 1 })
          form.resetFieldValue('a')
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })
        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 1, b: 3 })
    expect(vals[1]).toStrictEqual({ a: 1, b: 3, id: 1 })
    vm.unmount()
  })

  it('resetFieldsValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setFieldsValue({ a: 2, b: 3, id: 1 })
          form.resetFieldsValue()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })

        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 1, b: 2 })
    expect(vals[1]).toStrictEqual({ a: 1, b: 2 })
    vm.unmount()
  })

  it('setInitialValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setInitialValue('a', 2)
          form.resetFieldsValue()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })

        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 2 })
    expect(vals[1]).toStrictEqual({ a: 2, b: 2 })
    vm.unmount()
  })

  it('setInitialValues', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })

        onMounted(() => {
          form.setFieldsValue({ a: 3, b: 4, id: 1 })
          form.setInitialValues({ a: 2, b: 3 })
          form.resetFieldsValue()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })

        return () => {
          return [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 3 })
    expect(vals[1]).toStrictEqual({ a: 2, b: 3 })
    vm.unmount()
  })
})
