type StringExpression = `{{${string}}}`
// eslint-disable-next-line unused-imports/no-unused-vars
type IsTuple<T> = T extends [infer A, ...infer B] ? true : false

type IsSpecialObject<T> = T extends RegExp | Date | Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>
  ? true
  : false

export type MaybeExpression<T> = T extends (infer U)[]
  ? IsTuple<T> extends true
    ? { [K in keyof T]: MaybeExpression<T[K]> }
    : (MaybeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T | StringExpression
    : T extends object
      ? { [K in keyof T]: MaybeExpression<T[K]> }
      : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? IsTuple<T> extends true
    ? { [K in keyof T]: ExcludeExpression<T[K]> }
    : (ExcludeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T
    : T extends object
      ? { [K in keyof T]: ExcludeExpression<T[K]> }
      : T extends StringExpression
        ? never
        : T
