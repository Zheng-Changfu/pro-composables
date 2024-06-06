import { onScopeDispose } from 'vue-demi'
import { isArray, isString } from 'lodash-es'
import type { BaseForm, FormOptions } from './types'
import { normalizePathMatch, stringifyPath } from './utils/path'
import type { Dependencie } from './field'

export class Deps {
  private options!: FormOptions
  private depSet!: Set<(path: string, paths: string[]) => boolean>

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

  add = (deps: Dependencie | Dependencie[]) => {
    if (!isArray(deps))
      deps = [deps]
    deps.forEach((dep) => {
      const normalizedDep = this.normalizeDep(dep)
      this.depSet.add(normalizedDep)
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
        onDependenciesValueChange(params)
    })
  }
}
