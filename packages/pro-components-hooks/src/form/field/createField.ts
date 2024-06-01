import { nextTick, onBeforeUpdate, onMounted, onUnmounted, onUpdated, watch } from 'vue-demi'
import { usePath } from '../path/usePath'
import { useInjectFormContext } from '../context'
import { uid } from '../../utils/id'
import { useInjectFieldContext } from './context'
import type { BaseField, FieldOptions } from './types'
import { useFieldProps } from './useFieldProps'
import { useFormItemProps } from './useFormItemProps'
import { useShow } from './useShow'
import { useValue } from './useValue'
import { getController } from './controllers'

interface CreateFieldOptions {
  /**
   * 是否为列表字段
   * @default false
   */
  isList?: boolean
}
export function createField<T = any>(fieldOptions: FieldOptions<T> = {}, options: CreateFieldOptions = {}) {
  const {
    path,
    value,
    hidden,
    visible,
    initialValue,
    preserve = true,
    dependencies = [],
    onChange,
    postState,
  } = fieldOptions

  const {
    isList = false,
  } = options

  return createBaseField(
    {
      path,
      value,
      hidden,
      visible,
      preserve,
      initialValue,
      dependencies,
      onChange,
      postState,
    },
    { isList },
  )
}

function createBaseField<T = any>(
  fieldOptions: FieldOptions<T> & Required<Pick<FieldOptions, 'preserve' | 'dependencies'>>,
  options: Required<CreateFieldOptions>,
) {
  const {
    onChange,
    postState,
    preserve,
    dependencies,
    path: userPath,
    value: userValue,
    hidden: userHidden,
    visible: userVisible,
    initialValue: userInitialValue,
  } = fieldOptions

  const {
    isList,
  } = options

  const controller = getController()
  const form = useInjectFormContext()
  const parent = useInjectFieldContext()
  const isListPath = !!parent

  const { path } = usePath(userPath)
  const { show } = useShow(userVisible, userHidden)
  const { fieldProps, doUpdateFieldProps } = useFieldProps()
  const { formItemProps, doUpdateFormItemProps } = useFormItemProps()
  const { value, doUpdateValue } = useValue(userValue, { path, initialValue: userInitialValue })

  const baseField: BaseField = {
    id: uid(),
    show,
    path,
    value,
    parent,
    isList,
    preserve,
    fieldProps,
    isListPath,
    dependencies,
    formItemProps,
    updating: false,

    onChange,
    postState,
    doUpdateValue,
    doUpdateFieldProps,
    doUpdateFormItemProps,
  }

  onBeforeUpdate(() => {
    baseField.updating = true
  })

  onUpdated(() => {
    baseField.updating = false
  })

  watch(
    path,
    (newPath, oldPath) => {
      !oldPath
        ? controller.mount(baseField)
        : controller.update(baseField, newPath, oldPath)
    },
    { immediate: true },
  )

  watch(
    show,
    (visible) => {
      visible
        ? controller.mount(baseField)
        : controller.unmount(baseField)
    },
    { immediate: true },
  )

  onMounted(() => form.deps.add(baseField.dependencies))
  onUnmounted(() => controller.unmount(baseField))
  return baseField
}
