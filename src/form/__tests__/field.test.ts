import type { BaseField } from '../field'
import { cloneDeep } from 'lodash-es'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { mount } from '../../__tests__/mount'
import { createForm } from '../form'
import { Form, FormItem } from './components'

describe('baseField', () => {
  it('priority: initialValues > initialValue', async () => {
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
          vals.push(form.fieldsValue.value)
        })

        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', initialValue: 2 }),
              h(FormItem, { path: 'b', initialValue: 3 }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 1, b: 2 })
    vm.unmount()
  })

  // it('path', async () => {
  //   const vals: any[] = []
  //   const Comp = defineComponent({
  //     setup() {
  //       const pathRef = ref('a')
  //       const form = createForm()
  //       onMounted(async () => {
  //         pathRef.value = 'aa'
  //         await nextTick()
  //         vals.push(
  //           form.fieldsValue.value,
  //           form.values.value,
  //         )
  //       })
  //       return () => {
  //         return h(Form, { form }, {
  //           default: () => [
  //             h(FormItem, { path: pathRef.value, value: 3 }),
  //           ],
  //         })
  //       }
  //     },
  //   })

  //   const vm = mount(Comp)
  //   await nextTick()
  //   expect(vals[0]).toStrictEqual({ aa: 3 })
  //   expect(vals[1]).toStrictEqual({ aa: 3 })
  //   vm.unmount()
  // })

  // it('path with formList', async () => {
  //   const vals: any[] = []
  //   const Comp = defineComponent({
  //     setup() {
  //       const pathRef = ref('a')
  //       const form = createForm({
  //         initialValues: {
  //           list: [
  //             { a: 3 },
  //           ],
  //         },
  //       })
  //       onMounted(async () => {
  //         pathRef.value = 'aa'
  //         await nextTick()
  //         vals.push(
  //           form.fieldsValue.value,
  //         )
  //       })
  //       return () => {
  //         return h(Form, { form }, {
  //           default: () => [
  //             h(FormList, { path: 'list' }, {
  //               default: () => [
  //                 h(FormItem, { path: pathRef.value }),
  //               ],
  //             }),
  //           ],
  //         })
  //       }
  //     },
  //   })

  //   const vm = mount(Comp)
  //   await nextTick()
  //   expect(vals[0]).toMatchObject({ list: [{ aa: 3 }] })
  //   vm.unmount()
  // })

  it('visible-directive-v-show', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        onMounted(async () => {
          visibleRef1.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', visible: visibleRef1.value, initialValue: 3 }),
              h(FormItem, { path: 'b', visible: visibleRef2.value, initialValue: 4 }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ b: 4 })
    expect(vals[1]).toStrictEqual({ a: 3, b: 4 })
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 3 })
    expect(vals[3]).toStrictEqual({ a: 3, b: 4 })
    vm.unmount()
  })

  it('visible-directive-v-if', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        onMounted(async () => {
          visibleRef1.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
        })
        return () => {
          const v1 = visibleRef1.value
          const v2 = visibleRef2.value

          return h(Form, { form }, {
            default: () => [
              v1 ? h(FormItem, { path: 'a', key: 1, initialValue: 3 }) : null,
              v2 ? h(FormItem, { path: 'b', key: 2, initialValue: 4 }) : null,
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ b: 4 })
    expect(vals[1]).toStrictEqual({ a: 3, b: 4 })
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 3 })
    expect(vals[3]).toStrictEqual({ a: 3, b: 4 })
    vm.unmount()
  })

  it('hidden-directive-v-show', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        const hiddenRef1 = ref(true)
        const hiddenRef2 = ref(true)

        onMounted(async () => {
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
          hiddenRef1.value = true
          hiddenRef2.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            form.fieldsValue.value,
            form.values.value,
          )
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', key: 1, hidden: hiddenRef1.value, initialValue: 3 }),
              h(FormItem, { path: 'b', key: 2, hidden: hiddenRef2.value, initialValue: 4 }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ })
    expect(vals[1]).toStrictEqual({})
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 3 })
    expect(vals[3]).toStrictEqual({ a: 3 })
    await nextTick()
    expect(vals[4]).toStrictEqual({ b: 4 })
    expect(vals[5]).toStrictEqual({ a: 3, b: 4 })
    await nextTick()
    expect(vals[6]).toStrictEqual({ a: 3, b: 4 })
    expect(vals[7]).toStrictEqual({ a: 3, b: 4 })
    vm.unmount()
  })

  it('hidden-directive-v-if', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        const hiddenRef1 = ref(true)
        const hiddenRef2 = ref(true)

        onMounted(async () => {
          vals.push(
            { ...form.fieldsValue.value },
            { ...form.values.value },
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            { ...form.fieldsValue.value },
            { ...form.values.value },
          )
          hiddenRef1.value = true
          hiddenRef2.value = false
          await nextTick()
          vals.push(
            { ...form.fieldsValue.value },
            { ...form.values.value },
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            { ...form.fieldsValue.value },
            { ...form.values.value },
          )
        })
        return () => {
          const h1 = hiddenRef1.value
          const h2 = hiddenRef2.value
          return h(Form, { form }, {
            default: () => [
              !h1 ? h(FormItem, { path: 'a', key: 1, initialValue: 3 }) : null,
              !h2 ? h(FormItem, { path: 'b', key: 2, initialValue: 4 }) : null,
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ })
    expect(vals[1]).toStrictEqual({ })
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 3 })
    expect(vals[3]).toStrictEqual({ a: 3 })
    await nextTick()
    expect(vals[4]).toStrictEqual({ b: 4 })
    expect(vals[5]).toStrictEqual({ a: 3, b: 4 })
    await nextTick()
    expect(vals[6]).toStrictEqual({ a: 3, b: 4 })
    expect(vals[7]).toStrictEqual({ a: 3, b: 4 })
    vm.unmount()
  })

  it('preserve', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        onMounted(async () => {
          visibleRef1.value = false
          await nextTick()
          vals.push(
            { ...form.fieldsValue.value }, // {b:4}
            { ...form.values.value }, // {b:4}
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            { ...form.fieldsValue.value },
            { ...form.values.value },
          )
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', preserve: false, visible: visibleRef1.value, initialValue: 3 }),
              h(FormItem, { path: 'b', preserve: false, visible: visibleRef2.value, initialValue: 4 }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ b: 4 })
    expect(vals[1]).toStrictEqual({ b: 4 })
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 3 })
    expect(vals[3]).toStrictEqual({ a: 3 })
    vm.unmount()
  })

  it('preserve with manual list', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(async () => {
          form.values.value.list = [
            { a: 1 },
            { a: 2 },
            { a: 3 },
          ]
          await nextTick()
          vals.push(
            cloneDeep(form.values.value),
            cloneDeep(form.fieldsValue.value),
          )
          form.values.value.list = [
            { a: 1 },
            { a: 3 },
          ]
          await nextTick()
          vals.push(
            cloneDeep(form.fieldsValue.value),
            cloneDeep(form.values.value),
          )
        })

        return () => {
          const list = form.values.value.list ?? []
          return h(Form, { form }, {
            default: () => list.map((item: any, index: number) => {
              return h(FormItem, { key: item.a, preserve: false, path: `list.${index}.a`, value: item.a })
            }),
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a: 1 }, { a: 2 }, { a: 3 }] })
    expect(vals[1]).toStrictEqual({ list: [{ a: 1 }, { a: 2 }, { a: 3 }] })
    await nextTick()
    expect(vals[2]).toStrictEqual({ list: [{ a: 1 }, { a: 3 }] })
    expect(vals[3]).toStrictEqual({ list: [{ a: 1 }, { a: 3 }] })
    vm.unmount()
  })
})

