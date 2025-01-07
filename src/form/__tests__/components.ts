import { defineComponent, h, onMounted, toRef } from 'vue'
import { provideInternalForm } from '../context'
import { createArrayField, createField, ROW_UUID, useInjectField } from '../field'
import { provideFieldIndex } from '../path'

export const Form = defineComponent({
  props: [
    'form',
  ],
  setup(props, { slots }) {
    provideInternalForm(props.form)
    return () => {
      return slots.default?.()
    }
  },
})

export const FormItem = defineComponent({
  props: [
    'path',
    'value',
    'initialValue',
    'dependencies',
    'onFieldMounted',
    'postValue',
    'onChange',
    'visible',
    'hidden',
    'preserve',
    'transform',
  ],
  setup(props, { slots }) {
    const field = createField({
      path: toRef(props, 'path'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      postValue: props.postValue,
      onChange: props.onChange,
      hidden: toRef(props, 'hidden'),
      visible: toRef(props, 'visible'),
      preserve: props.preserve,
      transform: props.transform,
    })
    const listField = useInjectField()
    onMounted(() => {
      props.onFieldMounted?.(field)
    })
    return () => {
      if (listField?.show.value)
        return slots.default?.()

      return field.value.value
    }
  },
})

export const FormListItem = defineComponent({
  props: [
    'index',
  ],
  setup(props, { slots }) {
    provideFieldIndex(toRef(props, 'index'))

    return () => {
      return slots.default?.(props.index)
    }
  },
})

export const FormList = defineComponent({
  props: [
    'path',
    'value',
    'initialValue',
    'dependencies',
    'onFieldMounted',
    'visible',
    'hidden',
    'preserve',
    'transform',
    'onArrayFieldMounted',
  ],
  setup(props, { slots }) {
    const field = createArrayField({
      path: toRef(props, 'path'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      hidden: toRef(props, 'hidden'),
      visible: toRef(props, 'visible'),
      preserve: props.preserve,
      transform: props.transform,
    })

    onMounted(() => {
      props.onArrayFieldMounted?.(field)
    })

    return () => {
      const list = field.value.value ?? []
      return list.map((_, index) => {
        return h(FormListItem, { key: _[ROW_UUID], index }, slots)
      })
    }
  },
})
