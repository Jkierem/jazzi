import { Either } from "../Either/fluent"
import { Maybe } from "../Maybe/fluent"
import { getVariant } from "../_internals/symbols"
import { Nil } from "../_internals/types"
import * as A from "./"

const NullaryEffect = [
    "swap","ignore"
]

const NullaryOperators = [
    "run","unwrap"
]

const Operators = [
    ...NullaryEffect,
    ...NullaryOperators,
    "map","mapError","recover","chain","recurIf",
    "recurWhile","recurN","zipWith","zip","zipLeft",
    "zipRight","provide","access","alias","rename",
    "mapTo", "bind", "provideTo",
    "tapEffect","runWith", "|>"
]

export type AsyncIO<E,A> = Async<unknown,E,A>
export type AsyncRIO<R,A> = Async<R,never,A>
export type AsyncUIO<A> = Async<unknown,never,A>

export interface Async<R,E,A> {
    map<B>(fn: (a: A) => B): Async<R,E,A>
    mapError<B>(fn: (e: E) => B): Async<R,B,A>
    recover<E0,B>(fn: (e: E) => AsyncIO<E0,B>): Async<R, E0, A | B>
    chain<R0,E0,A0>(fn: (a: A) => Async<R0,E0,A0>): Async<R & R0, E | E0, A0>
    recurIf(pred: (a: A) => AsyncUIO<boolean>): Async<R,E,A>
    recurWhile(pred: (a: A) => boolean): Async<R,E,A>
    recurN(n: number): Async<R,E,A>
    zipWith<R0,E0,A0,C>(other: Async<R0,E0,A0>, fn: (a: A, b: A0) => C): Async<R & R0, E | E0, C>
    zip<R0,E0,B>(right: Async<R0,E0,B>): Async<R & R0, E | E0, [A, B]>
    zipLeft<R0,E0,B>(right: Async<R0,E0,B>): Async<R & R0, E | E0, A>
    zipRight<R0,E0,B>(right: Async<R0,E0,B>): Async<R & R0, E | E0, B>
    provide(r: R): Async<unknown, E, A>
    access<K extends keyof A>(k: K): Async<R, E, A[K]>
    runWith(...args: A.RemoveUnknown<R>): Promise<A>
    tapEffect<R0,E0,A0>(fn: (a: A) => Async<R0,E0,A0>): Async<R & R0, E | E0, A>
    alias<K extends keyof A, K0 extends string>(original: K, aliased: Exclude<K0, keyof A>): 
        Async<R, E, { [P in K0 | keyof A]: P extends keyof A ? A[P] : A[K] }>
    rename<K extends keyof A, K0 extends string>(original: K, aliased: Exclude<K0, keyof A>): 
        Async<R, E, { [P in K0 | Exclude<keyof A, K>]: P extends Exclude<keyof A, K> ? A[P] : A[K]}>
    bind<K extends string, R0, E0, A0>(key: Exclude<K, keyof A>, fn: (a: A) => Async<R0,E0,A0>): 
        Async<R & R0, E0 | E, { [P in keyof (A & { [P in K]: A0; })]: (A & { [P in K]: A0; })[P]; }>
    mapTo<B>(b: B): Async<R,E,B>
    provideTo<E0,A0>(other: Async<A, E0, A0>): Async<R, E0 | E, A0>
    swap(): Async<R,A,E>
    ignore(): Async<R, never, undefined>
    run(): Promise<A>
    unwrap(): A.Async<R,E,A>
}

const fluent = <R,E,A>(m: A.Async<R,E,A>) => {
    const proxy = new Proxy(m as unknown as Async<R,E,A>, {
        get<P extends keyof Async<R,E,A>>(target: any, p: P): any {
            if( typeof p === "symbol" ){
                if( p === Symbol.toPrimitive ){
                    return target
                }
                return target[p];
            }
            if( Operators.includes(p) ){

                if( p === "chain" ){
                    return <R0,E0,A0>(fn: (a: A) => Async<R0,E0,A0>) => {
                        const adapted = (a: A) => fn(a).unwrap()
                        return fluent(target['|>'](A.chain(adapted)));
                    }
                }

                if( p === "unwrap" ){
                    return () => target
                }

                if( p === "zipWith" ){
                    return <R0,E0,A0,C>(other: Async<R0,E0,A0>, fn: (a: A, b: A0) => C ) => {
                        return fluent(target["|>"](A.zipWith(fn)(other.unwrap())))
                    }
                }

                if( ["zip", "zipLeft", "zipRight"].includes(p) ){
                    return <R0,E0,A0>(other: Async<R0,E0,A0>) => {
                        return fluent(target['|>']((A as any)[p](other.unwrap())));
                    }
                }

                if( NullaryEffect.includes(p) ){
                    return () => {
                        return fluent((A as any)[p](target));
                    }
                }

                if( NullaryOperators.includes(p) ){
                    return () => {
                        return (A as any)[p](target);
                    }
                }

                if( (p as any) === "|>" ){
                    return (fn: any) => {
                        const result = target["|>"](fn)
                        if( getVariant(result) ){
                            return fluent(result)
                        }
                        return result
                    }
                }

                return (...args: unknown[]) => {
                    const result: unknown = target["|>"]((A as any)[p](...args));
                    if( getVariant(result) ){
                        return fluent(result as any)
                    }
                    return result;
                }
            }
        },
        has(target, p: keyof Async<R,E,A>) {
            return Operators.includes(p) || p in target
        }
    });
    return proxy;
}

export function wrap<R,E,A>(a: A.Async<R,E,A>){
    return fluent(a);
}

export function succeedWith<A>(fn: () => A){
    return fluent(A.succeedWith(fn))
}

export function Succeed<A>(a: A){
    return fluent(A.Succeed(a))
}

export function failWith<E>(fn: () => E){
    return fluent(A.failWith(fn))
}

export function Fail<E>(e: E){
    return fluent(A.Fail(e));
}

export function of<R,E=never,A=unknown>(fn: (r: R) => A){
    return fluent(A.of(fn))
}

export function from<R,A>(fn: (r: R) => Promise<A>){
    return fluent(A.from(fn))
}

export function fromCondition<A>(fn: (a: A) => boolean){
    return (a: A) => fluent(A.fromCondition(fn)(a));
}

export function fromPredicate<A, B extends A>(pred: (a: A) => a is B){
    return (a: A) => fluent(A.fromPredicate(pred)(a));
}

export function fromNullish<A>(a: A | Nil){
    return fluent(A.fromNullish(a));
}

export function fromMaybe<A>(m: Maybe<A>){
    return fluent(A.fromMaybe(m.unwrap()));
}

export function fromEither<L,R>(e: Either<L,R>){
    return fluent(A.fromEither(e.unwrap()))
}

function _require<R>(){
    return fluent(A.require<R>())
}

function _do(){
    return fluent(A.do());
}

export { _require as require, _do as do }
