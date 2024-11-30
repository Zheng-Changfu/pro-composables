import { isNil, isPlainObject } from 'lodash-es'

export function omitNil(values: any): any {
  if (Array.isArray(values)) {
    return values.map(omitNil)
  }
  else if (isPlainObject(values)) {
    return Object.entries(values).reduce((acc, [key, value]) => {
      const cleanedValue = omitNil(value)
      if (!isNil(cleanedValue)) {
        acc[key] = cleanedValue
      }
      return acc
    }, {} as any)
  }
  return values
}
