import { describe, expect, it } from 'vitest'
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
          form1.values.value.a = 2
          vals1.push(form1.values.value.a)
          vals2.push(form2.values.value.a)
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
          val = form._.valueStore.initialValues
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
          val = form.values.value.a.b.c
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
            form.fieldsValue.value,
            form.values.value,
            { a: form.values.value.a },
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
          form.values.value.a = 2
          vals.push(form.values.value.a)
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
          form.values.value = {
            a: 2,
            id: 1,
          }
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
            { a: form.values.value.a },
            { id: form.values.value.id },
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
          form.values.value = {
            ...form.values.value,
            a: undefined,
            list: [
              {
                a: 11,
                c: 3,
                list: [{ a: 11, c: 3 }, { a: 22 }, { a: 33, c: 4 }],
              },
            ],
          }
          await nextTick()
          vals.push(
            form.fieldsValue.value,
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
          form.values.value = { a: 2, b: 3, id: 1 } as any
          form.resetFieldValue('a')
          vals.push(
            form.fieldsValue.value,
            form.values.value,
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
          form.values.value = { a: 2, b: 3, id: 1 } as any
          form.resetFieldsValue()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
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
            form.fieldsValue.value,
            form.values.value,
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
          form.values.value = { a: 3, b: 4, id: 1 } as any
          form.setInitialValues({ a: 2, b: 3 })
          form.resetFieldsValue()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
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
