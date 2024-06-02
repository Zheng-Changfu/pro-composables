import { onScopeDispose } from 'vue-demi'
import { isString } from 'lodash-es'
import type { FormOptions } from './types'
import { stringifyPath, toRegexp } from './utils/path'

export class Deps {
  private options!: FormOptions
  private depSet!: Set<string>
  private cache!: Map<string, RegExp>

  constructor(options: FormOptions) {
    this.options = options
    this.initialize()
  }

  add = (deps: string | string[]) => {
    if (isString(deps))
      deps = [deps]

    deps.forEach((dep) => {
      // this.cache.set(dep,)
      this.depSet.add(dep)
    })
  }

  delete = (deps: string | string[]) => {
    if (isString(deps))
      deps = [deps]
    deps.forEach((dep) => {
      this.cache.delete(dep)
      this.depSet.delete(dep)
    })
  }

  initialize = () => {
    this.cache = new Map()
    this.depSet = new Set()
    onScopeDispose(() => {
      this.cache.clear()
      this.depSet.clear()
    })
  }

  notify = (path: string[], params: any) => {
    const sp = stringifyPath(path)
    const onDependenciesChange = this.options.onDependenciesChange
    if (!onDependenciesChange)
      return
    this.depSet.forEach((key) => {
      if (!this.cache.has(key))
        this.cache.set(key, toRegexp(key))
      const reg = this.cache.get(key)!
      if (reg.test(sp))
        onDependenciesChange(params)
    })
  }
}
