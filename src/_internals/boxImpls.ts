import { getInnerValue, getVariant, WithInnerValue, WithVariant } from "./symbols";
import { ExpandablePattern, Extractable, Pattern } from "./types";

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