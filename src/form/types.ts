import type { Ref } from 'vue'
import type { Get, PartialDeep, SimplifyDeep } from 'type-fest'
import type { PathToObject, StringKeyof } from '../utils/types'
import type { InternalPath, PathPattern } from './path'
import type { DepStore } from './store/depStore'
import type { FieldStore } from './store/fieldStore'
import type { ValueStore } from './store/valueStore'
import type { ValueMergeStrategy } from './utils/value'

export interface FormOptions<Values = any> {
  /**
   * 在调用 getFieldsTransformedValue 时是否清空 null 和 undefined 的数据
   * @default true
   */
  omitNil?: boolean
  /**
   * 表单初始值
   */
  initialValues?: SimplifyDeep<Values>
  /**
   * 字段值发生变化后的回调(手动交互才会触发)
   * @param value 变化后的值
   * @param path 字段路径
   */
  onValueChange?: (opt: {
    value: any
    path: string[]
  }) => void
  /**
   * 依赖项的值发生变化后的回调(手动交互才会触发)
   * @param value 依赖项的值
   * @param path 被依赖项的路径
   * @param depPath 依赖项的路径
   */
  onDependenciesValueChange?: (opt: {
    value: any
    path: string[]
    depPath: string[]
  }) => void
}

export interface BaseForm<Values = any> {
  /**
   * 唯一标识
   */
  id: string
  /**
   * 表单是否挂载完成
   */
  mounted: Ref<boolean>
  /**
   * 表单项依赖仓库
   */
  depStore: DepStore
  /**
   * 表单项字段仓库
   */
  fieldStore: FieldStore
  /**
   * 表单值仓库
   */
  valueStore: ValueStore
  /**
   * 获取指定路径字段的值
   */
  getFieldValue: <T extends InternalPath = StringKeyof<Values>>(path: T) => Get<Values, T>
  /**
   * 获取全部或者部分路径字段的值
   * @example
   * ```js
   * getFieldsValue() // 获取表单值
   * getFieldsValue(true) // 获取完整的值，包含被隐藏的和 setFieldsValue 设置进去的值
   * getFieldsValue(['name','age','list.0.a']) // 获取指定路径字段的值
   * ```
   */
  getFieldsValue:
  & (() => Values)
  & ((val: true) => Values)
  & (<T extends string = StringKeyof<Values>>(paths: T[]) => PathToObject<T[], Values>
  )
  /**
   * 设置指定路径字段的值
   */
  setFieldValue: <T extends InternalPath = StringKeyof<Values>>(path: T, value: Get<Values, T>) => void
  /**
   * 设置一组值
   */
  setFieldsValue: (values: PartialDeep<Values>, strategy?: ValueMergeStrategy) => void
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
  /**
   * 获取全部表单值，不包含被隐藏的和设置过的（被 transform 处理过的）
   */
  getFieldsTransformedValue: () => Values
  /**
   * 匹配路径
   * @returns 返回匹配到的路径数组
   */
  matchPath: (pattern: PathPattern) => string[]
  /**
   * 暂停 onDependenciesValueChange 的触发
   */
  pauseDependenciesTrigger: () => void
  /**
   * 恢复 onDependenciesValueChange 的触发
   */
  resumeDependenciesTrigger: () => void
}
