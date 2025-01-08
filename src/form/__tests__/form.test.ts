import type { BaseField } from '../field'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { mount } from '../../__tests__/mount'
import { createForm } from '../form'
import { Form, FormItem, FormList } from './components'

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

describe('create multiple form', () => {
  it('value is unique', async () => {
    const vals1: any[] = []
    const vals2: any[] = []
    const Comp = defineComponent({
      setup() {
        const form1 = createForm()
        const form2 = createForm()

        onMounted(async () => {
          form1.setFieldValue('a', 2)
          vals1.push(form1.getFieldValue('a'))
          vals2.push(form2.getFieldValue('a'))
        })

        return () => {
          return [
            h(Form, { form: form1 }, {
              default: () => [
                h(FormItem, { path: 'a' }),
              ],
            }),
            h(Form, { form: form2 }, {
              default: () => [
                h(FormItem, { path: 'a' }),
              ],
            }),
          ]
        }
      },
    })

    const vm = mount(Comp)
    expect(vals1[0]).toStrictEqual(2)
    expect(vals2[0]).toStrictEqual(undefined)
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

  it('onDependenciesValueChange', async () => {
    const depsAuguments: any = []
    const matchFnArguments: any = []
    const match = vi.fn((path, paths) => {
      matchFnArguments.push(path, paths)
      return path === 'b'
    })
    const onDependenciesValueChange = vi.fn(({ path, depPath }) => {
      if (depsAuguments.length <= 0)
        depsAuguments.push(path, depPath)
    })
    const Comp = defineComponent({
      setup() {
        let _field: BaseField
        const form = createForm({
          onDependenciesValueChange,
        })

        function onFieldMounted(field: BaseField) {
          _field = field
        }

        onMounted(() => {
          _field.doUpdateValue(1)
        })

        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', dependencies: ['b'] }),
              h(FormItem, { path: 'b', onFieldMounted }),
              h(FormItem, { path: 'c', dependencies: 'b' }),
              h(FormItem, { path: 'd', dependencies: /b/ }),
              h(FormItem, { path: 'e', dependencies: match }),
              h(FormItem, { path: 'f', dependencies: ['a', 'b'] }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    await nextTick()
    expect(onDependenciesValueChange).toBeCalledTimes(5)
    expect(depsAuguments).toStrictEqual(['b', 'a'])
    expect(match).toHaveReturnedWith(true)
    expect(matchFnArguments).toStrictEqual([
      'b',
      ['a', 'b', 'c', 'd', 'e', 'f'],
    ])
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a.b.c' }),
            ],
          })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 1, b: 2 })
    expect(vals[1]).toStrictEqual({ a: 1, b: 2 })
    expect(vals[2]).toStrictEqual({ a: 1 })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual(2)
    vm.unmount()
  })

  it('setFieldsValue with overwrite', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(async () => {
          form.setFieldsValue({ a: 2, id: 1 })
          await nextTick()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
            form.getFieldsValue(['a']),
            form.getFieldsValue(['id']),
          )
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormList, {
                path: 'list',
                initialValue: [
                  { a: 1, b: 2 },
                ],
              }, {
                default: () => [
                  h(FormItem, { path: 'a' }),
                  h(FormItem, { path: 'b' }),
                ],
              }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ a: 2, list: [] })
    expect(vals[1]).toStrictEqual({ a: 2, id: 1 })
    expect(vals[2]).toStrictEqual({ a: 2 })
    expect(vals[3]).toStrictEqual({ id: 1 })
    vm.unmount()
  })

  it('setFieldsValue with merge', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          omitNil: false,
        })

        onMounted(async () => {
          form.setFieldsValue({
            a: undefined,
            list: [
              {
                a: 11,
                c: 3,
                list: [{ a: 11, c: 3 }, { a: 22 }, { a: 33, c: 4 }],
              },
            ],
          }, 'shallowMerge')
          await nextTick()
          vals.push(
            form.getFieldsValue(),
          )
        })

        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormList, {
                path: 'list',
                initialValue: [
                  { a: 1, b: 2 },
                  { a: 3, b: 4 },
                ],
              }, {
                default: () => [
                  h(FormItem, { path: 'a' }),
                  h(FormItem, { path: 'b' }),
                  h(FormList, {
                    path: 'list',
                    initialValue: [
                      { a: 1, b: 2 },
                      { a: 3, b: 4 },
                    ],
                  }, {
                    default: () => [
                      h(FormItem, { path: 'a' }),
                      h(FormItem, { path: 'b' }),
                    ],
                  }),
                ],
              }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({
      a: undefined,
      list: [
        {
          a: 11,
          b: undefined,
          list: [
            { a: 11, b: undefined },
            { a: 22, b: undefined },
            { a: 33, b: undefined },
          ],
        },
      ],
    })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
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
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 3 })
    expect(vals[1]).toStrictEqual({ a: 2, b: 3 })
    vm.unmount()
  })
})
