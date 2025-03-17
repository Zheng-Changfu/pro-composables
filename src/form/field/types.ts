import type { ComputedRef, Ref } from 'vue'
import type { InternalPath } from '../path'

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
  path?: Ref<InternalPath | undefined>
  /**
   * 是否显示
   */
  visible?: Ref<boolean | undefined>
  /**
   * 是否隐藏
   */
  hidden?: Ref<boolean | undefined>
  /**
   * 手动更新值（isList 为 true 时 无效）
   * @param fieldValue 表单值
   * @param inputValue 输入值
   */
  onInputValue?: (fieldValue: Ref<any>, inputValue: any, ...args: any[]) => void
  /**
   * 值变化后的回调(手动交互导致值的改变，isList 为 true 时 无效)
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
   * 字段值
   */
  value: Ref<T>
  /**
   * 是否显示
   * @default true
   */
  show: ComputedRef<boolean>
  /**
   * 更新值，内部不会使用，交给上层使用(为了区分是否为手动交互导致值的改变，而不是通过调用 api)
   */
  doUpdateValue: (val: T, ...args: any[]) => void
  /**
   * 值变化后的回调(手动交互导致值的改变)
   */
  onChange?: (val: T) => void
  /**
   * 是否正在手动交互状态中
   * @default false
   */
  touching: boolean
  /**
   * 用户传递进来的元信息
   */
  meta: FieldOptions
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

export type ArrayFieldAction<T = any> = Pick<
  ArrayField<T>,
  | 'pop'
  | 'push'
  | 'move'
  | 'shift'
  | 'moveUp'
  | 'insert'
  | 'remove'
  | 'unshift'
  | 'moveDown'
>
