type StringExpression = `{{${string}}}`
export type MaybeExpression<T> = T extends (infer U)[]
  ? (MaybeExpression<U>)[]
  : T extends object
    ? { [K in keyof T]: MaybeExpression<T[K]> }
    : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? (ExcludeExpression<U>)[] // 递归处理数组项
  : T extends object
    ? { [K in keyof T]: ExcludeExpression<T[K]> } // 递归处理对象
    : T extends StringExpression
      ? Exclude<T, StringExpression>
      : T
