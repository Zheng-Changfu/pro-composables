import { computed, defineComponent, h, onMounted, toRef } from 'vue-demi'
import { createForm } from '../form'
import { createArrayField, createField, useInjectFieldContext, useInjectParentFieldContext } from '../field'
import { uid } from '../../utils/id'
import { providePathContext, providePathIndexContext } from '../path'

export const Form = defineComponent({
  props: [
    'initialValues',
    'expressionScope',
    'onFieldValueChange',
    'onDependenciesValueChange',
    'onFormMounted',
  ],
  setup(props, { slots }) {
    const form = createForm({
      initialValues: props.initialValues ?? {},
      expressionScope: props.expressionScope,
      onFieldValueChange: props.onFieldValueChange,
      onDependenciesValueChange: props.onDependenciesValueChange,
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
    'defaultValue',
    'initialValue',
    'dependencies',
    'onFieldMounted',
    'postState',
    'onChange',
    'visible',
    'hidden',
    'preserve',
    'transform',
  ],
  setup(props, { slots }) {
    const field = createField({
      path: toRef(props, 'path'),
      value: toRef(props, 'value'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      defaultValue: props.defaultValue,
      postState: props.postState,
      onChange: props.onChange,
      hidden: toRef(props, 'hidden'),
      visible: toRef(props, 'visible'),
      preserve: props.preserve,
      transform: props.transform,
    })
    const listField = useInjectFieldContext()
    onMounted(() => {
      props.onFieldMounted?.(field)
    })
    return () => {
      if (listField?.show.value)
        return slots.default?.()

      return null
    }
  },
})

export const FormListItem = defineComponent({
  props: [
    'index',
  ],
  setup(props, { slots }) {
    const parent = useInjectParentFieldContext()!
    const path = computed(() => {
      const { index } = props
      return [
        ...parent.path.value,
        index,
      ]
    })
    providePathContext(path)
    providePathIndexContext(toRef(props, 'index'))

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
    'transform',
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
      transform: props.transform,
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
      return h(FormItem, {}, {
        default: () => list.map((_, index) => {
          return h(FormListItem, { key: _.id, index }, slots)
        }),
      })
    }
  },
})
