import type { ComputedRef, Ref } from 'vue-demi'
import type { Path } from '../path'
import type { MaybeExpression } from '../../hooks'

export type ExpressionScope = Record<string, any>

export interface FieldOptions<T = any> {
  /**
   * 初始值
   */
  initialValue?: T
  /**
   * 默认值，优先级最低
   */
  defaultValue?: T
  /**
   * 当字段被隐藏时是否保留字段值
   * @default true
   */
  preserve?: boolean
  /**
   * 字段路径
   */
  path?: Ref<Path | undefined>
  /**
   * 字段值，支持表达式
   */
  value?: Ref<T>
  /**
   * 表达式可以读取到的上下文
   */
  scope?: ExpressionScope
  /**
   * 是否显示，支持表达式
   */
  visible?: Ref<MaybeExpression<boolean | undefined>>
  /**
   * 是否隐藏，支持表达式
   */
  hidden?: Ref<MaybeExpression<boolean | undefined>>
  /**
   * 字段关联的依赖项
   */
  dependencies?: Dependencie | Dependencie[]
  /**
   * 转换字段的值，通过 getFieldsTransformedValue 可触发
   * @param val 当前字段的值
   * @param path 当前字段的路径
   * @returns 新的值,如果返回的是一个对象，将和当前字段所在层级的对象进行深度合并(lodash-es merge)
   * @example
   * ```js
   * // key:['a','b']} => key:'a,b'
   * transform:val => val.join()
   * // b:val => a:val
   * transform:val => ({a:val})
   * // date:[startDate,endDate] => {startDate,endDate}
   * transform:val => ({startDate:val[0],endDate:val[1]})
   * ```
   */
  transform?: (val: T, path: string) => any
  /**
   * 后置状态钩子，可以二次修改值
   */
  postState?: (val: T) => T
  /**
   * 值变化后的回调
   */
  onChange?: (val: T) => void
  /**
   * 用户自定义挂载进去的属性必须以 x- 开头
   */
  [key: `x-${string}`]: any
}

export interface BaseField<T = any> {
  /**
   * 唯一id
   */
  id: string
  /**
   * 字段索引
   */
  index: ComputedRef<number>
  /**
   * 父级 field
   */
  parent: ArrayField | null
  /**
   * 字段路径
   */
  path: ComputedRef<string[]>
  /**
   * 字段路径（字符串格式）
   */
  stringPath: ComputedRef<string>
  /**
   * 当字段被卸载或者隐藏时是否保留字段值
   * @default true
   */
  preserve: boolean
  /**
   * 是否为列表
   */
  isList: boolean
  /**
   * 是否为列表中的路径
   */
  isListPath: boolean
  /**
   * 是否在更新中
   */
  updating: boolean
  /**
   * 字段值
   */
  value: Ref<T>
  /**
   * 是否显示
   * @default true
   */
  show: ComputedRef<boolean>
  /**
   * 表达式可以读取到的上下文
   */
  scope: ExpressionScope
  /**
   * 表单控件的属性
   */
  fieldProps: ComputedRef<Record<string, any>>
  /**
   * formItem 控件的属性
   */
  formItemProps: ComputedRef<Record<string, any>>
  /**
   * 字段关联的依赖项
   */
  dependencies: Dependencie | Dependencie[]
  /**
   * 更新值
   */
  doUpdateValue: (val: T) => void
  /**
   * 设置表单控件的属性
   */
  doUpdateFieldProps: (props: Record<string, any>) => void
  /**
   * 设置 formItem 控件的属性
   */
  doUpdateFormItemProps: (props: Record<string, any>) => void
  /**
   * 转换字段的值，通过 getFieldsTransformedValue 可触发
   */
  transform?: (val: T, path: string) => any
  /**
   * 后置状态钩子，可以二次修改值
   */
  postState?: (val: T) => T
  /**
   * 值变化后的回调
   */
  onChange?: (val: T) => void
  /**
   * 用户自定义挂载进去的属性必须以 x- 开头
   */
  [key: `x-${string}`]: any
}

export interface ArrayField<T = any> extends BaseField<T[]> {
  /**
   * 尾部追加数据
   */
  push: (...items: T[]) => void
  /**
   * 弹出尾部数据
   */
  pop: () => void
  /**
   * 指定位置插入数据
   */
  insert: (index: number, ...items: T[]) => void
  /**
   * 删除指定位置数据
   */
  remove: (index: number) => void
  /**
   * 弹出第一条数据
   */
  shift: () => void
  /**
   * 头部追加数据
   */
  unshift: (...items: T[]) => void
  /**
   * 移动数据
   */
  move: (from: number, to: number) => void
  /**
   * 上移数据
   */
  moveUp: (index: number) => void
  /**
   * 下移数据
   */
  moveDown: (index: number) => void
}

export type Dependencie = string | InternalDependencie
export type PathMatch = string | RegExp | ((path: string, paths: string[]) => boolean)

export interface InternalDependencie {
  match: PathMatch
}
