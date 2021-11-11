import type { LiteralShow } from "../Union/show.ts";
import type { Boxed, IsPrimitive, isUnknown } from "../_internals/types.ts";
import type { Maybe } from "../Maybe/types.ts";
import type { Either } from "../Either/types.ts";
import type { Monad, MonadRep } from "../Union/monad.ts";
import type { Tap } from "../Union/tap.ts";
import type { Runnable } from "../Union/runnable.ts";
import type { TraversableRep } from "../Union/traversable.ts";
import { getSymbol, setSymbol, WithSymbol } from "../_internals/symbols.ts";

export type RemoveUnknown<A> = isUnknown<A> extends true ? [env?: never] : [env: A];
type Env<A> = A extends Async<infer R, any> ? R : never
type Remove<A,B> = B extends A & infer C 
    ? C
    : B;
type ProvideSlice<A,R> = IsPrimitive<R> extends true 
    ? unknown 
    : keyof R extends keyof A 
        ? unknown
        : Remove<A,R>
type Provide<A,R> = IsPrimitive<R> extends true 
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

type SuccessChannel<R,A> = (r: R) => A
export interface AsyncWrapper<R,A> 
extends WithSymbol<typeof S, (r: R) => Promise<A>>, 
        WithSymbol<typeof F, any>,
        WithSymbol<typeof C, (err: any) => AsyncIO<any>>
{}

export const makeWrapper = <R,A>(success: SuccessChannel<R,A>, failure: any) => {
    const s = setSuccess(success)
    const f = setFailure(failure)
    const e = setCritical(undefined)
    const i = setIgnore(false)
    return s(f(e(i({}))))
}

export type AsyncCases = "Success" | "Fail"
export type AsyncIO<A> = Async<unknown,A>
export type AsyncUnit = AsyncIO<undefined>

export interface Async<R, A> 
extends LiteralShow<"Async",`${AsyncCases} => (R -> _)`>, Monad<A>, 
        Boxed<AsyncWrapper<R,A>,AsyncRep,AsyncCases>, Tap<A>, Runnable<RemoveUnknown<R>, Promise<A>>
{
    isFail(): boolean;
    isSuccess(): boolean;

    map<B>(fn: (a: A) => B ): Async<R,B>;
    fmap<B>(fn: (a: A) => B ): Async<R,B>;
    mapTo<B>(b: B): Async<R,B>;

    apply<B>(ap: AsyncIO<(a: A) => B>): AsyncIO<B>;
    applyRight<B>(ap: AsyncIO<(a: A) => B>): AsyncIO<B>;
    applyLeft<B,C>(this: AsyncIO<(b: B) => C>,ap: AsyncIO<B>): AsyncIO<C>;

    join(): A extends Monad<infer B> ? Async<Env<A> & R, B> : never;
    flat(): A extends Monad<infer B> ? Async<Env<A> & R, B> : never;

    chain  <B,R0>(fn: (a: A) => Async<R0,B>): Async<R & R0, B>;
    flatMap<B,R0>(fn: (a: A) => Async<R0,B>): Async<R & R0, B>;

    peak(fn: (x: A) => void): Async<R,A>;
    tap(fn: (x: A) => void): Async<R,A>;
    matchEffect(patterns: any): Async<R,A>;
    when(patterns: any): Async<R,A>;

    run(...args: RemoveUnknown<R>): Promise<A>;
    unsafeRun(...args: RemoveUnknown<R>): Promise<A>;

    /**
     * Sequence two Async values storing the result in a tuple
     * @param right 
     */
    zip<R0,A0>(right: Async<R0,A0>): Async<R & R0, [A,A0]>;
    /**
     * Sequence two Async values ignoring the result of the right Async
     * @param right 
     */
    zipLeft<R0,A0>(right: Async<R0,A0>): Async<R & R0, A>;
    /**
     * Sequence two Async values ignoring the result of the left Async
     * @param right 
     */
    zipRight<R0,A0>(right: Async<R0,A0>): Async<R & R0, A0>;
    /**
     * Sequence two Async values merging the results with a function
     * @param right 
     */
    zipWith<R0,A0,C>(right: Async<R0,A0>, fn: (a: A, a0: A0) => C): Async<R & R0, C>
    /**
     * Provides the full environment to the Async value
     * @param p 
     */
    provide(p: R): AsyncIO<A>;
    /**
     * Provide a partial environment to the Async value. 
     * Same as provideSlice but uses the Omit type 
     * @param p 
     */
    providePartial<P extends Partial<R>>(p: P): Async<Provide<P,R>, A>
    /**
     * Provide a partial environment to the Async value. 
     * Same as providePartial but uses the Remove type which removes complete members of an intersection. 
     * Incomplete or inexact members are ignored
     * @param p 
     */
    provideSlice<P extends Partial<R>>(p: P): Async<ProvideSlice<P,R>,A>
    /**
     * Recover from failures using the provided function
     */
    recover<A0>(fn: (e: any) => AsyncIO<A0>): Async<R, A | A0>
    /**
     * Returns an effect that ignores the result or failure of the effect
     */
    ignore(): AsyncUnit;
    /**
     * Chains two asyncs, using the return of the first as environment to the second.
     * @param other 
     */
    provideTo<B>(other: Async<A,B>): Async<R,B>;
    /**
     * Chains two asyncs, using the return of the first as partial environment to the second.
     * @param other 
     */
    providePartialTo<A0,B>(other: Async<A0,B>): Async<R & Provide<A,A0>,B>;
    /**
     * Chains two asyncs, using the return of the first as partial environment to the second.
     * @param other 
     */
    provideSliceTo<A0,B>(other: Async<A0,B>): Async<R & ProvideSlice<A,A0>,B>;
    /**
     * Shorthand for mapping using a function that extracts a property
     * @param key 
     */
    access<K extends keyof A>(key: K): Async<R,A[K]>;
    /**
     * Alias a prop as the given alias
     * @param original 
     * @param aliased 
     */
    alias<K extends keyof A, K0 extends string>(original: K, aliased: K0): Async<R, A & {[P in K0]: A[K]}>;
    /**
     * Rename a prop dropping the original prop
     * @param original 
     * @param aliased 
     */
    rename<K extends keyof A, K0 extends string>(original: K, aliased: K0): Async<R, Omit<A,K> & {[P in K0]: A[K]}>;
    /**
     * Chains using `fn`, ignoring the result.
     * @param fn 
     */
    tapEffect<R0,A0>(fn: (a: A) => Async<R0,A0>): Async<R & R0, A>;
    /**
     * Fails with inner value if predicate returns false
     * @param fn 
     */
    continueIf(predicate: (a: A) => boolean): Async<R,A>;
}

