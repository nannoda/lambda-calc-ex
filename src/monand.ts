// Define the result type as a tuple of the original result and an error
export type Result<T> = [T, undefined] | [undefined, Error];

export function monad<T extends Function>(func: T,) {

}