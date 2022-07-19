import { extractWith, getCaseSensitive, safeMatch, includes } from "../_internals/mod.ts";

import { AnyFnRec, Boxed, Unwrap } from "../_internals/types.ts";

import * as S from "../_internals/symbols.ts";


/**
 * Type match a value
 * @param {{ match: (cases: any) => any }} value
 * @param {any} cases
 */
export const match = <T>(value: Boxed<T>, cases?: AnyFnRec) => cases === undefined ? (cases: AnyFnRec) => safeMatch(value,cases) : safeMatch(value,cases)
/**
 * Calls unwrap on the given object
 * @param {{ unwrap: () => any }} x 
 */
export const unwrap = <T>(x: Boxed<T>): Unwrap<T> => x.unwrap()
/**
 * Returns variant name of the given value
 * @param {any} v 
 */
export const getTag = S.getVariant
export const getVariant = S.getVariant
/**
 * Returns the name of the union this value belongs to
 * @param {any} v 
 * @returns {string} TypeName
 */
export const getTypeName = S.getTypeName
/**
 * Returns the type representative of this value
 * @param {any} v 
 * @returns Type representative
 */
export const getTypeRep = S.getTypeRep
/**
 * Returns true if value implements the provided typeclass or typeclass name
 * @param {any} value
 * @param {any} typeclass 
 */
export const hasInstance = (tc: any, x: any) => includes(S.getTypeclass(tc) || tc, (S.getTypeclasses(x) as any)?.() || [])
export const foldMap = <A,T extends { concat: (other: T) => T } >(t: { empty: () => T, of: (a: A) => T }, values: A[]) => values.reduce((acc,next) => acc.concat(t.of(next)) , t.empty())

export const show = <A>(x: { show: () => A }) => x.show()
export const toString = (x: { toString: () => string }) => x.toString()

export const stringSwitch = (str: string, _patt: AnyFnRec) => {
    return extractWith([])(getCaseSensitive(str,_patt))
}

export const stringMatcher = (str: string) => {
    return {
        match: (patterns: AnyFnRec) => {
            return extractWith([])(getCaseSensitive(str,patterns));
        }
    }
}

export const lessThan = (l: any, r: any): boolean => {
    if( hasInstance("Ord",l) && hasInstance("Ord",r) ){
        return (l as any).lessThan(r)
    }
    return l < r
}
export const greaterThan = (l: any, r: any): boolean => {
    if( hasInstance("Ord",l) && hasInstance("Ord",r) ){
        return (l as any).greaterThan(r)
    }
    return l > r
}
export const lessThanOrEqual = (l: any, r: any): boolean => {
    if( hasInstance("Ord",l) && hasInstance("Ord",r) ){
        return (l as any).lessThanOrEqual(r)
    }
    return l <= r
}
export const greaterThanOrEqual = (l: any, r: any): boolean => {
    if( hasInstance("Ord",l) && hasInstance("Ord",r) ){
        return (l as any).greaterThanOrEqual(r)
    }
    return l >= r
}