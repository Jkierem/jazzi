import type { LiteralShow } from "../Union/show.ts";
import type { Boxed, IsPrimitive, isUnknown } from "../_internals/types.ts";
import type { Maybe } from "../Maybe/types.ts";
import type { Either } from "../Either/types.ts";
import { getSymbol, setSymbol, WithSymbol } from "../_internals/symbols.ts";
import { Traversable, TraversableRep } from "../Union/traversable.ts";

export type RemoveUnknown<A> = isUnknown<A> extends true ? [env?: never] : [env: A];
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
const E = Symbol("@@handler")

export const setSuccess = setSymbol(S)
export const setFailure = setSymbol(F)
export const setHandler = setSymbol(E)

export const getSuccess = getSymbol(S)
export const getFailure = getSymbol(F)
export const getHandler = getSymbol(E)

type SuccessChannel<R,A> = (r: R) => A
interface AsyncWrapper<R,A> 
extends WithSymbol<typeof S, (r: R) => Promise<A>>, 
        WithSymbol<typeof F, any>,
        WithSymbol<typeof E, (<A0>(e: any) => AsyncIO<A0>) | undefined>
{}

export const makeWrapper = <R,A>(success: SuccessChannel<R,A>, failure: any) => {
    const s = setSuccess(success)
    const f = setFailure(failure)
    const e = setHandler(undefined)
    return s(f(e({})))
}

export type AsyncCases = "Success" | "Fail"

export type AsyncIO<A> = Async<unknown,A>

export interface Async<R, A> 
extends LiteralShow<"Async",`${AsyncCases} => (R -> _)`>, Boxed<AsyncWrapper<R,A>>, Traversable<A>
{
    map<B>(fn: (a: A) => B ): Async<R,B>;
    fmap<B>(fn: (a: A) => B ): Async<R,B>;
    mapTo<B>(b: B): Async<R,B>;

    join(): A extends Async<infer R0, infer B> ? Async<R0 & R, B> : A;
    flat(): A extends Async<infer R0, infer B> ? Async<R0 & R, B> : A;

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
    sequence<R0,A0>(other: Async<R0,A0>): Async<R & R0, (A0 | A)[]>;
}

export interface AsyncPartialRep {
    Success<R,A>(fn: (r: R) => Promise<A>): Async<R,A>;
    Fail<E>(e: E): AsyncIO<never>;
}

export interface AsyncRep 
extends TraversableRep
{
    /**
     * Create an Async that succeeds with the given value.
     * @param a 
     */
    pure<A>(a: A): AsyncIO<A>;
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
     * Create an Async that executes the given sync computation
     * @param fn 
     */
    of<R,A>(fn: (env: R) => A): Async<R,A>;
    /**
     * Create an Async that executes the given async computation
     * @param fn 
     */
    from<R,A>(fn: (env: R) => Promise<A>): Async<R,A>;
    /**
     * Create an Async from the given promise
     * @param fn 
     */
    fromPromise<A>(p: Promise<A>): AsyncIO<A>;
    /**
     * Create an Async from a callback based async function, similar to the Promise constructor
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
     * Create an Async that requires an environment. This only makes sense in typescript.
     * @param fn 
     */
    require<Env>(): Async<Env,Env>;
    /**
     * Create an Async that succeeds with undefined.
     * @param fn 
     */
    unit(): AsyncIO<undefined>;
    /**
     * Do notation using generator functions
     */
    do<R,A>(fn: (pure: <T>(a: T) => AsyncIO<T>) => Generator<any, Async<R,A>, any>): Async<R,A>;
    fromMaybe<T>(m: Maybe<T>): AsyncIO<T>;
    fromEither<L,R>(m: Either<L,R>): AsyncIO<R>;
    traverse<A,T>(data: A[], fn: (a: A) => AsyncIO<T>): AsyncIO<T[]>;
    all<A>(actions: AsyncIO<A>[]): AsyncIO<A[]>
}