import { Accessor } from "solid-js";

// Define the result type as a tuple of the original result and an error
export type Result<T> = [T, undefined] | [undefined, Error];

type Func = (...args: any) => any;

export function monad<T extends Func>(func: T, params: Parameters<T>): Result<ReturnType<T>> {
    try {
        const result = func(...params); // Call the original function
        return [result, undefined];     // Return the result and undefined for the error
    } catch (error: unknown) {
        // Handle the error and return undefined for the result and the error itself
        return [undefined, error instanceof Error ? error : new Error(String(error))];
    }
}
