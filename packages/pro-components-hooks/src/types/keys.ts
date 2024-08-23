type BrowerNaitveObject = File | Date | Blob | RegExp | FileList
type IsTuple<T extends Array<any>> = number extends T['length'] ? false : true
type Primitive = string | number | boolean | undefined | null | bigint | symbol

type PathImpl<K extends string | number, V> = V extends
  | Primitive
  | BrowerNaitveObject
  ? `${K}`
  : `${K}` | `${K}.${ExtractObjectPaths<V>}`

export type ExtractObjectPaths<O> = O extends Array<infer V>
  ? IsTuple<O> extends true
    ? PathImpl<Extract<keyof O, `${number}`>, V>
    : PathImpl<number, V>
  : {
      [K in keyof O]-?: PathImpl<Exclude<K, symbol>, O[K]>
    }[keyof O]
