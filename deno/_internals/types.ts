import { WithInnerValue, WithTypeName, WithTypeRep, WithVariant } from "./symbols.ts";

export type Extractable<A,Args extends any[] = []> = A | ((...args: Args) => A)

export type AnyFn = (...args: any[]) => any

export type AnyFnRec = Record<string, AnyFn>

export type AnyRec = Record<string | symbol | number, any>

export type AnyConst = new (...args: any[]) => any

export type AnyConstRec = Record<string, new (...args: any[]) => any>

export type Key = string | number | symbol

export type Nil = null | undefined

export type MapFn<A,B> = (a: A) => B

export type NonEmptyArray<T> = [T, ...T[]];

export type Tuple<T0,T1> = [T0, T1]

export type Tuple2<T0,T1> = [T0, T1]

export type Tuple3<T0,T1,T2> = [T0, T1, T2]

export type Pattern<Cases extends string> = {
    [P in Cases]?: AnyFn
} & {
    [P in Cases as Lowercase<P>]?: AnyFn
} & {
    default?: AnyFn,
    _?: AnyFn
}

export type ExpandablePattern = {
    [P: string]: AnyFn
}

export type Unwrap<A> = A extends Boxed<infer B> ? Unwrap<B> : A 

export interface Boxed<A, TRep=any> 
extends WithTypeName<string>
, WithVariant<string>
, WithInnerValue<A>
, WithTypeRep<TRep>
{
    get: () => A,
    unwrap: () => Unwrap<A>
}

export interface Matcher<Cases extends string> {
    match(pattern: ExpandablePattern): unknown
    variantMatch(pattern: Pattern<Cases>): unknown
}

export interface MatcherRep<Cases extends string> { 
    /**
     * Type matches using the variant name.
     * Receives an object where the types are the keys and computations are values
     * @param {Match} patterns
     */
    match<A>(fa: A, patterns: Pattern<Cases>): any; 
}

export type AnyBoxed = Boxed<any>