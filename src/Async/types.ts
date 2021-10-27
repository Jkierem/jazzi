import type { Monad } from "../Union/monad";
import type { Runnable } from "../Union/runnable";
import type { LazyShow } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import type { Boxed } from "../_internals/types";

type Env<A> = A extends Async<infer R, any, any> ? R : unknown
type Err<A> = A extends Async<any, infer E, any> ? E : never

export interface Async<R, E, A> 
extends Thenable<A,E>, LazyShow<"Async","R">, Runnable<[R], Promise<A>>, Boxed<() => Promise<A>>
{
    map<B>(fn: (a: A) => B ): Async<R,E,B>;
    fmap<B>(fn: (a: A) => B ): Async<R,E,B>;
    mapTo<B>(b: B): Async<R,E,B>;

    mapError<B>(fn: (e: E) => B): Async<R,B,A>;

    apply<B>(ap: Async<R,E,(a: A) => B>): Async<R,E,B>;
    applyRight<B>(ap: Async<R,E,(a: A) => B>): Async<R,E,B>;
    applyLeft<B,C>(this: Async<R,E,(b: B) => C>,ap: Async<R,E,B>): Async<R,E,C>;

    join(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : A;
    flat(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : A;

    chain  <B,R0,E0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;
    flatMap<B,R0,E0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;

    peak(fn: (x: A) => void): Async<R,E,A>;
    tap(fn: (x: A) => void): Async<R,E,A>;
    matchEffect(patterns: any): Async<R,E,A>;
    when(patterns: any): Async<R,E,A>;

    run(env: R): Promise<A>;
    unsafeRun(env: R): Promise<A>;
}

export interface AsyncPartialRep {
    Succeed<R,A>(fn: (r: R) => Promise<A>): Async<R,never,A>;
    Fail<E>(e: E): Async<unknown,E,never>;
}

export interface AsyncRep 
{
    pure<A>(a: A): Async<unknown, never, A>;
    Succeed<A>(a: A): Async<unknown,never,A>;
    Fail<E>(e: E): Async<unknown,E,never>;
    of<R,E,A>(fn: (env: R) => A): Async<R,E,A>;
    from<R,E,A>(fn: (env: R) => Promise<A>): Async<R,E,A>;
    fromPromise<A>(p: Promise<A>): Async<unknown, never, A>;
    unary<A,B>(fn: (a: A) => B): (a: A) => Async<unknown,never,B>;
    through<A,B>(fn: (...a: A[]) => B): (...a: A[]) => Async<unknown,never,B>;
    require<Env>(): Async<Env,never,Env>;
    unit(): Async<unknown,never,undefined>;
    do<R,E,A>(fn: (pure: <T>(a: T) => Async<unknown,never,T>) => Generator<any, Async<R,E,A>, any>): Async<R,E,A>;
}