import type { createControlRef } from './createControlRef'
import type { Deps } from './deps'
import type { ArrayField, BaseField } from './field'
import type { InternalPath, Path } from './path'
import type { PathField } from './pathField'

export type Value = any
export type Store = Record<string, Value>

export interface FormOptions<Values = any> {
  /**
   * 表单初始值
   */
  initialValues?: Values
  /**
   * 表达式可以读取到的上下文
   */
  expressionContext?: Record<string, any>
  /**
   * 字段值发生变化后的回调
   */
  onFieldValueChange?: (opt: { field: BaseField | ArrayField, value: any }) => void
  /**
   * 依赖项发生变化后的回调
   * @param depPath 依赖项的路径
   * @param val 依赖项的值
   */
  onDependenciesChange?: (opt: { path: InternalPath, value: any }) => void
}

export interface BaseForm {
  id: string
  deps: Deps
  mounted: boolean
  pathField: PathField
  initialValues: Record<string, any>
  values: ReturnType<typeof createControlRef>
  getFieldValue: (path: Path) => any
  getFieldsValue: (paths?: Array<Path> | true) => Store
  setFieldValue: (path: Path, value: any) => void
  setFieldsValue: (values: Store) => void
  resetFieldValue: (path: Path) => void
  resetFieldsValue: () => void
  setInitialValue: (path: Path, value: any) => void
  setInitialValues: (values: Store) => void
}
