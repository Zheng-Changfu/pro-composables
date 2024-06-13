import { onScopeDispose } from 'vue-demi'
import { isArray, isString } from 'lodash-es'
import type { BaseForm, FormOptions } from './types'
import { normalizePathMatch, stringifyPath } from './utils/path'
import type { BaseField, Dependencie } from './field'

type DepMatch = (path: string, paths: string[]) => boolean
interface DepMatchFn extends DepMatch {
  field: BaseField
}
export class Deps {
  private options!: FormOptions
  private depSet!: Set<DepMatchFn>

  constructor(options: FormOptions) {
    this.options = options
    this.initialize()
  }

  initialize = () => {
    this.depSet = new Set()
    onScopeDispose(() => {
      this.depSet.clear()
    })
  }

  private normalizeDep = (dep: Dependencie) => {
    const pathMatch = isString(dep) ? dep : dep.match
    return normalizePathMatch(pathMatch)
  }

  add = (field: BaseField) => {
    let deps = field.dependencies
    if (!isArray(deps))
      deps = [deps]
    deps.forEach((dep) => {
      const normalizedDep = this.normalizeDep(dep) as any
      normalizedDep.field = field
      this.depSet.add(normalizedDep as DepMatchFn)
    })
  }

  notify = (form: BaseForm, path: string[], params: any) => {
    const onDependenciesValueChange = this.options.onDependenciesValueChange
    if (!onDependenciesValueChange)
      return
    const sp = stringifyPath(path)
    const paths = form.pathField.keys()
    this.depSet.forEach((match) => {
      if (match(sp, paths))
        onDependenciesValueChange({ ...params, depPath: match.field.path.value })
    })
  }
}
