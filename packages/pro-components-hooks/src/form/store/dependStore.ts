import type { MaybeRefOrGetter } from 'vue-demi'
import { onScopeDispose, toValue } from 'vue-demi'
import { isArray, isString } from 'lodash-es'
import type { BaseField } from '../field'
import type { PathPattern } from '../path'
import { convertPatternToMatchFn } from '../utils/path'
import type { FieldStore } from './fieldStore'

export type Dependencie = string | InternalDependencie

export interface InternalDependencie {
  pattern: PathPattern
  /**
   * 当依赖值发生变化后，触发拦截器，当拦截器通过后，onDependenciesChange 才会触发
   */
  guard?: MaybeRefOrGetter<boolean>
}

type Match = (path: string, paths: string[]) => boolean

interface MatchFn extends Match {
  field: BaseField
  guard: MaybeRefOrGetter<boolean>
}

export class DependStore {
  public deps: Set<MatchFn>
  public fieldStore: FieldStore

  constructor(fieldStore: FieldStore) {
    this.deps = new Set()
    this.fieldStore = fieldStore

    onScopeDispose(() => {
      this.deps.clear()
    })
  }

  add = (field: BaseField) => {
    const deps = isArray(field.dependencies)
      ? field.dependencies
      : [field.dependencies]

    deps.forEach((dep) => {
      const pattern = isString(dep) ? dep : dep.pattern
      const matchFn = convertPatternToMatchFn(pattern) as MatchFn
      matchFn.field = field
      matchFn.guard = (dep as any).guard ?? true
      this.deps.add(matchFn)
    })
  }

  matchDepend = (path: string, matchedFn: (dependPath: string[]) => void) => {
    const paths = this.fieldStore.fieldsPath.value
    this.deps.forEach((match) => {
      if (
        match(path, paths)
        && toValue(match.guard)
      )
        matchedFn(match.field.path.value)
    })
  }
}

export function createDependStore(fieldStore: FieldStore) {
  return new DependStore(fieldStore)
}