export interface AsyncPartialRep {
    Success<R,A>(fn: (r: R) => Promise<A>): Async<R,A>;
    Fail<E>(e: E): AsyncIO<never>;
}

export interface AsyncRep 
extends MonadRep, TraversableRep
{
    pure<A>(a: A): AsyncIO<A>;
    return<A>(a: A): AsyncIO<A>;
    /**
     * Create an Async that succeeds with the given value or return value of the function.
     * @param a 
     */
    Success<R,A>(a: A | ((r: R) => A)): Async<R,A>;
    /**
     * Create an Async that fails with the given value.
     * @param e 
     */
    Fail<E,A=never>(e: E): AsyncIO<A>;
    /**
     * Create an Async that stores the given sync computation
     * @param fn 
     */
    of<R,A>(fn: (env: R) => A): Async<R,A>;
    /**
     * Create an Async that stores the given async computation
     * @param fn 
     */
    from<R,A>(fn: (env: R) => Promise<A>): Async<R,A>;
    /**
     * Create an Async from the given promise. The promise still executes resulting in an eager Async. 
     * For lazyness use any other constructor, passing a function.
     * @param fn 
     */
    fromPromise<A>(p: Promise<A>): AsyncIO<A>;
    /**
     * Create an Async from a callback based async function, similar to the native Promise constructor
     * @param fn 
     */
    fromCallback<A>(fn: (resolve: (a: A) => void, reject: (e: any) => void) => void): AsyncIO<A>;
    /**
     * Create an Async constructor function from an unary function, wrapping the computation in an Async
     * @param fn 
     */
    unary<A,B>(fn: (a: A) => B): (a: A) => AsyncIO<B>;
    /**
     * Create an Async constructor function from an n-ary function, wrapping the computation in an Async
     * @param fn 
     */
    through<A,B>(fn: (...a: A[]) => B): (...a: A[]) => AsyncIO<B>;
    /**
     * Create an Async that requires an environment. Alias of identity constructor.
     * @param fn 
     */
    require<Env>(): Async<Env,Env>;
    /**
     * Create an Async from the identity function
     * @param fn 
     */
    identity<A>(): Async<A,A>;
    /**
     * Create an Async that succeeds with undefined.
     * @param fn 
     */
    unit(): AsyncUnit;
    do<R,A>(fn: (pure: <T>(a: T) => AsyncIO<T>) => Generator<any, Async<R,A>, any>): Async<R,A>;
    fromMaybe<T>(m: Maybe<T>): AsyncIO<T>;
    fromEither<L,R>(m: Either<L,R>): AsyncIO<R>;
    traverse<A,T>(data: A[], fn: (a: A) => AsyncIO<T>): AsyncIO<T[]>;
    /**
     * Sequence an array of Asyncs into a single Async that succeeds with an array of all the successes of the passed Asyncs, 
     * or fails with the first failure
     * @param actions 
     */
    all<A>(actions: AsyncIO<A>[]): AsyncIO<A[]>;
    /**
     * Returns Success of the `a` if predicate returns true for `a`. Fail of `a` otherwise
     * @param fn 
     */
    fromPredicate(fn: () => boolean): AsyncUnit;
    fromPredicate<A>(fn: (a: A) => boolean, a: A): AsyncIO<A>;
    /**
     * Curried version of fromPredicate. Create a new Async constructor from a predicate function. 
     * Returns Success of the argument if predicate returns true for the argument. Fail of the argument otherwise
     * @param fn 
     */
    fromCondition(fn: () => boolean):() => AsyncUnit;
    fromCondition<A>(fn: (a: A) => boolean): (a: A) => AsyncIO<A>;
}