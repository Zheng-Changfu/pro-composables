type StringExpression = `{{${string}}}`
export type MaybeExpression<T> = T extends (infer U)[]
  ? (MaybeExpression<U>)[]
  : T extends object
    ? T extends RegExp
      ? T | StringExpression
      : { [K in keyof T]: MaybeExpression<T[K]> }
    : T | StringExpression

export type ExcludeExpression<T> = T extends (infer U)[]
  ? (ExcludeExpression<U>)[]
  : T extends object
    ? T extends RegExp
      ? T
      : { [K in keyof T]: ExcludeExpression<T[K]> }
    : T extends StringExpression
      ? never
      : T

export interface RuleItem {
  pattern?: RegExp
}
export type FormItemRule = RuleItem

type E = MaybeExpression<FormItemRule | FormItemRule[]>

function c(a: FormItemRule | FormItemRule[]) {
  console.log(a, 'a')
}

const e = {} as ExcludeExpression<E>
c(e)
