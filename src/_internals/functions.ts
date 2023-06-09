import { WithVariant, getValue, getVariant } from "./symbols"
import type { Extractable, Key, Nil, Primitive } from "./types"

export const equals = (a: any, b: any): boolean => {
    const typeA = typeof a
    const typeB = typeof b
    if( typeA !== typeB || typeA === "function" || typeB === "function" ){
        return false
    }
    if( typeA === "object" ){
        if( a === b ){
            return true
        }
        if( typeof a?.equals === "function" ){
            return a.equals(b)
        }
        if( typeof b?.equals === "function" ){
            return b.equals(a)
        }
        if( Array.isArray(a) && Array.isArray(b) ){
            return a.every((_a, idx) => equals(_a, b[idx]))
        }
        if( 
            (Array.isArray(a) && !Array.isArray(b)) ||
            (!Array.isArray(a) && Array.isArray(b)) 
        ){
            return false
        }
        const setAB = new Set([...Object.keys(a), ...Object.keys(b)])
        return Array.from(setAB).every(key => equals(a[key], b[key]))
    }
    return a === b
}

export const empty = <T>(what: T): T | undefined => {
    const anyWho = what as any
    const typ = typeof anyWho
    if( typeof anyWho?.empty === "function" ){
        return anyWho.empty() as T
    } else if( typeof anyWho?.constructor?.empty === "function" ){
        return anyWho.constructor.empty() as T
    } else if( Array.isArray(what) ){
        return [] as unknown as T
    } else if( typ === "string" ) {
        return "" as unknown as T
    } else if( typ === "object" ) {
        return {} as T
    }
}

export const isEmpty = (what: any): boolean => equals(what, empty(what))

export const identity = <T>(x: T) => x

export function pass<T>(this: T){ return this }

export const compose2 = <A,B,C>(fn0: (b: B) => C, fn1: (...args: A[]) => B) => (...args: A[]): C => fn0(fn1(...args))

export const merge = <A,B>(a: A, b: B): A & B => ({ ...a, ...b })

export const prop = <K extends string | number | symbol>(key: K) => <T>(obj: T): K extends keyof T ? T[K] : undefined => (obj as any)?.[key]

export const propOr = <T, K extends keyof T>(or: NonNullable<T[K]>, key: K, obj: T) => prop(key)(obj) ?? or

export const assoc = <T, K extends keyof T>(key: K, value: T[K], obj: T): T => ({ ...obj, [key]: value })

export const extractWith = <Args extends any[]>(args: Args) => <T>(ext: Extractable<T,Args>): T => ext instanceof Function ? ext(...args) : ext;

export const extract = extractWith([])

export const isNil = <A>(a: A | Nil): a is Nil => a === null || a === undefined 

export const isNotNil = <A>(a: A | Nil): a is A => !isNil(a)

export const coerce = <T,U>(a: T): U => a as unknown as U

export const isFunction = (x: any): x is Function => typeof x === "function"

export const makeTuple = <A,B>(a: A, b: B): [A,B] => [a,b];

export const isPrimitive = (a: any): a is Primitive => typeof a !== "object" && typeof a !== "function"

export const match = <V extends Key, T extends WithVariant<V>>(
    pattern: Record<V, (...args: any[]) => any>) => 
    (self: T) => pattern[getVariant(self)](getValue(self))