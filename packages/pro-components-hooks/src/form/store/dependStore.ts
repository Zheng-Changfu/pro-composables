import { nextTick, onScopeDispose, toValue } from 'vue-demi'
import { isArray, isString } from 'lodash-es'
import type { BaseField } from '../field'
import type { PathPattern } from '../path'
import { convertPatternToMatchFn } from '../utils/path'
import type { FieldStore } from './fieldStore'

export type Dependencie = PathPattern

type Match = (path: string, paths: string[]) => boolean

interface MatchFn extends Match {
  field: BaseField
}

export class DependStore {
  public deps: Set<MatchFn>
  public shouldTrigger: boolean
  public fieldStore: FieldStore

  constructor(fieldStore: FieldStore) {
    this.deps = new Set()
    this.shouldTrigger = true
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
      const pattern = dep
      const matchFn = convertPatternToMatchFn(pattern) as MatchFn
      matchFn.field = field
      this.deps.add(matchFn)
    })
  }

  pauseDependenciesTrigger = () => {
    this.shouldTrigger = false
  }

  resumeDependenciesTrigger = () => {
    nextTick(() => {
      this.shouldTrigger = true
    })
  }

  matchDepend = (path: string, matchedFn: (dependPath: string[]) => void) => {
    if (!this.shouldTrigger)
      return
    const paths = this.fieldStore.fieldsPath.value
    this.deps.forEach((match) => {
      if (match(path, paths))
        matchedFn(match.field.path.value)
    })
  }
}

export function createDependStore(fieldStore: FieldStore) {
  return new DependStore(fieldStore)
}
