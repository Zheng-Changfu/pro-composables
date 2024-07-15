import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, watch } from 'vue-demi'
import { usePath } from '../path/usePath'
import { useInjectFormContext } from '../context'
import { uid } from '../../utils/id'
import { provideFieldContext, useInjectParentFieldContext } from './context'
import type { BaseField, FieldOptions } from './types'
import { useFieldProps } from './useFieldProps'
import { useFormItemProps } from './useFormItemProps'
import { useShow } from './useShow'
import { useValue } from './useValue'
import { getController } from './controllers'
import { getFieldExpressionScope } from './getFieldExpressionScope'

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
    scope = {},
    defaultValue,
    initialValue,
    preserve = true,
    dependencies = [],
    onChange,
    postState,
    transform,
    ...customValues
  } = fieldOptions

  const {
    isList = false,
  } = options

  return createBaseField(
    {
      path,
      value,
      scope,
      hidden,
      visible,
      preserve,
      defaultValue,
      initialValue,
      dependencies,
      onChange,
      postState,
      transform,
      ...customValues,
    },
    { isList },
  )
}

function createBaseField<T = any>(
  fieldOptions: FieldOptions<T> & Required<Pick<FieldOptions, 'scope' | 'preserve' | 'dependencies'>>,
  options: Required<CreateFieldOptions>,
) {
  const {
    onChange,
    postState,
    transform,
    preserve,
    dependencies,
    path: propPath,
    value: propValue,
    scope: propScope,
    hidden: propHidden,
    visible: propVisible,
    defaultValue: propDefaultValue,
    initialValue: propInitialValue,
    ...customValues
  } = fieldOptions

  const {
    isList,
  } = options

  const controller = getController()
  const form = useInjectFormContext()
  const parent = useInjectParentFieldContext()
  const isListPath = !!parent

  const {
    path,
    index,
    stringPath,
  } = usePath(propPath)

  const { scope } = getFieldExpressionScope(
    path,
    { scope: propScope },
  )

  const { show } = useShow(
    propHidden,
    propVisible,
    { scope },
  )

  const {
    fieldProps,
    doUpdateFieldProps,
  } = useFieldProps({ scope })

  const {
    formItemProps,
    doUpdateFormItemProps,
  } = useFormItemProps({ scope })

  const { value, doUpdateValue } = useValue(
    propValue,
    {
      path,
      scope,
      postState,
      defaultValue: propDefaultValue,
      initialValue: propInitialValue,
    },
  )

  const baseField: BaseField = {
    id: uid(),
    show,
    path,
    value,
    scope,
    index,
    parent,
    isList,
    preserve,
    fieldProps,
    isListPath,
    stringPath,
    dependencies,
    formItemProps,
    updating: false,
    onChange,
    postState,
    transform,
    doUpdateValue,
    doUpdateFieldProps,
    doUpdateFormItemProps,
    ...customValues,
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
      controller.update(baseField, newPath, oldPath)
    },
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

  onMounted(() => form.deps.add(baseField))
  onUnmounted(() => controller.unmount(baseField))
  provideFieldContext(baseField)
  return baseField
}
