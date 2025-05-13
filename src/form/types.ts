import type { Get, PartialDeep } from 'type-fest'
import type { ComputedRef, Ref } from 'vue'
import type { StringKeyof } from '../utils/types'
import type { InternalPath } from './path'
import type { FieldStore } from './store/fieldStore'
import type { ValueStore } from './store/valueStore'
import type { ValueMergeStrategy } from './utils/value'

export interface FormOptions<Values = any> {
  /**
   * 取 fieldsValue 值时是否清空 null 和 undefined 的数据
   * @default true
   */
  omitNil?: boolean
  /**
   * 取 fieldsValue 值时是否清空空字符串的值
   * @default true
   */
  omitEmptyString?: boolean
  /**
   * 表单初始值
   */
  initialValues?: Values
  /**
   * 字段值发生变化后的回调(手动交互才会触发)
   * @param value 变化后的值
   * @param path 字段路径
   */
  onValueChange?: (opt: {
    value: any
    path: string
  }) => void
}

export interface BaseForm<Values = any> {
  /**
   * 内部使用
   */
  _: {
    valueStore: ValueStore<Values>
    fieldStore: FieldStore<Values>
  }
  /**
   * 唯一标识
   */
  id: string
  /**
   * 表单是否挂载完成
   */
  mounted: Ref<boolean>
  /**
   * 表单值和用户设置的(包括隐藏的)
   */
  values: Ref<Values>
  /**
   * 表单值
   */
  fieldsValue: ComputedRef<Values>
  /**
   * 重置指定路径字段的值
   */
  resetFieldValue: <T extends InternalPath = StringKeyof<Values>>(path: T) => void
  /**
   * 重置所有字段的值
   */
  resetFieldsValue: () => void
  /**
   * 设置指定路径字段的初始值
   */
  setInitialValue: <T extends InternalPath = StringKeyof<Values>>(path: T, value: Get<Values, T>) => void
  /**
   * 设置一组初始值
   */
  setInitialValues: (values: PartialDeep<Values>, strategy?: ValueMergeStrategy) => void
}
