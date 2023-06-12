// deno-lint-ignore-file no-explicit-any
import { Maybe, wrap as wrapM } from "../Maybe/fluent.ts";

import { AsyncIO, wrap as wrapA } from "../Async/fluent.ts";

import { ThenableOf } from "../_internals/types.ts";

import * as E from "./mod.ts";
import { getVariant } from "../_internals/symbols.ts";


export interface Either<L,R> {
    isRight(): boolean,
    isLeft(): boolean,
    get(): L | R,
    getOr<B>(or: () => B): B | R,
    getLeftOr<B>(or: () => B): B | L,
    fold<L0,R0>(onLeft: (l: L) => L0, onRight: (r: R) => R0): L0 | R0,
    swap(): Either<R,L>
    map<B>(fn: (r: R) => B): Either<L,B>
    chain<L0,R0>(fn: (r: R) => Either<L0, R0>): Either<L0 | L, R0>
    mapLeft<B>(fn: (l: L) => B): Either<B, R>
    mapTo<B>(b: B): Either<L,B>
    mapLeftTo<B>(b: B): Either<B, R>
    match<A,B>({ Left, Right }: E.Pattern<L,R,A,B>): A | B
    show(): string
    tap(fn: (r: R) => void): Either<L,R>
    zipWith<L0,R0,C>(other: Either<L0,R0>, fn: (a: R, b: R0) => C): Either<L0 | L, C>
    zip<L0,R0>(other: Either<L0,R0>): Either<L0 | L, [R, R0]>
    zipLeft<L0,R0>(other: Either<L0,R0>): Either<L0 | L, R>
    zipRight<L0,R0>(other: Either<L0,R0>): Either<L0 | L, R0>
    toPromise(): Promise<R>
    toThenable(): ThenableOf<R,L>
    toMaybe(): Maybe<R>
    toAsync(): AsyncIO<L,R>
    unwrap(): E.Either<L,R>
}

const Conversions = [
    "toAsync", "toMaybe"
]

const NullaryOperators = [
    "isRight","isLeft","get","swap","show",
    "toPromise","toThenable","unwrap"
]

const Operators = [
    ...NullaryOperators, ...Conversions,
    "getOr","getLeftOr","fold",
   "map","chain","mapLeft","mapTo","mapLeftTo",
    "match","tap","zipWith","zip","zipLeft",
    "zipRight"
]

const fluent = <L,R>(m: E.Either<L,R>) => {
    const proxy = new Proxy(m as unknown as Either<L,R>, {
        get<P extends keyof Either<L,R>>(target: any, p: P): any {
            if( typeof p === "symbol" ){
                if( p === Symbol.toPrimitive ){
                    return target
                }
                return target[p];
            }
            if( Operators.includes(p) ){

                if( p === "chain" ){
                    return <L0,R0>(fn: (a: R) => Either<L0,R0>) => {
                        const adapted = (a: R) => fn(a).unwrap()
                        return fluent(target['|>'](E.chain(adapted)));
                    }
                }

                if( p === "unwrap" ){
                    return () => target
                }

                if( p === "zipWith" ){
                    return <L0,R0,C>(other: Either<L0,R0>, fn: (a: R, b: R0) => C ) => {
                        return fluent(target["|>"](E.zipWith(fn)(other.unwrap())))
                    }
                }

                if( ["zip", "zipLeft", "zipRight"].includes(p) ){
                    return <L0,R0>(other: Either<L0,R0>) => {
                        return fluent(target['|>']((E as any)[p](other.unwrap())));
                    }
                }

                if( Conversions.includes(p) ){
                    if( p === "toAsync" ){
                        return () => wrapA(E.toAsync(target))
                    }
                    if( p === "toMaybe" ){
                        return () => wrapM(E.toMaybe(target) as any)
                    }
                }

                if( NullaryOperators.includes(p) ){
                    return () => {
                        return (E as any)[p](target);
                    }
                }

                return (...args: unknown[]) => {
                    const result: unknown = target["|>"]((E as any)[p](...args));
                    if(["Left", "Right"].includes(getVariant(result) as unknown as string)){
                        return fluent(result as any)
                    }
                    return result;
                }
            }
        },
        has(target, p: keyof Either<L,R>) {
            return Operators.includes(p) || p in target
        }
    });
    return proxy;
}

export function wrap<L,R>(e: E.Either<L,R>){
    return fluent(e);
}
export function Left<L>(l: L){
    return fluent(E.Left(l))
}
export function Right<R>(r: R){
    return fluent(E.Right(r))
}
export function of<R>(r: R){
    return fluent(E.of(r))
}
export function from<L,R>(l: L, r: R){
    return fluent(E.from(l,r))
}
export function fromNullish<L,R>(l: L, r: R){
    return fluent(E.fromNullish(l,r))
}
export function fromFalsy<L,R>(l: L, r: R){
    return fluent(E.fromFalsy(l,r))
}
export function fromPredicate<L, R extends L>(pred: (r: L) => r is R, r: L){
    return fluent(E.fromPredicate(pred, r))
}
export function fromCondition<R>(pred: (r: R) => boolean, r: R){
    return fluent(E.fromCondition(pred, r))
}
export function defaultTo<L>(l: L){
    return <R>(r: R) => fluent(E.defaultTo(l)(r))
}
export function attemptR<Args, E=never, R=unknown>(fn: (...args: Args[]) => R, ...args: Args[]){
    return fluent(E.attemptR(fn, ...args))
}
export function attempt<E=never, R=unknown>(fn: () => R){
    return fluent(E.attempt(fn))
}
export async function asyncAttempt<E=never, R=unknown>(fn: () => Promise<Awaited<R>>): Promise<Either<E, Awaited<R>>>{
    return fluent(await E.asyncAttempt(fn))
}
export async function asyncAttemptR<Args, E=never, R=unknown>(
    fn: (...args: Args[]) => Promise<Awaited<R>>, 
    ...args: Args[]
): Promise<Either<E, Awaited<R>>> {
    return fluent(await E.asyncAttemptR(fn, ...args))
}