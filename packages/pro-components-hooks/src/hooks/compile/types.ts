type StringExpression = `{{${string}}}`
type IsPlainString<T> = T extends string
  ? T extends StringExpression
    ? false
    : true
  : false

type IsSpecialObject<T> = T extends RegExp | Date | Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>
  ? true
  : false

export type MaybeExpression<T> = T extends (infer U)[]
  ? (MaybeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T | StringExpression
    : IsPlainString<T> extends true
      ? T | StringExpression
      : T extends object
        ? { [K in keyof T]: MaybeExpression<T[K]> }
        : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? (ExcludeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T
    : IsPlainString<T> extends true
      ? T
      : T extends object
        ? { [K in keyof T]: ExcludeExpression<T[K]> }
        : T extends StringExpression
          ? never
          : T
