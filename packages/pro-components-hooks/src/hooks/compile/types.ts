import type { CSSProperties, Ref } from 'vue-demi'

type StringExpression = `{{${string}}}`
type IsPlainString<T> = T extends string
  ? T extends StringExpression
    ? false
    : true
  : false

type IsNumber<T> = T extends number ? true : false
type IsBoolean<T> = T extends boolean ? true : false

type IsBasicType<T> = IsPlainString<T> extends true
  ? true
  : IsNumber<T> extends true
    ? true
    : IsBoolean<T> extends true
      ? true
      : false

type IsSpecialObject<T> = T extends
  | RegExp
  | Date
  | Function
  | Map<any, any>
  | Set<any>
  | WeakMap<any, any>
  | WeakSet<any>
  ? true
  : false

export type MaybeExpression<T> = T extends (infer U)[]
  ? (MaybeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T | StringExpression
    : IsBasicType<T> extends true
      ? T | StringExpression
      : T extends object
        ? { [K in keyof T]: MaybeExpression<T[K]> }
        : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? (ExcludeExpression<U>)[]
  : IsSpecialObject<T> extends true
    ? T
    : IsBasicType<T> extends true
      ? T
      : T extends object
        ? { [K in keyof T]: ExcludeExpression<T[K]> }
        : T extends StringExpression
          ? never
          : T

// eslint-disable-next-line ts/ban-types
export type AnimationIterationCount = 'infinite' | (string & {}) | (number & {})

function t(t: AnimationIterationCount) {
  console.log(t)
}
t({} as any as ExcludeExpression<MaybeExpression<AnimationIterationCount>>)
