import type { ComputedRef, Ref } from 'vue-demi'
import type { Path } from '../path'

export interface FieldOptions<T = any> {
  /**
   * 初始值
   */
  initialValue?: T
  /**
   * 当字段被隐藏时是否保留字段值
   * @default true
   */
  preserve?: boolean
  /**
   * 字段路径
   */
  path?: Ref<Path>
  /**
   * 字段值
   */
  value?: Ref<T>
  /**
   * 是否显示
   * @default true
   */
  visible?: Ref<boolean>
  /**
   * 是否隐藏
   * @default false
   */
  hidden?: Ref<boolean>
  /**
   * 字段关联的依赖项
   */
  dependencies?: string[]
  /**
   * 后置状态钩子，可以二次修改值
   */
  postState?: (val: T) => T
  /**
   * 值变化后的回调
   */
  onChange?: (val: T) => void
}

export interface BaseField<T = any> {
  /**
   * 唯一id
   */
  id: string
  /**
   * 父级 field
   */
  parent: ArrayField | null
  /**
   * 字段路径
   */
  path: ComputedRef<string[]>
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
  dependencies: string[]
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
   * 后置状态钩子，可以二次修改值
   */
  postState?: (val: T) => T
  /**
   * 值变化后的回调
   */
  onChange?: (val: T) => void
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
