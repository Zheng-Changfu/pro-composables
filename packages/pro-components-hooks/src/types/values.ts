import type { ExtractObjectPaths } from './keys'

export type ExtractPathValue<Values, Path extends ExtractObjectPaths<Values> | any> = Path extends `${infer A}.${infer B}`
  ? A extends keyof Values
    ? ExtractPathValue<Values[A], B>
    : A extends `${number}`
      ? Values extends Array<any>
        ? ExtractPathValue<Values[number], B> | undefined
        : never
      : never
  : Path extends keyof Values
    ? Values[Path] | undefined
    : never
