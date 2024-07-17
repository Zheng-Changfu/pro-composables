export type Path = string | InternalPath
export type InternalPath = Array<string | number>
export type PathPattern = string | RegExp | ((path: string, paths: string[]) => boolean)
