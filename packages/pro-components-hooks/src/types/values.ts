import type { ExtractObjectPaths } from './keys'

export type ExtractPathValue<Values, Path extends ExtractObjectPaths<Values>> = any
