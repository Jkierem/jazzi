import type { Async, AsyncIO, AsyncUnit, Env, Provide, ProvideSlice, RemoveUnknown } from "../Async/types";
import type { Monad } from "../Union/monad";
import type { ThenableOf } from "../Union/thenable";
export { show, toString } from "./_common"

export const map = <R,A,B>(fn: (a: A) => B ) => (self: Async<R,A>): Async<R,B> => self.map(fn)
export const fmap = <R,A,B>(fn: (a: A) => B ) => (self: Async<R,A>): Async<R,B> => self.fmap(fn)
export const mapTo = <R,A,B>(b: B) => (self: Async<R,A>): Async<R,B> => self.mapTo(b)

export const apply = <A,B>(ap: AsyncIO<(a: A) => B>) => (self: AsyncIO<A>): AsyncIO<B> => self.apply(ap)
export const applyRight = <A,B>(ap: AsyncIO<(a: A) => B>) => (self: AsyncIO<A>): AsyncIO<B> => self.applyRight(ap)
export const applyLeft = <B,C>(ap: AsyncIO<B>) => (self: AsyncIO<(b: B) => C>): AsyncIO<C> => self.applyLeft(ap)

export const join = <R,A>(self: Async<R,A>): A extends Monad<infer B> ? Async<Env<A> & R, B> : never => self.join()
export const flat = <R,A>(self: Async<R,A>): A extends Monad<infer B> ? Async<Env<A> & R, B> : never => self.flat()
export const chain = <R,A,R0,B>(fn: (a: A) => Async<R0,B>) => (self: Async<R,A>): Async<R & R0, B> => self.chain(fn)
export const flatMap = <R,A,R0,B>(fn: (a: A) => Async<R0,B>) => (self: Async<R,A>): Async<R & R0, B> => self.flatMap(fn)

export const peak = <R,A>(fn: (x: A) => void) => (self: Async<R,A>): Async<R,A> => self.peak(fn)
export const tap = <R,A>(fn: (x: A) => void) => (self: Async<R,A>): Async<R,A> => self.tap(fn)
export const matchEffect = <R,A>(patterns: any) => (self: Async<R,A>): Async<R,A> => self.matchEffect(patterns)
export const when = <R,A>(patterns: any) => (self: Async<R,A>): Async<R,A> => self.when(patterns)

/**
 * Convert Async to Thenable, executing the stored computation
 * @param args 
 */
export const toThenable = <R,A>(...args: RemoveUnknown<R>) => (self: Async<R,A>): ThenableOf<A,any> => self.toThenable(...args)
/**
 * Convert Async to Promise, executing the stored computation
 * @param args 
 */
export const toPromise = <R,A>(...args: RemoveUnknown<R>) => (self: Async<R,A>): Promise<A> => self.toPromise(...args)
export const run = <R,A>(...args: RemoveUnknown<R>) => (self: Async<R,A>): Promise<A> => self.run(...args)
export const unsafeRun = <R,A>(...args: RemoveUnknown<R>) => (self: Async<R,A>): Promise<A> => self.unsafeRun(...args)

/**
 * Sequence two Async values storing the result in a tuple
 * @param right 
 */
export const zip = <R,A,R0,A0>(right: Async<R0,A0>) => (self: Async<R,A>): Async<R & R0, [A,A0]> => self.zip(right)
/**
 * Sequence two Async values ignoring the result of the right Async
 * @param right 
 */
export const zipLeft = <R,A,R0,A0>(right: Async<R0,A0>) => (self: Async<R,A>): Async<R & R0, A> => self.zipLeft(right)
/**
 * Sequence two Async values ignoring the result of the left Async
 * @param right 
 */
export const zipRight = <R,A,R0,A0>(right: Async<R0,A0>) => (self: Async<R,A>): Async<R & R0, A0> => self.zipRight(right)
/**
 * Sequence two Async values merging the results with a function
 * @param right 
 */
export const zipWith = <R,A,R0,A0,C>(right: Async<R0,A0>, fn: (a: A, a0: A0) => C) => (self: Async<R,A>): Async<R & R0, C> => self.zipWith(right, fn)
/**
 * Provides the full environment to the Async value
 * @param p 
 */
export const provide = <R,A>(p: R) => (self: Async<R,A>): AsyncIO<A> => self.provide(p)
/**
 * Provide a partial environment to the Async value. 
 * Same as provideSlice but uses the Omit type 
 * @param p 
 */
export const providePartial = <R,A,P extends Partial<R>>(p: P) => (self: Async<R,A>): Async<Provide<P,R>, A> => self.providePartial(p)
/**
 * Provide a partial environment to the Async value. 
 * Same as providePartial but uses the Remove type which removes complete members of an intersection. 
 * Incomplete or inexact members are ignored
 * @param p 
 */
export const provideSlice = <R,A,P extends Partial<R>>(p: P) => (self: Async<R,A>): Async<ProvideSlice<P,R>,A> => self.provideSlice(p)
/**
 * Recover from failures using the provided function
 */
export const recover = <R,A,A0>(fn: (e: any) => AsyncIO<A0>) => (self: Async<R,A>): Async<R, A | A0> => self.recover(fn)
/**
 * Returns an effect that ignores the result or failure of the effect
 */
export const ignore = <R,A>() => (self: Async<R,A>): AsyncUnit => self.ignore()
/**
 * Chains two asyncs, using the return of the first as environment to the second.
 * @param other 
 */
export const provideTo = <R,A,B>(other: Async<A,B>) => (self: Async<R,A>) : Async<R,B> => self.provideTo(other)
/**
 * Chains two asyncs, using the return of the first as partial environment to the second.
 * @param other 
 */
export const providePartialTo = <R,A,R0,B>(other: Async<R0,B>) => (self: Async<R,A>): Async<R & Provide<A,R0>,B> => self.providePartialTo(other)
/**
 * Chains two asyncs, using the return of the first as partial environment to the second.
 * @param other 
 */
export const provideSliceTo = <R,A,R0,B>(other: Async<R0,B>) => (self: Async<R,A>): Async<R & ProvideSlice<A,R0>,B> => self.provideSliceTo(other)
/**
 * Shorthand for mapping using a function that extracts a property
 * @param key 
 */
export const access = <R,A,K extends keyof A>(key: K) => (self: Async<R,A>): Async<R,A[K]> => self.access(key)
/**
 * Alias a prop as the given alias
 * @param original 
 * @param aliased 
 */
export const alias = <R,A,K extends keyof A, K0 extends string>(original: K, aliased: K0) => (self: Async<R,A>): Async<R, A & {[P in K0]: A[K]}> => 
    self.alias(original,aliased)
/**
 * Rename a prop dropping the original prop
 * @param original 
 * @param aliased 
 */
export const rename = <R,A,K extends keyof A, K0 extends string>(original: K, newName: K0) => 
    (self: Async<R,A>): Async<R, Omit<A,K> & {[P in K0]: A[K]}> =>
        self.rename(original, newName)
/**
 * Chains using `fn`, ignoring the result.
 * @param fn 
 */
export const tapEffect = <R,A,R0,A0>(fn: (a: A) => Async<R0,A0>) => (self: Async<R,A>): Async<R & R0, A> => self.tapEffect(fn)
/**
 * Fails with inner value if predicate returns false
 * @param fn 
 */
export const continueIf = <R,A>(predicate: (a: A) => boolean) => (self: Async<R,A>): Async<R,A> => self.continueIf(predicate)
