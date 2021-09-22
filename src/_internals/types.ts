import { WithInnerValue, WithTypeName, WithVariant } from "./symbols"

export type Extractable<A,Args extends any[] = []> = A | ((...args: Args) => A)

export type AnyFn = (...args: any[]) => any

export type Key = string | number | symbol

type Unwrap<A> = A extends Boxed<infer B, any, any> ? Unwrap<B> : A

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

export type Boxed<
    A,
    TName extends string,
    Cases extends string
> = WithTypeName<TName>
& WithInnerValue<A>
& WithVariant<Cases>
& {
    get: () => A,
    unwrap: () => Unwrap<A>,
    simpleMatch: (pattern: Pattern<Cases>) => any,
    match: (pattern: ExpandablePattern) => any
} & {
    [P in Cases as `on${Capitalize<P>}`]: <B>(b: Extractable<B>) => A | B
} & {
    [P in Cases as `is${Capitalize<P>}`]: () => boolean
}