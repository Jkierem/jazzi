import type { Monad } from "../Union/monad";
import type { LazyShow } from "../Union/show";
import type { Boxed } from "../_internals/types";
import { getSymbol, setSymbol, WithSymbol } from "../_internals/symbols";

type Env<A> = A extends Async<infer R, any, any> ? R : unknown
type Err<A> = A extends Async<any, infer E, any> ? E : never

const S = Symbol("@@success")
const F = Symbol("@@failure")
const E = Symbol("@@handler")

export const setSuccess = setSymbol(S)
export const setFailure = setSymbol(F)
export const setHandler = setSymbol(E)

export const getSuccess = getSymbol(S)
export const getFailure = getSymbol(F)
export const getHandler = getSymbol(E)

type SuccessChannel<R,A> = (r: R) => A
interface AsyncWrapper<R,E,A> 
extends WithSymbol<typeof S, (r: R) => Promise<A>>, 
        WithSymbol<typeof F, E>,
        WithSymbol<typeof E, ((e: E) => void) | undefined>
{}

export const makeWrapper = <R,E,A>(success: SuccessChannel<R,A>, failure: E) => {
    const s = setSuccess(success)
    const f = setFailure(failure)
    const e = setHandler(undefined)
    return s(f(e({})))
}

export interface Async<R, E, A> 
extends LazyShow<"Async","R">, Boxed<AsyncWrapper<R,E,A>>
{
    map<B>(fn: (a: A) => B ): Async<R,E,B>;
    fmap<B>(fn: (a: A) => B ): Async<R,E,B>;
    mapTo<B>(b: B): Async<R,E,B>;

    join(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : A;
    flat(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : A;

    chain  <B,R0,E0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;
    flatMap<B,R0,E0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;

    peak(fn: (x: A) => void): Async<R,E,A>;
    tap(fn: (x: A) => void): Async<R,E,A>;
    matchEffect(patterns: any): Async<R,E,A>;
    when(patterns: any): Async<R,E,A>;

    run(...env: R extends never ? [] : [R]): Promise<A>;
    unsafeRun(env: R): Promise<A>;
}

export interface AsyncPartialRep {
    Succeed<R,A>(fn: (r: R) => Promise<A>): Async<R,never,A>;
    Fail<E>(e: E): Async<unknown,E,never>;
}

type AsyncIO<E,A> = Async<unknown, E, A>

export interface AsyncRep 
{
    pure<A>(a: A): Async<unknown, never, A>;
    Succeed<A>(a: A): Async<never,never,A>;
    Fail<E,A=never>(e: E): Async<never,E,A>;
    of<R,E,A>(fn: (env: R) => A): Async<R,E,A>;
    from<R,E,A>(fn: (env: R) => Promise<A>): Async<R,E,A>;
    fromPromise<A>(p: Promise<A>): Async<unknown, never, A>;
    unary<A,B>(fn: (a: A) => B): (a: A) => Async<unknown,never,B>;
    through<A,B>(fn: (...a: A[]) => B): (...a: A[]) => Async<unknown,never,B>;
    require<Env>(): Async<Env,never,Env>;
    unit(): Async<unknown,never,undefined>;
    do<R,E,A>(fn: (pure: <T>(a: T) => Async<unknown,never,T>) => Generator<any, Async<R,E,A>, any>): Async<R,E,A>;
}