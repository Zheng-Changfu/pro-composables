import type { Ref } from 'vue-demi'
import type { EventHookTrigger } from '@vueuse/core'
import type { ArrayField, BaseField } from './field'
import type { ExpressionScope } from './field/scope'
import type { Path, PathPattern } from './path'
import type { DependStore } from './store/dependStore'
import type { FieldStore } from './store/fieldStore'
import type { ValueStore } from './store/valueStore'
import type { ValueMergeStrategy } from './utils/value'

export interface FormOptions<Values = any> {
  /**
   * 表单初始值
   */
  initialValues?: Values
  /**
   * 表达式可以读取到的作用域属性
   */
  expressionScope?: ExpressionScope
  /**
   * 字段值发生变化后的回调
   */
  onFieldValueChange?: (opt: { field: BaseField | ArrayField, value: any }) => void
  /**
   * 依赖项的值发生变化后的回调
   * @param field 字段控制器
   * @param path 被依赖项的路径
   * @param dependPath 依赖项的路径
   * @param val 依赖项的值
   */
  onDependenciesValueChange?: (opt: { field: BaseField, path: string[], dependPath: string[], value: any }) => void
}

export interface BaseForm {
  /**
   * 唯一标识
   */
  id: string
  /**
   * 表达式可以读取到的上下文
   */
  scope: ExpressionScope
  /**
   * 表单是否挂载完成
   */
  mounted: Ref<boolean>
  /**
   * 表单项依赖仓库
   */
  dependStore: DependStore
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
  getFieldValue: (path: Path) => any
  /**
   * 获取全部或者部分路径字段的值
   * @example
   * ```js
   * getFieldsValue() // 获取表单值
   * getFieldsValue(true) // 获取完整的值，包含被隐藏的和 setFieldsValue 设置进去的值
   * getFieldsValue(['name','age','list[0].a',['list','0','a']]) // 获取指定路径字段的值
   * ```
   */
  getFieldsValue: (paths?: Array<Path> | true) => Record<string, any>
  /**
   * 设置指定路径字段的值
   */
  setFieldValue: (path: Path, value: any) => void
  /**
   * 设置一组值
   */
  setFieldsValue: (values: Record<string, any>, strategy?: ValueMergeStrategy) => void
  /**
   * 重置指定路径字段的值
   */
  resetFieldValue: (path: Path) => void
  /**
   * 重置所有字段的值
   */
  resetFieldsValue: () => void
  /**
   * 设置指定路径字段的初始值
   */
  setInitialValue: (path: Path, value: any) => void
  /**
   * 设置一组初始值
   */
  setInitialValues: (values: Record<string, any>, strategy?: ValueMergeStrategy) => void
  /**
   * 获取全部表单值，不包含被隐藏的和设置过的（被 transform 处理过的）
   */
  getFieldsTransformedValue: () => Record<string, any>
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
  /**
   * 通知字段值发生变化，内部使用
   */
  triggerFieldValueChange: EventHookTrigger<{
    field: BaseField
    value: any
  }>
}
