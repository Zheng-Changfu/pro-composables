import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue-demi'
import { mount } from '../../__tests__/mount'
import type { BaseForm } from '../types'
import type { ArrayField } from '../field'
import { useInjectCompileScopeContext } from '../../hooks'
import { Form, FormItem, FormList } from './components'

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
        const expression = useInjectCompileScopeContext()
        val = expression
        return () => ''
      },
    })

    const Comp = defineComponent({
      setup() {
        return () => {
          return h(Form, {
            expressionContext: {
              $t: 1,
            },
          }, h(T))
        }
      },
    })

    const vm = mount(Comp)
    expect(val).toStrictEqual({
      $t: 1,
      $vals: {},
      $values: {},
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
            onDependenciesValueChange,
          }, [
            h(FormItem, { path: 'a', dependencies: ['b'] }),
            h(FormItem, { path: 'b' }),
            h(FormItem, { path: 'c', dependencies: 'b' }),
            h(FormItem, { path: 'd', dependencies: { match: 'b' } }),
            h(FormItem, { path: 'e', dependencies: { match: /b/ } }),
            h(FormItem, { path: 'f', dependencies: { match } }),
            h(FormItem, { path: 'g', dependencies: ['a', 'b'] }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(onDependenciesValueChange).toBeCalledTimes(6)
    expect(depsAuguments).toStrictEqual([['b'], ['a']])
    expect(match).toHaveReturnedWith(true)
    expect(matchFnArguments).toStrictEqual([
      'b',
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    ])
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
        let _form: BaseForm
        let _field: ArrayField

        function onFormMounted(form: BaseForm) {
          _form = form
        }

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ..._form.getFieldsValue() },
            { ..._form.getFieldsTransformedValue() },
          )
        })

        return () => {
          return h(Form, {
            onFormMounted,
            initialValues: {
              a: 1,
              b: 2,
              list: [
                { a: 1, b: 1, d: 1, dd2: 3 },
              ],
            },
          }, [
            h(FormItem, { path: 'a', transform: transformA }),
            h(FormItem, { path: 'b', transform: transformB }),
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
              transform: transformList,
            }, [
              h(FormItem, { path: 'a', transform: transformListA }),
              h(FormItem, { path: 'b', transform: transformListB }),
              h(FormItem, { path: 'd' }),
            ]),
          ])
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
      'list[0].a',
      'list[0].b',
      'list',
    ])
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
