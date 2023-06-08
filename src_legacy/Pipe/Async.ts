import type { Async, AsyncIO, AsyncUIO, AsyncUnit, Env, Err, Provide, ProvideSlice, RemoveUnknown } from "../Async/types";
import type { Monad } from "../Union/monad";
import type { ThenableOf } from "../Union/thenable";
export { show, toString } from "./_common"

export const map = <R,E,A,B>(fn: (a: A) => B ) => (self: Async<R,E,A>): Async<R,E,B> => self.map(fn)
export const fmap = <R,E,A,B>(fn: (a: A) => B ) => (self: Async<R,E,A>): Async<R,E,B> => self.fmap(fn)
export const mapTo = <R,E,A,B>(b: B) => (self: Async<R,E,A>): Async<R,E,B> => self.mapTo(b)

export const apply = <A,E,E0,B>(ap: AsyncIO<E0,(a: A) => B>) => (self: AsyncIO<E,A>): AsyncIO<E|E0,B> => self.apply(ap)
export const applyRight = <A,E,E0,B>(ap: AsyncIO<E0,(a: A) => B>) => (self: AsyncIO<E,A>): AsyncIO<E|E0,B> => self.applyRight(ap)
export const applyLeft = <B,E,E0,C>(ap: AsyncIO<E0,B>) => (self: AsyncIO<E,(b: B) => C>): AsyncIO<E|E0,C> => self.applyLeft(ap)

export const join = <R,E,A>(self: Async<R,E,A>): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : never => self.join()
export const flat = <R,E,A>(self: Async<R,E,A>): A extends Monad<infer B> ? Async<Env<A> & R, Err<A> | E, B> : never => self.flat()
export const chain = <R,E,A,R0,E0,B>(fn: (a: A) => Async<R0,E0,B>) => (self: Async<R,E,A>): Async<R & R0, E | E0, B> => self.chain(fn)
export const flatMap = <R,E,A,R0,E0,B>(fn: (a: A) => Async<R0,E0,B>) => (self: Async<R,E,A>): Async<R & R0, E | E0, B> => self.flatMap(fn)

export const peak = <R,E,A>(fn: (x: A) => void) => (self: Async<R,E,A>): Async<R,E,A> => self.peak(fn)
export const tap = <R,E,A>(fn: (x: A) => void) => (self: Async<R,E,A>): Async<R,E,A> => self.tap(fn)
export const matchEffect = <R,E,A>(patterns: any) => (self: Async<R,E,A>): Async<R,E,A> => self.matchEffect(patterns)
export const when = <R,E,A>(patterns: any) => (self: Async<R,E,A>): Async<R,E,A> => self.when(patterns)

/**
 * Convert Async to Thenable, executing the stored computation
 * @param args 
 */
export const toThenable = <R,E,A>(...args: RemoveUnknown<R>) => (self: Async<R,E,A>): ThenableOf<A,any> => self.toThenable(...args)
/**
 * Convert Async to Promise, executing the stored computation
 * @param args 
 */
export const toPromise = <R,E,A>(...args: RemoveUnknown<R>) => (self: Async<R,E,A>): Promise<A> => self.toPromise(...args)
export const run = <R,E,A>(...args: RemoveUnknown<R>) => (self: Async<R,E,A>): Promise<A> => self.run(...args)
export const unsafeRun = <R,E,A>(...args: RemoveUnknown<R>) => (self: Async<R,E,A>): Promise<A> => self.unsafeRun(...args)

/**
 * Sequence two Async values storing the result in a tuple
 * @param right 
 */
export const zip = <R,E,A,R0,E0,A0>(right: Async<R0,E0,A0>) => (self: Async<R,E,A>): Async<R & R0, E | E0, [A,A0]> => self.zip(right)
/**
 * Sequence two Async values ignoring the result of the right Async
 * @param right 
 */
export const zipLeft = <R,E,A,R0,E0,A0>(right: Async<R0,E0,A0>) => (self: Async<R,E,A>): Async<R & R0, E | E0, A> => self.zipLeft(right)
/**
 * Sequence two Async values ignoring the result of the left Async
 * @param right 
 */
export const zipRight = <R,E,A,R0,E0,A0>(right: Async<R0,E0,A0>) => (self: Async<R,E,A>): Async<R & R0, E | E0, A0> => self.zipRight(right)
/**
 * Sequence two Async values merging the results with a function
 * @param right 
 */
