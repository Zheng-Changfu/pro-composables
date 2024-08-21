import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted, ref } from 'vue-demi'
import type { BaseForm } from '../types'
import { mount } from '../../__tests__/mount'
import type { BaseField } from '../field'
import { Form, FormItem } from './components'

describe('baseField', () => {
  it('priority: initialValue > initialValues', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          vals.push(_form.getFieldsValue())
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a', initialValue: 2 }),
            h(FormItem, { path: 'b', initialValue: 3 }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 3 })
    vm.unmount()
  })

  it('priority: value > initialValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          vals.push(_form.getFieldsValue())
        })
        return () => {
          return h(Form, {
            initialValues: {
              a: 1,
              b: 2,
            },
            onFormMounted,
          }, [
            h(FormItem, { path: 'a', initialValue: 2, value: 3 }),
            h(FormItem, { path: 'b', initialValue: 3, value: 4 }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 3, b: 4 })
    vm.unmount()
  })

  it('initialValue > defaultValue', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          vals.push(_form.getFieldsValue())
        })
        return () => {
          return h(Form, {
            onFormMounted,
          }, [
            h(FormItem, { path: 'a', initialValue: 2, defaultValue: 3 }),
            h(FormItem, { path: 'b', defaultValue: 4 }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    expect(vals[0]).toStrictEqual({ a: 2, b: 4 })
    vm.unmount()
  })

  it('path', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const pathRef = ref('a')
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(async () => {
          pathRef.value = 'aa'
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: pathRef.value, value: 3 }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ aa: 3 })
    expect(vals[1]).toStrictEqual({ aa: 3 })
    vm.unmount()
  })

  it('visible-directive-v-show', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(async () => {
          visibleRef1.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', visible: visibleRef1.value, value: 3 }),
            h(FormItem, { path: 'b', visible: visibleRef2.value, value: 4 }),
          ])
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
        let _form: BaseForm
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(async () => {
          visibleRef1.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          const v1 = visibleRef1.value
          const v2 = visibleRef2.value

          return h(Form, { onFormMounted }, [
            v1 ? h(FormItem, { path: 'a', key: 1, value: 3 }) : null,
            v2 ? h(FormItem, { path: 'b', key: 2, value: 4 }) : null,
          ])
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
        let _form: BaseForm
        const hiddenRef1 = ref(true)
        const hiddenRef2 = ref(true)

        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(async () => {
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
          hiddenRef1.value = true
          hiddenRef2.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            _form.getFieldsValue(),
            _form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', key: 1, hidden: hiddenRef1.value, value: 3 }),
            h(FormItem, { path: 'b', key: 2, hidden: hiddenRef2.value, value: 4 }),
          ])
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
        let _form: BaseForm
        const hiddenRef1 = ref(true)
        const hiddenRef2 = ref(true)

        function onFormMounted(form: BaseForm) {
          _form = form
        }

        onMounted(async () => {
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsValue(true) },
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsValue(true) },
          )
          hiddenRef1.value = true
          hiddenRef2.value = false
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsValue(true) },
          )
          hiddenRef1.value = false
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsValue(true) },
          )
        })
        return () => {
          const h1 = hiddenRef1.value
          const h2 = hiddenRef2.value
          return h(Form, { onFormMounted }, [
            !h1 ? h(FormItem, { path: 'a', key: 1, value: 3 }) : null,
            !h2 ? h(FormItem, { path: 'b', key: 2, value: 4 }) : null,
          ])
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
        let _form: BaseForm
        const value1Ref = ref(3)
        const value2Ref = ref(4)
        const visibleRef1 = ref(true)
        const visibleRef2 = ref(true)

        function onFormMounted(form: BaseForm) {
          _form = form
        }

        onMounted(async () => {
          value1Ref.value = 456
          visibleRef1.value = false
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() }, // {b:4}
            { ..._form.getFieldsValue(true) }, // {b:4}
          )
          visibleRef1.value = true
          visibleRef2.value = false
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsValue(true) },
          )
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', preserve: false, visible: visibleRef1.value, value: value1Ref.value }),
            h(FormItem, { path: 'b', preserve: false, visible: visibleRef2.value, value: value2Ref.value }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ b: 4 })
    expect(vals[1]).toStrictEqual({ b: 4 })
    await nextTick()
    expect(vals[2]).toStrictEqual({ a: 456 })
    expect(vals[3]).toStrictEqual({ a: 456 })
    vm.unmount()
  })
})

