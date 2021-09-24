import { getInnerValue, getVariant, InnerValue, TypeName, Variant, WithInnerValue, WithTypeName, WithVariant } from "./symbols";
import { Box, ExpandablePattern, Extractable, Pattern } from "./types";

export function getImpl<T>(this: WithInnerValue<T>){
    return getInnerValue(this)
}

export function unwrapImpl<T>(this: WithInnerValue<T>){
    const inner = getInnerValue(this);
    return (inner as any)?.unwrap?.() ?? inner
}

export function simpleMatchImpl<T, TName extends string, Cases extends string>(this: WithInnerValue<T> & WithVariant<TName> , pattern: Pattern<Cases>) {
    const variant = getVariant(this);
    const inner = getInnerValue(this)
    return pattern[variant]?.(inner) ?? pattern["default"]?.(inner) ?? pattern["_"]?.(inner) ?? undefined 
}

export function matchImpl<T, TName extends string>(this: WithInnerValue<T> & WithVariant<TName> , pattern: ExpandablePattern) {
    const variant = getVariant(this);
    const inner = getInnerValue(this)
    return pattern[variant]?.(inner) ?? pattern["default"]?.(inner) ?? pattern["_"]?.(inner) ?? undefined 
}

export function isImpl(vname: string){
    return function<T extends string>(this: WithVariant<T>){
        return getVariant(this) === vname
    }
}

export function onImpl<A>(vname: string){
    return function<B extends string,C>(this: WithInnerValue<A> & WithVariant<B>, fn: Extractable<C>){
        return getVariant(this) === vname 
            ? fn instanceof Function 
                ? fn()
                : fn
            : getInnerValue(this)
    }
}

export const autoImpls = {
    get: getImpl,
    unwrap: unwrapImpl,
    match: matchImpl,
    simpleMatch: simpleMatchImpl
}

export const buildSymbols = <TName extends string, VName extends string, Inner>(tname: TName, vname: VName, inner: Inner) => {
    return {
        [Variant]: vname,
        [TypeName]: tname,
        [InnerValue]: inner
    } as  WithInnerValue<Inner> & WithVariant<VName> & WithTypeName<TName>
}

export const BoxedBase = <TName extends string, Cases extends string, VName extends Cases, Inner>(
    tname: TName, 
    cases: readonly Cases[], 
    vname: VName,
    inner: Inner
): Box<TName, typeof cases[number], Inner> => {
    return {
        ...buildSymbols(tname, vname, inner),
        ...autoImpls,
        ...(cases).reduce((acc, next) => {
            (acc as any)[`on${next}`] = onImpl(next);
            (acc as any)[`is${next}`] = isImpl(next);
            return acc
        }, {}) as any
    }
}