describe('update value to trigger onChange', () => {
  it('setFieldValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        onMounted(() => {
          form.values.value.a = 1
          form.values.value.b = 2
          form.values.value.unexitKey = 3
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', onChange }),
              h(FormItem, { path: 'b', onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('setFieldsValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(() => {
          form.values.value = {
            a: 1,
            unexitKey: 3,
          }
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', onChange }),
              h(FormItem, { path: 'b', onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('resetFieldValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(() => {
          form.resetFieldValue('a')
          form.resetFieldValue('b')
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', initialValue: 1, onChange }),
              h(FormItem, { path: 'b', initialValue: 2, onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('resetFieldsValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(() => {
          form.resetFieldsValue()
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', initialValue: 1, onChange }),
              h(FormItem, { path: 'b', initialValue: 2, onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('initialValues', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm({
          initialValues: {
            a: 1,
            b: 2,
          },
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', onChange }),
              h(FormItem, { path: 'b', onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('initialValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        const form = createForm()
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', initialValue: 1, onChange }),
              h(FormItem, { path: 'b', initialValue: 2, onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    vm.unmount()
  })

  it('doUpdateValue', async () => {
    const onChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        let _field: BaseField
        const form = createForm()
        function onFieldMounted(field: BaseField) {
          _field = field
        }
        onMounted(() => {
          _field.doUpdateValue(2)
        })
        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormItem, { path: 'a', onFieldMounted, onChange }),
            ],
          })
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(1)
    vm.unmount()
  })
})
