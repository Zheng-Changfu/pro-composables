import type { ComputedRef, Ref } from 'vue-demi'
import type { EventHookOn } from '@vueuse/core'
import type { Get, PartialDeep } from 'type-fest'
import type { InternalPath } from '../path'
import type { Dependencie } from '../store/dependStore'
import type { StringKeyof } from '../../utils/types'
import type { ValueMergeStrategy } from '../utils/value'

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
  path?: Ref<InternalPath | undefined>
  /**
   * 字段值
   */
  value?: Ref<T>
  /**
   * 是否显示
   */
  visible?: Ref<boolean | undefined>
  /**
   * 是否隐藏
   */
  hidden?: Ref<boolean | undefined>
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
  postValue?: (val: T) => T
  /**
   * 手动更新值
   * @param fieldValue 表单值
   * @param inputValue 输入值
   */
  onInputValue?: (fieldValue: Ref<any>, inputValue: any, ...args: any[]) => void
  /**
   * 值变化后的回调(手动交互导致值的改变)
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
   * 列表是否在更新中(只针对 ArrayField)
   */
  updating: boolean
  /**
   * 字段值
   */
  value: Ref<T>
  /**
   * 用户传递的 value
   */
  propValue: Ref<T> | undefined
  /**
   * 是否显示
   * @default true
   */
  show: ComputedRef<boolean>
  /**
   * 字段关联的依赖项
   */
  dependencies: Dependencie | Dependencie[]
  /**
   * 更新值，内部不会使用，交给上层使用(为了区分是否为手动交互导致值的改变，而不是通过调用 api)
   */
  doUpdateValue: (val: T, ...args: any[]) => void
  /**
   * 转换字段的值，通过 getFieldsTransformedValue 可触发
   */
  transform?: (val: T, path: string) => any
  /**
   * 后置状态钩子，可以二次修改值
   */
  postValue?: (val: T) => T
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
  /**
   * 列表发生了动作后触发的回调
   */
  onActionChange: EventHookOn<ArrayFieldActionName>
  /**
   * 获取行数据，未获取到返回空对象
   * @param index 行索引
   */
  get: <Path extends InternalPath = StringKeyof<T>>(index: number, path: Path) => Get<T, Path>
  /**
   * 设置行数据，是一个重载函数
   * @example
   * ```js
   * set(0,{name:'zcf',age:1}) // 覆盖第1行数据
   * set(0,{name:'zcf',age:1},'shallowMerge') // 和第1行数据浅合并
   * set(0,{name:'zcf',age:1},'merge') // 和第1行数据深度合并
   * set(0,'name','zcf') // 设置第1行数据的 'name' 值为 'zcf'
   * ```
   */
  set:
  & ((index: number, values: PartialDeep<T>, strategy?: ValueMergeStrategy) => void)
  & (<Path extends InternalPath = StringKeyof<T>>(index: number, path: Path, value: Get<T, Path>) => void)
}

export type ArrayFieldActionName = Extract<
  | 'get'
  | 'set'
  | 'pop'
  | 'move'
  | 'push'
  | 'shift'
  | 'remove'
  | 'moveUp'
  | 'insert'
  | 'unshift'
  | 'moveDown',
  keyof ArrayField
>

export type ArrayFieldAction<T = any> = Pick<
  ArrayField<T>,
  | 'get'
  | 'set'
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
