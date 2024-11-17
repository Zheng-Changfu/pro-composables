import { computed, defineComponent, h, onMounted, toRef } from 'vue'
import { createArrayField, createField, useInjectField, useInjectListField } from '../field'
import { uid } from '../../utils/id'
import { providePath, providePathIndex } from '../path'

export const FormItem = defineComponent({
  props: [
    'path',
    'value',
    'defaultValue',
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
      value: toRef(props, 'value'),
      dependencies: props.dependencies,
      initialValue: props.initialValue,
      defaultValue: props.defaultValue,
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
    const parent = useInjectListField()!
    const path = computed(() => {
      const { index } = props
      return [
        ...parent.path.value,
        index,
      ]
    })
    providePath(path)
    providePathIndex(toRef(props, 'index'))

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
    'postValue',
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
      postValue: (val) => {
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
