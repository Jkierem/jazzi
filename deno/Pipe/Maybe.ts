import type { Async } from "../Async/types.ts";
import type { Maybe } from "../Maybe/types.ts";
import type { Monad } from "../Union/monad.ts";

export * from "./_common/mod.ts";
/**
 * If Just, returns application of argument or argument. 
 * If None, returns undefined. 
 */
export const onJust = <A,B>(fn: B | ((x: A) => B)) => (m: Maybe<A>): B => m.onJust(fn);
/**
 * If None, returns application of argument or argument. 
 * If Just, returns inner value. 
 */
export const onNone = <A,B>(fn: B | (() => B)) => (m: Maybe<A>): A | B => m.onNone(fn);
/**
 * If Just, maps over argument
 * If None, returns structure unchanged. 
 */
export const ifJust = <A,B>(fn: (x: A) => Maybe<B>) => (m: Maybe<A>): Maybe<B> => m.ifJust(fn);
/**
 * If None, maps over argument
 * If Just, returns structure unchanged. 
 */
export const ifNone = <A,B>(fn: (x: A) => Maybe<B>) => (m: Maybe<A>): Maybe<B> => m.ifNone(fn)
/**
 * If Just, returns true
 * If None, returns false
 */
export const isJust = <A>(m: Maybe<A>): boolean => m.isJust();
/**
 * If Just, returns false
 * If None, returns true
 */
export const isNone = <A>(m: Maybe<A>): boolean => m.isNone();

export const peak = <A>(fn: (x: A) => void) => (m: Maybe<A>): Maybe<A> => m.peak(fn);
export const tap = <A>(fn: (x: A) => void) => (m: Maybe<A>): Maybe<A> => m.tap(fn);
export const matchEffect = <A>(patterns: any) => (m: Maybe<A>): Maybe<A> => m.matchEffect(patterns);
export const when = <A>(patterns: any) => (m: Maybe<A>): Maybe<A> => m.when(patterns);

export const map = <A,B>(fn: (a: A) => B ) => (m: Maybe<A>): Maybe<B> => m.map(fn);
export const fmap = <A,B>(fn: (a: A) => B ) => (m: Maybe<A>): Maybe<B> => m.fmap(fn);
export const mapTo = <A,B>(b: B) => (m: Maybe<A>): Maybe<B> => m.mapTo(b);

export const apply = <A,B>(a: Maybe<(a: A) => B>) => (m: Maybe<A>): Maybe<B> => m.apply(a);
export const applyRight = <A,B>(a: Maybe<(a: A) => B>) => (m: Maybe<A>): Maybe<B> => m.applyRight(a);
export const applyLeft = <B,C>(ap: Maybe<B>) => (m: Maybe<(b: B) => C>): Maybe<C> => m.applyLeft(ap);

export const chain = <A,B>(fn: (a: A) => Maybe<B>) => (m: Maybe<A>): Maybe<B> => m.chain(fn);
export const flatMap = <A,B>(fn: (a: A) => Maybe<B>) => (m: Maybe<A>): Maybe<B> => m.flatMap(fn);
export const join = <A>(m: Maybe<A>): A extends Monad<infer B> ? Maybe<B> : A => m.join();
export const flat = <A>(m: Maybe<A>): A extends Monad<infer B> ? Maybe<B> : A => m.flat();

export const concat = <A>(s: Maybe<A>) => (m: Maybe<A>): Maybe<A> => m.concat(s);
export const sconcat = <A>(s: Maybe<A>) => (m: Maybe<A>): Maybe<A> => m.sconcat(s);

export const empty = <A>(m: Maybe<A>): Maybe<A> => m.empty();

/**
 * If Just and the predicate returns true for the inner value, returns it unchanged.
 * If Just and the predicate returns false for the inner value, returns none.
 * If None, returns None
 * @param fn 
 */
export const filter = <A>(fn: (a: A) => boolean) => (m: Maybe<A>): Maybe<A> => m.filter(fn);

export const equals = <A,B>(e: Maybe<B> | B) => (m: Maybe<A>): boolean => m.equals(e);

export const fold = <A,B,C>(onNone: () => B, onJust: (a: A) => C) => (m: Maybe<A>): B | C => m.fold(onNone,onJust);
/**
 * Success if Just
 * Fail if None
 */
export const toAsync = <A>(m: Maybe<A>): Async<unknown, undefined, A> => m.toAsync()