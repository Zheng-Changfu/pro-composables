import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { cloneDeep } from 'lodash-es'
import type { ArrayField } from '../field'
import { mount } from '../../__tests__/mount'
import { createForm } from '../form'
import { Form, FormItem, FormList } from './components'

describe('arrayField api', () => {
  it('hidden', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        const form = createForm()

        onMounted(async () => {
          form.setFieldValue('list[0].u1', '234')
          await nextTick()
          form.setFieldValue('u1', '1')
          await nextTick()
          form.setFieldValue('u1', '2')
          await nextTick()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })
        return () => {
          return h(Form, { form }, [
            h(FormItem, { path: 'u1' }),
            h(FormList, {
              path: 'list',
              hidden: form.valueStore.values.value.u1 === '1',
            }, [
              h(FormItem, { initialValue: '', path: 'u1' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    expect(vals[0]).toStrictEqual({ u1: '2', list: [{ u1: '234' }] })
    expect(vals[1]).toMatchObject({ u1: '2', list: [{ u1: '234' }] })
    vm.unmount()
  })

  it('visible', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm()

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          _field.push({})
          await nextTick()
          vals.push(
            form.getFieldsValue(),
            form.getFieldsValue(true),
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, {
                path: 'u1',
                visible: false,
                initialValue: null,
              }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{}] })
    expect(vals[1]).toMatchObject({ list: [{}] })
    vm.unmount()
  })

  it('row field visible', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm()

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          _field.push({ })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          await nextTick()
          form.setFieldValue('list.0.a1', 1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          await nextTick()
          form.setFieldValue('list.0.a1', null)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, {
                path: 'a1',
                initialValue: null,
              }),
              h(FormItem, {
                path: 'a2',
                visible: !!form.valueStore.values.value.list?.[0]?.a1,
                initialValue: null,
              }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a1: null }] })
    expect(vals[1]).toMatchObject({ list: [{ a1: null }] })
    await nextTick()
    await nextTick()
    expect(vals[2]).toStrictEqual({ list: [{ a1: 1, a2: null }] })
    expect(vals[3]).toMatchObject({ list: [{ a1: 1, a2: null }] })
    await nextTick()
    await nextTick()
    expect(vals[4]).toStrictEqual({ list: [{ a1: null }] })
    expect(vals[5]).toMatchObject({ list: [{ a1: null, a2: null }] })
    vm.unmount()
  })

  it('get', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(_field.get(0, 'a'))
          _field.push({ a: 2, b: 2, c: 2 })
          await nextTick()
          vals.push(_field.get(0, 'a'))
          vals.push(_field.get(1, 'a'))
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    await nextTick()
    expect(vals).toStrictEqual([1, 1, 2])
    vm.unmount()
  })

  it('set', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          _field.set(0, { a: 3 })
          await nextTick()
          vals.push(
            cloneDeep(form.getFieldsValue()),
            cloneDeep(form.getFieldsValue(true)),
          )
          _field.set(0, 'b', 2)
          await nextTick()
          vals.push(
            cloneDeep(form.getFieldsValue()),
            cloneDeep(form.getFieldsValue(true)),
          )
          _field.set(0, { a: 4 })
          await nextTick()
          vals.push(
            cloneDeep(form.getFieldsValue()),
            cloneDeep(form.getFieldsValue(true)),
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a: 3, b: 1 }] })
    expect(vals[1]).toMatchObject({ list: [{ a: 3, b: 1 }] })
    await nextTick()
    expect(vals[2]).toStrictEqual({ list: [{ a: 3, b: 2 }] })
    expect(vals[2]).toMatchObject({ list: [{ a: 3, b: 2 }] })
    await nextTick()
    expect(vals[4]).toStrictEqual({ list: [{ a: 4, b: 2 }] })
    expect(vals[5]).toMatchObject({ list: [{ a: 4, b: 2 }] })
    vm.unmount()
  })

  it('push', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.push({ a: 2, b: 2, c: 2 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a: 1, b: 1 }] })
    expect(vals[1]).toMatchObject({ list: [{ a: 1, b: 1, c: 1 }] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    vm.unmount()
  })

  it('pop', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.pop()
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a: 1, b: 1 }] })
    expect(vals[1]).toMatchObject({ list: [{ a: 1, b: 1, c: 1 }] })
    await nextTick()
    expect(vals[2]).toStrictEqual({ list: [] })
    expect(vals[3]).toMatchObject({ list: [] })
    vm.unmount()
  })

  it('insert', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.insert(0, { a: 0, b: 0, c: 0 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [{ a: 1, b: 1 }] })
    expect(vals[1]).toMatchObject({ list: [{ a: 1, b: 1, c: 1 }] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 0, b: 0 },
        { a: 1, b: 1 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 0, b: 0, c: 0 },
        { a: 1, b: 1, c: 1 },
      ],
    })
    vm.unmount()
  })

  it('remove', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [],
    })
    expect(vals[7]).toStrictEqual({
      list: [],
    })
    vm.unmount()
  })

  it('shift', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.shift()
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.shift()
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.shift()
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [],
    })
    expect(vals[7]).toStrictEqual({
      list: [],
    })
    vm.unmount()
  })

  it('unshift', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.unshift({ a: 0, b: 0, c: 0 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.unshift({ a: -1, b: -1, c: -1 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.unshift({ a: -2, b: -2, c: -2 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 0, b: 0 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 0, b: 0, c: 0 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: -1, b: -1 },
        { a: 0, b: 0 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: -1, b: -1, c: -1 },
        { a: 0, b: 0, c: 0 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [
        { a: -2, b: -2 },
        { a: -1, b: -1 },
        { a: 0, b: 0 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[7]).toMatchObject({
      list: [
        { a: -2, b: -2, c: -2 },
        { a: -1, b: -1, c: -1 },
        { a: 0, b: 0, c: 0 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    vm.unmount()
  })

  it('move', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(2, 1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(0, 2)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(1, 2)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(0, -1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(1, 3)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 3, b: 3 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: 2, b: 2 },
        { a: 1, b: 1 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: 2, b: 2, c: 2 },
        { a: 1, b: 1, c: 1 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[7]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    await nextTick()
    expect(vals[8]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[9]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    await nextTick()
    expect(vals[10]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: 1, b: 1 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[11]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    vm.unmount()
  })

  it('moveUp', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveUp(1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveUp(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveUp(2)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 2, b: 2 },
        { a: 1, b: 1 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 2, b: 2, c: 2 },
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 3, b: 3 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[7]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    vm.unmount()
  })

  it('moveDown', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveDown(1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveDown(2)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.moveDown(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 3, b: 3 },
        { a: 2, b: 2 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
        { a: 2, b: 2, c: 2 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 2, b: 2 },
        { a: 1, b: 1 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 2, b: 2, c: 2 },
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 2, b: 2 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[7]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 2, b: 2, c: 2 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    vm.unmount()
  })

  it('remove & insert & move', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        const form = createForm({
          initialValues: {
            list: [
              { a: 1, b: 1, c: 1 },
              { a: 2, b: 2, c: 2 },
              { a: 3, b: 3, c: 3 },
            ],
          },
        })

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        onMounted(async () => {
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.insert(1, {})
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.insert(2, { a: 1 })
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.move(0, 2)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(1)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
          _field.remove(0)
          await nextTick()
          vals.push(
            { ...form.getFieldsValue() },
            { ...form.getFieldsValue(true) },
          )
        })

        return () => {
          return h(Form, { form }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a' }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ list: [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ] })
    expect(vals[1]).toMatchObject({ list: [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
    ] })
    await nextTick()
    expect(vals[2]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[3]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[4]).toStrictEqual({
      list: [
        { a: 1, b: 1 },
        { a: undefined, b: undefined },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[5]).toMatchObject({
      list: [
        { a: 1, b: 1, c: 1 },
        { a: undefined, b: undefined },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[6]).toStrictEqual({
      list: [
        { a: undefined, b: undefined },
        { a: 3, b: 3 },
      ],
    })
    expect(vals[7]).toMatchObject({
      list: [
        { a: undefined, b: undefined },
        { a: 3, b: 3, c: 3 },
      ],
    })
    await nextTick()
    expect(vals[8]).toStrictEqual({
      list: [
        { a: undefined, b: undefined },
        { a: 3, b: 3 },
        { a: 1, b: undefined },
      ],
    })
    expect(vals[9]).toMatchObject({
      list: [
        { a: undefined, b: undefined },
        { a: 3, b: 3, c: 3 },
        { a: 1, b: undefined },
      ],
    })
    await nextTick()
    expect(vals[10]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: 1, b: undefined },
        { a: undefined, b: undefined },
      ],
    })
    expect(vals[11]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: 1, b: undefined },
        { a: undefined, b: undefined },
      ],
    })
    await nextTick()
    expect(vals[12]).toStrictEqual({
      list: [
        { a: 3, b: 3 },
        { a: undefined, b: undefined },
      ],
    })
    expect(vals[13]).toMatchObject({
      list: [
        { a: 3, b: 3, c: 3 },
        { a: undefined, b: undefined },
      ],
    })
    await nextTick()
    expect(vals[14]).toStrictEqual({
      list: [
        { a: undefined, b: undefined },
      ],
    })
    expect(vals[15]).toMatchObject({
      list: [
        { a: undefined, b: undefined },
      ],
    })
    await nextTick()
    expect(vals[16]).toStrictEqual({
      list: [],
    })
    expect(vals[17]).toMatchObject({
      list: [],
    })
    vm.unmount()
  })
})
