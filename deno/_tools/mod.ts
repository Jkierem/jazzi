import { extractWith, getCaseSensitive, safeMatch, includes } from "../_internals/mod.ts";
import { AnyFn, AnyFnRec, Boxed, Unwrap } from "../_internals/types.ts";
import * as S from "../_internals/symbols.ts";
import type { Async } from "../Async/types.ts";

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

export const show = (x: { show: () => string }) => x.show()
export const fromEnum = <T extends { fromEnum: (e: any) => number }>(en: S.WithTypeRep<T>) => S.getTypeRep(en).fromEnum(en)
export const toEnum = <T>(en: { toEnum: (i: number) => T }, i: number) => en.toEnum(i)
export const succ = <T>(en: { succ: () => T }) => en.succ()
export const pred = <T>(en: { pred: () => T }) => en.pred()
export const next = <T>(en: { next: () => T }) => en.next()
export const previous = <T>(en: { previous: () => T }) => en.previous()
export const map = <A,B,T>(fn: (a: A) => B, obj: { map: (fn: (a: A) => B) => T}) => obj.map(fn);
export const fmap = <A,B,T>(fn: (a: A) => B, obj: { fmap: (fn: (a: A) => B) => T}) => obj.fmap(fn);

type Ap = { apply: (other: Ap) => Ap }
const _apImpl = (left: Ap, right: Ap) => left.apply(right);
export const ap = _apImpl
export const applyRight = _apImpl
export const applyLeft = (left: Ap, right: Ap) => right.apply(left)

export const join = <T>(monad: { join: () => T }) => monad.join();
export const flat = <T>(monad: { flat: () => T }) => monad.flat();
export const chain = <A,B,M>(fn: (a: A) => B, monad: { chain: (fn: (a: A) => B) => M}) => monad.chain(fn)
export const flatMap = <A,B,M>(fn: (a: A) => B, monad: { flatMap: (fn: (a: A) => B) => M}) => monad.flatMap(fn)
export const to = <A,T>(other: { natural: (a: A) => T } , nat: { to: (other: { natural: (a: A) => T }) => T}) => nat.to(other)

export const zip = <R0,R1,A0,A1>(left: Async<R0,A0>, right: Async<R1,A1>) => left.zip(right)
export const zipLeft = <R0,R1,A0,A1>(left: Async<R0,A0>, right: Async<R1,A1>) => left.zipLeft(right)
export const zipRight = <R0,R1,A0,A1>(left: Async<R0,A0>, right: Async<R1,A1>) => left.zipRight(right)
type ProvideArg<T> = T extends { provide: (r: infer R) => any } ? R : never
type ProvideReturn<T> = T extends { provide: (r: any) => infer R } ? R : never
export const provide = <T extends { provide: AnyFn }>(a: T, r: ProvideArg<T>): ProvideReturn<T> => a.provide(r)

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