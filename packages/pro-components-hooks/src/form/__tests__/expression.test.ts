import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue-demi'
import { mount } from '../../__tests__/mount'
import type { ArrayField, BaseField } from '../field'
import type { BaseForm } from '../types'
import { Form, FormItem, FormList } from './components'

describe('builtIn expression scope', () => {
  it('$row & $record', async () => {
    const $rows: any[] = []
    const $records: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        let _baseField: BaseField

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        function onFieldMounted(field: BaseField) {
          _baseField = field
        }

        onMounted(async () => {
          await nextTick()
          $rows.push({ ..._baseField.scope.$row.value })
          $records.push({ ..._baseField.scope.$record.value })
          _field.remove(1)
          await nextTick()
          $rows.push({ ..._baseField.scope.$row.value })
          $records.push({ ..._baseField.scope.$record.value })
          _field.insert(1, { a: 33 })
          await nextTick()
          $rows.push({ ..._baseField.scope.$row.value })
          $records.push({ ..._baseField.scope.$record.value })
          _field.remove(0)
          await nextTick()
          $rows.push({ ..._baseField.scope.$row.value })
          $records.push({ ..._baseField.scope.$record.value })
          _field.insert(2, { a: 44 })
          await nextTick()
          $rows.push({ ..._baseField.scope.$row.value })
          $records.push({ ..._baseField.scope.$record.value })
        })

        return () => {
          return h(Form, {
            initialValues: {
              list: [
                { a: 1, b: 1, c: 1 },
                { a: 2, b: 2, c: 2 },
                { a: 3, b: 3, c: 3 },
              ],
            },
          }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a', onFieldMounted }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect($rows[0]).toMatchObject({ a: 3, b: 3 })
    expect($records[0]).toMatchObject({ a: 3, b: 3 })
    await nextTick()
    expect($rows[1]).toMatchObject({ a: 3, b: 3 })
    expect($records[1]).toMatchObject({ a: 3, b: 3 })
    await nextTick()
    expect($rows[2]).toMatchObject({ a: 33 })
    expect($records[2]).toMatchObject({ a: 33 })
    await nextTick()
    expect($rows[3]).toMatchObject({ a: 33 })
    expect($records[3]).toMatchObject({ a: 33 })
    await nextTick()
    expect($rows[4]).toMatchObject({ a: 44 })
    expect($records[4]).toMatchObject({ a: 44 })
    vm.unmount()
  })

  it('$total', async () => {
    const $total: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        let _baseField: BaseField

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        function onFieldMounted(field: BaseField) {
          _baseField = field
        }

        onMounted(async () => {
          await nextTick()
          $total.push(_baseField.scope.$total.value)
          _field.remove(1)
          await nextTick()
          $total.push(_baseField.scope.$total.value)
          _field.insert(1, { a: 33 })
          await nextTick()
          $total.push(_baseField.scope.$total.value)
          _field.remove(0)
          await nextTick()
          $total.push(_baseField.scope.$total.value)
          _field.insert(2, { a: 44 })
          await nextTick()
          $total.push(_baseField.scope.$total.value)
        })

        return () => {
          return h(Form, {
            initialValues: {
              list: [
                { a: 1, b: 1, c: 1 },
                { a: 2, b: 2, c: 2 },
                { a: 3, b: 3, c: 3 },
              ],
            },
          }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a', onFieldMounted }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect($total[0]).toBe(3)
    await nextTick()
    expect($total[1]).toBe(2)
    await nextTick()
    expect($total[2]).toBe(3)
    await nextTick()
    expect($total[3]).toBe(2)
    await nextTick()
    expect($total[4]).toBe(3)
    vm.unmount()
  })

  it('$index & $rowIndex', async () => {
    const $indexs: any[] = []
    const $rowIndexs: any[] = []
    const Comp = defineComponent({
      setup() {
        let _field: ArrayField
        let _baseField: BaseField

        function onArrayFieldMounted(field: ArrayField) {
          _field = field
        }

        function onFieldMounted(field: BaseField) {
          _baseField = field
        }

        onMounted(async () => {
          await nextTick()
          $indexs.push(_baseField.scope.$index.value)
          $rowIndexs.push(_baseField.scope.$rowIndex.value)
          _field.remove(1)
          await nextTick()
          $indexs.push(_baseField.scope.$index.value)
          $rowIndexs.push(_baseField.scope.$rowIndex.value)
          _field.insert(1, { a: 33 })
          await nextTick()
          $indexs.push(_baseField.scope.$index.value)
          $rowIndexs.push(_baseField.scope.$rowIndex.value)
          _field.remove(0)
          await nextTick()
          $indexs.push(_baseField.scope.$index.value)
          $rowIndexs.push(_baseField.scope.$rowIndex.value)
          _field.insert(2, { a: 44 })
          await nextTick()
          $indexs.push(_baseField.scope.$index.value)
          $rowIndexs.push(_baseField.scope.$rowIndex.value)
        })

        return () => {
          return h(Form, {
            initialValues: {
              list: [
                { a: 1, b: 1, c: 1 },
                { a: 2, b: 2, c: 2 },
                { a: 3, b: 3, c: 3 },
              ],
            },
          }, [
            h(FormList, {
              path: 'list',
              onArrayFieldMounted,
            }, [
              h(FormItem, { path: 'a', onFieldMounted }),
              h(FormItem, { path: 'b' }),
            ]),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect($indexs[0]).toBe(2)
    expect($rowIndexs[0]).toBe(2)
    await nextTick()
    expect($indexs[1]).toBe(1)
    expect($rowIndexs[1]).toBe(1)
    await nextTick()
    expect($indexs[2]).toBe(1)
    expect($rowIndexs[2]).toBe(1)
    await nextTick()
    expect($indexs[3]).toBe(0)
    expect($rowIndexs[3]).toBe(0)
    await nextTick()
    expect($indexs[4]).toBe(2)
    expect($rowIndexs[4]).toBe(2)
    vm.unmount()
  })

  it('$values', async () => {
    const vals: any[] = []
    const Comp = defineComponent({
      setup() {
        let _form: BaseForm
        function onFormMounted(form: BaseForm) {
          _form = form
        }
        onMounted(async () => {
          _form.setFieldValue('a', 222)
          await nextTick()
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
            h(FormItem, { path: 'a' }),
            h(FormItem, { path: 'b', hidden: '{{$values.a === 222}}' }),
          ])
        }
      },
    })

    const vm = mount(Comp)
    await nextTick()
    expect(vals[0]).toStrictEqual({ a: 222 })
    vm.unmount()
  })
})
