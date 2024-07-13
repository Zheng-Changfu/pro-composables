import type { createControlRef } from '../hooks/createControlRef'
import type { Deps } from './deps'
import type { ArrayField, BaseField, ExpressionScope, PathMatch } from './field'
import type { Path } from './path'
import type { PathField } from './pathField'

export type Value = any
export type Store = Record<string, Value>

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
   * @param path 被依赖项的路径
   * @param depPath 依赖项的路径
   * @param val 依赖项的值
   */
  onDependenciesValueChange?: (opt: { path: string[], depPath: string[], value: any }) => void
}

export interface BaseForm {
  /**
   * 唯一标识
   */
  id: string
  /**
   * 所有的表单项依赖
   */
  deps: Deps
  /**
   * 表达式可以读取到的上下文
   */
  scope: ExpressionScope
  /**
   * 表单是否挂载完成
   */
  mounted: boolean
  /**
   * 所有的表单项路径
   */
  pathField: PathField
  /**
   * 表单初始值
   */
  initialValues: Record<string, any>
  /**
   * 表单的值
   */
  values: ReturnType<typeof createControlRef>
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
  getFieldsValue: (paths?: Array<Path> | true) => Store
  /**
   * 设置指定路径字段的值
   */
  setFieldValue: (path: Path, value: any) => void
  /**
   * 设置一组值
   */
  setFieldsValue: (values: Store) => void
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
  setInitialValues: (values: Store) => void
  /**
   * 获取全部表单值，不包含被隐藏的和设置过的（被 transform 处理过的）
   */
  getFieldsTransformedValue: () => Store
  /**
   * 匹配路径
   * @returns 返回匹配到的路径数组
   */
  matchPath: (pathMatch: PathMatch) => string[]
}