export const zipWith = <R,E,A,R0,E0,A0,C>(right: Async<R0,E0,A0>, fn: (a: A, a0: A0) => C) => (self: Async<R,E,A>): Async<R & R0, E | E0, C> => self.zipWith(right, fn)
/**
 * Provides the full environment to the Async value
 * @param p 
 */
export const provide = <R,E,A>(p: R) => (self: Async<R,E,A>): AsyncIO<E,A> => self.provide(p)
/**
 * Provide a partial environment to the Async value. 
 * Same as provideSlice but uses the Omit type 
 * @param p 
 */
export const providePartial = <R,E,A,P extends Partial<R>>(p: P) => (self: Async<R,E,A>): Async<Provide<P,R>,E, A> => self.providePartial(p)
/**
 * Provide a partial environment to the Async value. 
 * Same as providePartial but uses the Remove type which removes complete members of an intersection. 
 * Incomplete or inexact members are ignored
 * @param p 
 */
export const provideSlice = <R,E,A,P extends Partial<R>>(p: P) => (self: Async<R,E,A>): Async<ProvideSlice<P,R>,E,A> => self.provideSlice(p)
/**
 * Recover from failures using the provided function
 */
export const recover = <R,E,A,E0,A0>(fn: (e: E0) => AsyncUIO<A0>) => (self: Async<R,E,A>): Async<R, Exclude<E,E0>, A | A0> => self.recover(fn)
/**
 * Recover from failures using the provided function
 */
export const recoverAll = <R,E,A,A0>(fn: (e: any) => AsyncUIO<A0>) => (self: Async<R,E,A>): Async<R, never, A | A0> => self.recover(fn)
/**
 * Returns an effect that ignores the result or failure of the effect
 */
export const ignore = <R,E,A>() => (self: Async<R,E,A>): AsyncUnit => self.ignore()
/**
 * Chains two asyncs, using the return of the first as environment to the second.
 * @param other 
 */
export const provideTo = <R,E,A,E0,B>(other: Async<A,E0,B>) => (self: Async<R,E,A>) : Async<R,E | E0,B> => self.provideTo(other)
/**
 * Chains two asyncs, using the return of the first as partial environment to the second.
 * @param other 
 */
export const providePartialTo = <R,E,A,R0,E0,B>(other: Async<R0,E0,B>) => (self: Async<R,E,A>): Async<R & Provide<A,R0>,E | E0,B> => self.providePartialTo(other)
/**
 * Chains two asyncs, using the return of the first as partial environment to the second.
 * @param other 
 */
export const provideSliceTo = <R,E,A,R0,E0,B>(other: Async<R0,E0,B>) => (self: Async<R,E,A>): Async<R & ProvideSlice<A,R0>,E | E0,B> => self.provideSliceTo(other)
/**
 * Shorthand for mapping using a function that extracts a property
 * @param key 
 */
export const access = <R,E,A,K extends keyof A>(key: K) => (self: Async<R,E,A>): Async<R,E,A[K]> => self.access(key)
/**
 * Alias a prop as the given alias
 * @param original 
 * @param aliased 
 */
export const alias = <R,E,A,K extends keyof A, K0 extends string>(original: K, aliased: K0) => (self: Async<R,E,A>): Async<R,E, A & {[P in K0]: A[K]}> => 
    self.alias(original,aliased)
/**
 * Rename a prop dropping the original prop
 * @param original 
 * @param aliased 
 */
export const rename = <R,E,A,K extends keyof A, K0 extends string>(original: K, newName: K0) => 
    (self: Async<R,E,A>): Async<R,E, Omit<A,K> & {[P in K0]: A[K]}> =>
        self.rename(original, newName)
/**
 * Chains using `fn`, ignoring the result.
 * @param fn 
 */
export const tapEffect = <R,E,A,R0,E0,A0>(fn: (a: A) => Async<R0,E0,A0>) => (self: Async<R,E,A>): Async<R & R0,E | E0, A> => self.tapEffect(fn)
/**
 * Fails with inner value if predicate returns false
 * @param fn 
 */
export const continueIf = <R,E,A>(predicate: (a: A) => boolean) => (self: Async<R,E,A>): Async<R,E | A,A> => self.continueIf(predicate)
