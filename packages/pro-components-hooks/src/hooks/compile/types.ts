type StringExpression = `{{${string}}}`
type IsString<T> = T extends string ? true : false
type IsSpecialObject<T> = T extends RegExp | Date | Function | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any>
  ? true
  : false

export type MaybeExpression<T> = T extends (infer U)[]
  ? (MaybeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T | StringExpression
    : IsString<T> extends true
      ? T | StringExpression
      : T extends object
        ? { [K in keyof T]: MaybeExpression<T[K]> }
        : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? (ExcludeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T
    : IsString<T> extends true
      ? T
      : T extends object
        ? { [K in keyof T]: ExcludeExpression<T[K]> }
        : T extends StringExpression
          ? never
          : T
