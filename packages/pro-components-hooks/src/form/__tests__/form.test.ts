import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted } from 'vue-demi'
import { mount } from '../../__tests__/mount'
import type { BaseForm } from '../types'
import { useInjectExpressionContext } from '../expression'
import { Form, FormItem } from './components'

describe('form props', () => {
  it('initialValues', async () => {
    let val: any
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          val = _form.initialValues
        })
        return () => {
          return h(Form, {
            onFormMounted,
            initialValues: {
              a: 1,
              b: 2,
              c: 3,
              d: {
                e: 1,
              },
            },
          })
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

  it('expressionContext', async () => {
    let val: any
    const T = defineComponent({
      setup() {
        const expression = useInjectExpressionContext()
        val = expression
        return () => ''
      },
    })

    const Comp = defineComponent({
      setup() {
        return () => {
          return h(Form, {
            expressionContext: {
              $values: {
                a: 1,
                b: 2,
              },
            },
          }, h(T))
        }
      },
    })

    const vm = mount(Comp)
    expect(val).toStrictEqual({
      $values: {
        a: 1,
        b: 2,
      },
    })
    vm.unmount()
  })

  it('onFieldValueChange', async () => {
    const onFieldValueChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldValue('a.b.c', 1)
        })
        return () => {
          return h(Form, { onFormMounted, onFieldValueChange }, h(FormItem, { path: 'a.b.c' }))
        }
      },
    })

    const vm = mount(Comp)
    expect(onFieldValueChange).toBeCalledTimes(1)
    vm.unmount()
  })

  it('onDependenciesChange', async () => {
    const onDependenciesChange = vi.fn()
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldValue('b', 1)
        })
        return () => {
          return h(Form, {
            onFormMounted,
            onDependenciesChange,
          }, [
            /**
             * formily
             *  dependencies:[`list`]
             *
             * {
             *  list:[
             *    {a:1,b:2,c:[
             *        {a:1,b:2} // `list[${index}.(a|b)]`
             *    ]}
             * ]
             *
             * {{}}
             *
             *
             * }
             */

            h(FormItem, { path: 'a', dependencies: ['b'] }),
            h(FormItem, { path: 'b' }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(onDependenciesChange).toBeCalledTimes(1)
    vm.unmount()
  })
})

describe('form api', () => {
  it('getFieldValue', async () => {
    let val: any
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          val = _form.getFieldValue('a.b.c')
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: {
                b: {
                  c: 1,
                },
              },
            },
            onFormMounted,
          }, h(FormItem, { path: 'a.b.c' }))
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
            _form.getFieldsValue(['a']),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldValue('a', 2)
          vals.push(_form.getFieldValue('a'))
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldsValue({ a: 2, id: 1 })
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
            _form.getFieldsValue(['a']),
            _form.getFieldsValue(['id']),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 2 })
    expect(vals[1]).toStrictEqual({ a: 2, b: 2, id: 1 })
    expect(vals[2]).toStrictEqual({ a: 2 })
    expect(vals[3]).toStrictEqual({ id: 1 })
    vm.unmount()
  })

  it('resetFieldValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldsValue({ a: 2, b: 3, id: 1 })
          _form.resetFieldValue('a')
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldsValue({ a: 2, b: 3, id: 1 })
          _form.resetFieldsValue()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setInitialValue('a', 2)
          _form.resetFieldsValue()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
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
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldsValue({ a: 3, b: 4, id: 1 })
          _form.setInitialValues({ a: 2, b: 3 })
          _form.resetFieldsValue()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b' }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 3 })
    expect(vals[1]).toStrictEqual({ a: 2, b: 3 })
    vm.unmount()
  })
})
