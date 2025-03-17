import type { ArrayField } from '../field'
import { cloneDeep, set } from 'lodash-es'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { mount } from '../../__tests__/mount'
import { createForm } from '../form'
import { Form, FormItem, FormList } from './components'

describe('arrayField api', () => {
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
            cloneDeep(form.fieldsValue.value),
            cloneDeep(form.values.value),
          )
          _field.push({ a: 2, b: 2, c: 2 })
          await nextTick()
          vals.push(
            cloneDeep(form.fieldsValue.value),
            cloneDeep(form.values.value),
          )
        })

        return () => {
          return h(Form, { form }, {
            default: () => [
              h(FormList, {
                path: 'list',
                onArrayFieldMounted,
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
})
