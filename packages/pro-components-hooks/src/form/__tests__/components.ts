import { computed, defineComponent, h, onMounted, toRef } from 'vue-demi'
import { createForm } from '../form'
import { createArrayField, createField, useInjectFieldContext } from '../field'
import { uid } from '../../utils/id'
import { providePathContext } from '../path'

export const Form = defineComponent({
  props: [
    'initialValues',
    'expressionContext',
    'onFieldValueChange',
    'onDependenciesChange',
    'onFormMounted',
  ],
  setup(props, { slots }) {
    const form = createForm({
      initialValues: props.initialValues ?? {},
      expressionContext: props.expressionContext,
      onFieldValueChange: props.onFieldValueChange,
      onDependenciesChange: props.onDependenciesChange,
    })

    onMounted(() => {
      props.onFormMounted?.(form)
    })

    return () => slots.default?.()
  },
})

export const FormItem = defineComponent({
  props: [
    'path',
    'value',
    'initialValue',
    'dependencies',
    'onFieldMounted',
    'postState',
    'onChange',
    'visible',
    'hidden',
    'preserve',
  ],
  setup(props, { slots }) {
    const field = createField({
      path: toRef(props, 'path'),
      value: toRef(props, 'value'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      postState: props.postState,
      onChange: props.onChange,
      hidden: toRef(props, 'hidden'),
      visible: toRef(props, 'visible'),
      preserve: props.preserve,
    })
    onMounted(() => {
      props.onFieldMounted?.(field)
    })
    return () => slots.default?.()
  },
})

export const FormListItem = defineComponent({
  props: [
    'index',
  ],
  setup(props, { slots }) {
    const parent = useInjectFieldContext()!
    const path = computed(() => {
      const { index } = props
      return [
        ...parent.path.value,
        index,
      ]
    })
    providePathContext(path)

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
    'postState',
    'onChange',
    'visible',
    'hidden',
    'preserve',
    'onArrayFieldMounted',
  ],
  setup(props, { slots }) {
    const field = createArrayField({
      path: toRef(props, 'path'),
      value: toRef(props, 'value'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      onChange: props.onChange,
      hidden: toRef(props, 'hidden'),
      visible: toRef(props, 'visible'),
      preserve: props.preserve,
      postState: (val) => {
        if (!val)
          return []
        return val.map((item: any) => {
          if (!item.id) {
            return {
              ...item,
              id: uid(),
            }
          }
          return item
        })
      },
    })

    onMounted(() => {
      props.onArrayFieldMounted?.(field)
    })

    return () => {
      const list = field.value.value ?? []
      return list.map((_, index) => {
        return h(FormListItem, { key: _.id, index }, slots)
      })
    }
  },
})
