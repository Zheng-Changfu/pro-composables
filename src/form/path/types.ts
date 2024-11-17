export type InternalPath = string | string[]
export type PathPattern = string | RegExp | ((path: string, paths: string[]) => boolean)
