import { WithInnerValue, WithTypeName, WithVariant } from "./symbols"

export type Extractable<A,Args extends any[] = []> = A | ((...args: Args) => A)

export type AnyFn = (...args: any[]) => any

export type AnyConst = new (...args: any[]) => any

export type Key = string | number | symbol

export type Nil = null | undefined

type Unwrap<A> = A extends Box<any, any, infer B> ? Unwrap<B> : A

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

export type Box<
    TName extends string,
    Cases extends string,
    A
> = 
& WithTypeName<TName>
& WithVariant<Cases>
& WithInnerValue<A>
& {
    get: () => A,
    unwrap: () => Unwrap<A>,
    simpleMatch: (pattern: Pattern<Cases>) => any,
    match: (pattern: ExpandablePattern) => any
} & {
    [P in Cases as `on${Capitalize<string & P>}`]: <B>(b: Extractable<B>) => A | B
} & {
    [P in Cases as `is${Capitalize<string & P>}`]: () => boolean
}

export type AnyBox = Box<any,any,any>
export type Boxed<A> = Box<any,any,A>
export type Union<Cases extends string> = Box<any, Cases, any>
export type Family<TName extends string> = Box<TName,any,any>

export type InnerValueOf<T> = T extends Boxed<infer A> ? A : never
export type FamilyOf<T> = T extends Family<infer A> ? A : never
export type CasesOf<T> = T extends Union<infer A> ? A : never

export type Relative<Fam extends Family<any>, Inner> = Box<FamilyOf<Fam>, CasesOf<Fam>, Inner>