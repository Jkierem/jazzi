import type { Nil } from "./types.ts";


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

export const isNil = <A>(a: A | Nil): a is Nil => a === null || a === undefined 