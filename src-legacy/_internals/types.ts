import { WithInnerValue, WithTypeName, WithVariant } from "./symbols"

export type Extractable<A,Args extends any[] = []> = A | ((...args: Args) => A)

export type AnyFn = (...args: any[]) => any

export type AnyFnRec = Record<string, AnyFn>

export type AnyConst = new (...args: any[]) => any

export type AnyConstRec = Record<string, new (...args: any[]) => any>

export type Key = string | number | symbol

export type Nil = null | undefined

export type MapFn<A,B> = (a: A) => B

export type NonEmptyArray<T> = [T, ...T[]];

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

type Unwrap<A> = A extends Boxed<infer B> ? Unwrap<B> : A 
export interface Boxed<A> 
extends WithTypeName<string>
, WithVariant<string>
, WithInnerValue<A>
{
    get: () => A,
    match: (pattern: any) => any,
    unwrap: () => Unwrap<A>
}

export type AnyBoxed = Boxed<any>