describe('update value to trigger postState and onChange', () => {
  it('setFieldValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val === undefined ? 0 : val * 2)
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldValue('a', 1)
          _form.setFieldValue('b', 2)
          _form.setFieldValue('unexitKey', 3)
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', onChange, postState }),
            h(FormItem, { path: 'b', onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    // expect(onChange).toHaveBeenCalledTimes(2)
    expect(postState).toHaveBeenCalledTimes(4)
    expect(postState).toHaveNthReturnedWith(1, 0)
    expect(postState).toHaveNthReturnedWith(2, 0)
    expect(postState).toHaveNthReturnedWith(3, 2)
    expect(postState).toHaveNthReturnedWith(4, 4)
    vm.unmount()
  })

  it('setFieldsValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val === undefined ? 0 : val * 2)
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.setFieldsValue({
            a: 1,
            b: 2,
            unexitKey: 3,
          })
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', onChange, postState }),
            h(FormItem, { path: 'b', onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(postState).toHaveBeenCalledTimes(4)
    expect(postState).toHaveNthReturnedWith(1, 0)
    expect(postState).toHaveNthReturnedWith(2, 0)
    expect(postState).toHaveNthReturnedWith(3, 2)
    expect(postState).toHaveNthReturnedWith(4, 4)
    vm.unmount()
  })

  it('resetFieldValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val * 2)
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.resetFieldValue('a')
          _form.resetFieldValue('b')
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', initialValue: 1, onChange, postState }),
            h(FormItem, { path: 'b', initialValue: 2, onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    expect(postState).toHaveBeenCalledTimes(4)
    expect(postState).toHaveNthReturnedWith(1, 2)
    expect(postState).toHaveNthReturnedWith(2, 4)
    expect(postState).toHaveNthReturnedWith(3, 2)
    expect(postState).toHaveNthReturnedWith(4, 4)
    vm.unmount()
  })

  it('resetFieldsValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val * 2)
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(() => {
          _form.resetFieldsValue()
        })
        return () => {
          return h(Form, { onFormMounted }, [
            h(FormItem, { path: 'a', initialValue: 1, onChange, postState }),
            h(FormItem, { path: 'b', initialValue: 2, onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    expect(postState).toHaveBeenCalledTimes(4)
    expect(postState).toHaveNthReturnedWith(1, 2)
    expect(postState).toHaveNthReturnedWith(2, 4)
    expect(postState).toHaveNthReturnedWith(3, 2)
    expect(postState).toHaveNthReturnedWith(4, 4)
    vm.unmount()
  })

  it('initialValues', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val * 2)
    const Comp = defineComponent({
      setup() {
        return () => {
          return h(Form, { initialValues: { a: 1, b: 2 } }, [
            h(FormItem, { path: 'a', onChange, postState }),
            h(FormItem, { path: 'b', onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    expect(postState).toHaveBeenCalledTimes(2)
    expect(postState).toHaveNthReturnedWith(1, 2)
    expect(postState).toHaveNthReturnedWith(2, 4)
    vm.unmount()
  })

  it('initialValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val * 2)
    const Comp = defineComponent({
      setup() {
        return () => {
          return h(Form, { }, [
            h(FormItem, { path: 'a', initialValue: 1, onChange, postState }),
            h(FormItem, { path: 'b', initialValue: 2, onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(0)
    expect(postState).toHaveBeenCalledTimes(2)
    expect(postState).toHaveNthReturnedWith(1, 2)
    expect(postState).toHaveNthReturnedWith(2, 4)
    vm.unmount()
  })

  it('value', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val * 4)
    const Comp = defineComponent({
      setup() {
        const aRef = ref(1)
        const bRef = ref(2)

        onMounted(() => {
          aRef.value++
          bRef.value++
        })

        return () => {
          return h(Form, { }, [
            h(FormItem, { path: 'a', value: aRef.value, onChange, postState }),
            h(FormItem, { path: 'b', value: bRef.value, onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(postState).toHaveBeenCalledTimes(4)
    expect(postState).toHaveNthReturnedWith(1, 4)
    expect(postState).toHaveNthReturnedWith(2, 8)
    expect(postState).toHaveNthReturnedWith(3, 8)
    expect(postState).toHaveNthReturnedWith(4, 12)
    vm.unmount()
  })

  it('doUpdateValue', async () => {
    const onChange = vi.fn()
    const postState = vi.fn(val => val === undefined ? 0 : val * 2)
    const Comp = defineComponent({
      setup() {
        let _field: BaseField
        function onFieldMounted(field: BaseField) {
          _field = field
        }
        onMounted(() => {
          _field.doUpdateValue(2)
        })
        return () => {
          return h(Form, { }, [
            h(FormItem, { path: 'a', onFieldMounted, onChange, postState }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(postState).toHaveBeenCalledTimes(2)
    expect(postState).toHaveNthReturnedWith(1, 0)
    expect(postState).toHaveNthReturnedWith(2, 4)
    vm.unmount()
  })
})
