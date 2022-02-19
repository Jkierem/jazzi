import type { LiteralShow } from "../Union/show.ts";

import type { Boxed, IsPrimitive, isUnknown } from "../_internals/types.ts";

import type { Maybe } from "../Maybe/types.ts";

import type { Either } from "../Either/types.ts";

import type { Monad, MonadRep } from "../Union/monad.ts";

import type { Tap } from "../Union/tap.ts";

import type { Runnable } from "../Union/runnable.ts";

import type { TraversableRep } from "../Union/traversable.ts";

import type { Thenable, ThenableOf } from "../Union/thenable.ts";

import { getSymbol, setSymbol, WithSymbol } from "../_internals/symbols.ts";


export type RemoveUnknown<A> = isUnknown<A> extends true ? [env?: never] : [env: A];
export type Env<A> = A extends Async<infer R, any, any> ? R : never
export type Err<A> = A extends Async<any, infer E, any> ? E : never
export type Remove<A,B> = B extends A & infer C 
    ? C
    : B;
export type ProvideSlice<A,R> = IsPrimitive<R> extends true 
    ? unknown 
    : keyof R extends keyof A 
        ? unknown
        : Remove<A,R>
export type Provide<A,R> = IsPrimitive<R> extends true 
    ? unknown 
    : keyof R extends keyof A 
        ? unknown
        : Omit<R, keyof A>

const S = Symbol("@@success")
const F = Symbol("@@failure")
const C = Symbol("@@critical")
const I = Symbol("@@ignored")

export const setSuccess = setSymbol(S)
export const setFailure = setSymbol(F)
export const setCritical = setSymbol(C)
export const setIgnore = setSymbol(I)

export const getSuccess = getSymbol(S)
export const getFailure = getSymbol(F)
export const getCritical = getSymbol(C)
export const getIgnore = getSymbol(I)

export type SuccessChannel<R,A> = (r: R) => A
export interface AsyncWrapper<R,A> 
extends WithSymbol<typeof S, (r: R) => Promise<A>>, 
        WithSymbol<typeof F, any>,
        WithSymbol<typeof C, (err: any) => AsyncIO<never,any>>
{}

export const makeWrapper = <R,A>(success: SuccessChannel<R,A>, failure: any) => {
    const s = setSuccess(success)
    const f = setFailure(failure)
    const e = setCritical(undefined)
    const i = setIgnore(false)
    return s(f(e(i({}))))
}

export type AsyncCases = "Success" | "Fail"
export type AsyncIO<E,A> = Async<unknown,E,A>
export type AsyncUIO<A> = Async<unknown,never,A>
export type AsyncUnit = AsyncIO<never,undefined>

