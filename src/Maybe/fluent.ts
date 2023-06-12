import { Async, wrap as wrapA } from "../Async/fluent"
import { Either, wrap as wrapE } from "../Either/fluent"
import { getVariant } from "../_internals/symbols"
import { ThenableOf } from "../_internals/types"
import * as M from "./index"

const Conversions = [
    "toAsync", "toEither"
]

const NullaryOperators = [
    "isJust", "isNone", "get", "show",
    "toThenable", "toPromise",
]

const Operators = [
    ...NullaryOperators, ...Conversions,
    "fold", "match", "map", "chain", "tap", "mapTo", 
    "zipWith", "zip", "zipLeft", "zipRight",
    "unwrap"
]

export interface Maybe<A> {
    isJust(): boolean
    isNone(): boolean
    get(): A | undefined
    fold<L,R>(onNone: () => L, onJust: (data: A) => R): L | R
    match<B,C>(pattern: M.Pattern<A,B,C>): B | C
    show(): string
    map<B>(fn: (a: A) => B): Maybe<B>
    chain<B>(fn: (a: A) => Maybe<B>): Maybe<B>

    tap(fn: (a: A) => void): Maybe<A>
    mapTo<B>(constant: B): Maybe<B>

    zipWith<B,C>(other: Maybe<B>, fn: (a: A, b: B) => C): Maybe<C>
    zip<B>(other: Maybe<B>): Maybe<[A,B]>
    zipLeft<B>(other: Maybe<B>): Maybe<A>
    zipRight<B>(other: Maybe<B>): Maybe<B>

    toPromise(): Promise<Awaited<A>>
    toThenable(): ThenableOf<A, undefined>
    toEither(): Either<undefined, A>
    toAsync(): Async<unknown, undefined, A>

    /**
     * Returns the internal Maybe instance
     */
    unwrap(): M.Maybe<A>
}

const fluent = <T>(m: M.Maybe<T>) => {
    const proxy = new Proxy(m as unknown as Maybe<T>, {
        get<P extends keyof Maybe<T>>(target: any, p: P): any {
            if( typeof p === "symbol" ){
                if( p === Symbol.toPrimitive ){
                    return target
                }
                return target[p];
            }
            if( Operators.includes(p) ){

                if( p === "chain" ){
                    return <B>(fn: (a: T) => Maybe<B>) => {
                        const adapted = (a: T) => fn(a).unwrap()
                        return fluent(target['|>'](M.chain(adapted)));
                    }
                }

                if( p === "unwrap" ){
                    return () => target
                }

                if( p === "zipWith" ){
                    return <B,C>(other: Maybe<B>, fn: (a: T, b: B) => C ) => {
                        return fluent(target["|>"](M.zipWith(fn)(other.unwrap())))
                    }
                }

                if( ["zip", "zipLeft", "zipRight"].includes(p) ){
                    return <B>(other: Maybe<B>) => {
                        return fluent(target['|>']((M as any)[p](other.unwrap())));
                    }
                }

                if( Conversions.includes(p) ){
                    if( p === "toAsync" ){
                        return () => wrapA(M.toAsync(target))
                    }
                    if( p === "toEither" ){
                        return () => wrapE(M.toEither(target))
                    }
                }

                if( NullaryOperators.includes(p) ){
                    return () => {
                        return (M as any)[p](target);
                    }
                }

                return (...args: unknown[]) => {
                    const result: unknown = target["|>"]((M as any)[p](...args));
                    if(["Just", "None"].includes(getVariant(result) as unknown as string)){
                        return fluent(result as any)
                    }
                    return result;
                }
            }
        },
        has(target, p: keyof Maybe<T>) {
            return Operators.includes(p) || p in target
        }
    });
    return proxy;
}

export function wrap<A>(m: M.Maybe<A>){
    return fluent(m);
}

export function Just<A>(a: A){
    return fluent(M.Just(a))
}

export function None<A>(){
    return fluent(M.None<A>());
}

export function of<A>(a: A){
    return fluent(M.of(a));
}

export function from<A>(a: A){
    return fluent(M.from(a));
}

export function fromNullish<A>(a: A | null | undefined){
    return fluent(M.fromNullish(a));
}

export function fromFalsy<A>(a: A){
    return fluent(M.fromFalsy(a));
}

export function fromEmpty<A>(a: A[]){
    return fluent(M.fromEmpty(a));
}

export function fromCondition<A>(fn: (a: A) => boolean){
    return (a: A) => fn(a) ? Just(a) : None<A>();
}

export function fromBoolean(val: boolean){
    return fromCondition<boolean>(Boolean)(val)
}