export interface Async<R, E, A> 
extends LiteralShow<"Async",`${AsyncCases} => (R -> _)`>, Monad<A>, 
        Boxed<AsyncWrapper<R,A>, AsyncRep,AsyncCases>, Tap<A>, Runnable<RemoveUnknown<R>, Promise<A>>,
        Thenable<A,any>
{
    isFail(): boolean;
    isSuccess(): boolean;

    map<B>(fn: (a: A) => B ): Async<R,E,B>;
    fmap<B>(fn: (a: A) => B ): Async<R,E,B>;
    mapTo<B>(b: B): Async<R,E,B>;

    apply<E0,B>(ap: AsyncIO<E0,(a: A) => B>): AsyncIO<E | E0,B>;
    applyRight<E0,B>(ap: AsyncIO<E0,(a: A) => B>): AsyncIO<E | E0,B>;
    applyLeft<E0,B,C>(this: AsyncIO<E,(b: B) => C>, ap: AsyncIO<E0,B>): AsyncIO<E | E0, C>;

    join(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : never;
    flat(): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : never;

    chain  <B,E0,R0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;
    flatMap<B,E0,R0>(fn: (a: A) => Async<R0,E0,B>): Async<R & R0, E | E0, B>;

    peak(fn: (x: A) => void): Async<R,E,A>;
    tap(fn: (x: A) => void): Async<R,E,A>;
    matchEffect(patterns: any): Async<R,E,A>;
    when(patterns: any): Async<R,E,A>;

    /**
     * Convert Async to Thenable, executing the stored computation
     * @param args 
     */
    toThenable(...args: RemoveUnknown<R>): ThenableOf<A,any>;
    /**
     * Convert Async to Promise, executing the stored computation
     * @param args 
     */
    toPromise(...args: RemoveUnknown<R>): Promise<A>;
    run(...args: RemoveUnknown<R>): Promise<A>;
    unsafeRun(...args: RemoveUnknown<R>): Promise<A>;

    /**
     * Sequence two Async values storing the result in a tuple
     * @param right 
     */
    zip<R0,E0,A0>(right: Async<R0,E0,A0>): Async<R & R0, E | E0, [A,A0]>;
    /**
     * Sequence two Async values ignoring the result of the right Async
     * @param right 
     */
    zipLeft<R0,E0,A0>(right: Async<R0,E0,A0>): Async<R & R0, E | E0, A>;
    /**
     * Sequence two Async values ignoring the result of the left Async
     * @param right 
     */
    zipRight<R0,E0,A0>(right: Async<R0,E0,A0>): Async<R & R0, E | E0, A0>;
    /**
     * Sequence two Async values merging the results with a function
     * @param right 
     */
    zipWith<R0,E0,A0,C>(right: Async<R0,E0,A0>, fn: (a: A, a0: A0) => C): Async<R & R0, E | E0, C>
    /**
     * Provides the full environment to the Async value
     * @param p 
     */
    provide(p: R): AsyncIO<E,A>;
    /**
     * Provide a partial environment to the Async value. 
     * Same as provideSlice but uses the Omit type 
     * @param p 
     */
    providePartial<P extends Partial<R>>(p: P): Async<Provide<P,R>, E, A>
    /**
     * Provide a partial environment to the Async value. 
     * Same as providePartial but uses the Remove type which removes complete members of an intersection. 
     * Incomplete or inexact members are ignored
     * @param p 
     */
    provideSlice<P extends Partial<R>>(p: P): Async<ProvideSlice<P,R>,E,A>
    /**
     * Recover from failures using the provided function
     */
    recover<A0>(fn: (e: any) => AsyncUIO<A0>): Async<R, never, A | A0>
    /**
     * Returns an effect that ignores the result or failure of the effect
     */
    ignore(): AsyncUnit;
    /**
     * Chains two asyncs, using the return of the first as environment to the second.
     * @param other 
     */
    provideTo<E0,B>(other: Async<A,E0,B>): Async<R,E | E0,B>;
    /**
     * Chains two asyncs, using the return of the first as partial environment to the second.
     * @param other 
     */
    providePartialTo<A0,E0,B>(other: Async<A0,E0,B>): Async<R & Provide<A,A0>, E | E0,B>;
    /**
     * Chains two asyncs, using the return of the first as partial environment to the second.
     * @param other 
     */
    provideSliceTo<A0,E0,B>(other: Async<A0,E0,B>): Async<R & ProvideSlice<A,A0>,E | E0,B>;
    /**
     * Shorthand for mapping using a function that extracts a property
     * @param key 
     */
    access<K extends keyof A>(key: K): Async<R,E,A[K]>;
    /**
     * Alias a prop as the given alias
     * @param original 
     * @param aliased 
     */
    alias<K extends keyof A, K0 extends string>(original: K, aliased: K0): Async<R, E, A & {[P in K0]: A[K]}>;
    /**
     * Rename a prop dropping the original prop
     * @param original 
     * @param aliased 
     */
    rename<K extends keyof A, K0 extends string>(original: K, aliased: K0): Async<R, E, Omit<A,K> & {[P in K0]: A[K]}>;
    /**
     * Chains using `fn`, ignoring the result.
     * @param fn 
     */
    tapEffect<R0,E0,A0>(fn: (a: A) => Async<R0,E0,A0>): Async<R & R0, E | E0, A>;
    /**
     * Fails with inner value if predicate returns false
     * @param fn 
     */
    continueIf(predicate: (a: A) => boolean): Async<R,E | A,A>;
    /**
     * Transform an Async value through `fn`. It is an alternate way of using jazzi.
     * @param fn 
     */
    pipe<A0>(fn: (self: Async<R,E,A>) => A0): A0;
    /**
     * Terse pipe operator. Transform an Async value through `fn`. It is an alternate way of using jazzi.
     * @param fn 
     */
    ['|>']<A0>(fn: (self: Async<R,E,A>) => A0): A0;
}

export interface AsyncPartialRep {
    Success<R,E,A>(fn: (r: R) => Promise<A>): Async<R,E,A>;
    Fail<E>(e: E): AsyncIO<E,never>;
}

export interface AsyncRep 
extends MonadRep, TraversableRep
{
    pure<A>(a: A): AsyncUIO<A>;
    return<A>(a: A): AsyncUIO<A>;
    /**
     * Create an Async that succeeds with the given value or return value of the function.
     * @param a 
     */
    Success<R,E,A>(a: A | ((r: R) => A)): Async<R,E,A>;
    /**
     * Create an Async that fails with the given value.
     * @param e 
     */
    Fail<E,A=never>(e: E): AsyncIO<E,A>;
    /**
     * Create an Async that stores the given sync computation
     * @param fn 
     */
    of<R,E,A>(fn: (env: R) => A): Async<R,E,A>;
    /**
     * Create an Async that stores the given async computation
     * @param fn 
     */
    from<R,E,A>(fn: (env: R) => Promise<A>): Async<R,E,A>;
    /**
     * Create an Async from the given promise. The promise still executes resulting in an eager Async. 
     * For lazyness use any other constructor, passing a function.
     * @param fn 
     */
    fromPromise<A,E=unknown>(p: Promise<A>): AsyncIO<E,A>;
    /**
     * Create an Async from a callback based async function, similar to the native Promise constructor
     * @param fn 
     */
    fromCallback<E,A>(fn: (resolve: (a: A) => void, reject: (e: E) => void) => void): AsyncIO<E,A>;
    /**
     * Create an Async constructor function from an unary function, wrapping the computation in an Async
     * @param fn 
     */
    unary<A,B,E=unknown>(fn: (a: A) => B): (a: A) => AsyncIO<E,B>;
    /**
     * Create an Async constructor function from an n-ary function, wrapping the computation in an Async
     * @param fn 
     */
    through<A,B,E=unknown>(fn: (...a: A[]) => B): (...a: A[]) => AsyncIO<E,B>;
    /**
     * Create an Async that requires an environment. Alias of identity constructor.
     * @param fn 
     */
    require<Env>(): Async<Env, never, Env>;
    /**
     * Create an Async from the identity function
     * @param fn 
     */
    identity<A>(): Async<A, never, A>;
    /**
     * Create an Async that succeeds with undefined.
     * @param fn 
     */
    unit(): AsyncUnit;
    do<R,E,A>(fn: (pure: <T>(a: T) => AsyncUIO<T>) => Generator<any, Async<R,E,A>, any>): Async<R,E,A>;
    fromMaybe<T>(m: Maybe<T>): AsyncIO<undefined, T>;
    fromEither<L,R>(m: Either<L,R>): AsyncIO<L,R>;
    traverse<A,T>(data: A[], fn: (a: A) => AsyncUIO<T>): AsyncUIO<T[]>;
    /**
     * Sequence an array of Asyncs into a single Async that succeeds with an array of all the successes of the passed Asyncs, 
     * or fails with the first failure
     * @param actions 
     */
    all<A,E>(actions: AsyncIO<A,E>[]): AsyncIO<E,A[]>;
    /**
     * Returns Success of the `a` if predicate returns true for `a`. Fail of `a` otherwise
     * For a version without type narrowing see `fromCondition`
     * @param fn 
     */
    fromPredicate<A, T extends A>(fn: (a: A) => a is T, a: A): AsyncIO<Exclude<A,T>,T>;
    /**
     * Create a new Async constructor from a predicate function. 
     * Returns Success of the argument if predicate returns true for the argument. Fail of the argument otherwise
     * For a version with type narrowing see `fromPredicate`
     * @param fn 
     */
    fromCondition<A>(fn: (a: A) => boolean, a?: A): AsyncIO<A,A>;
}