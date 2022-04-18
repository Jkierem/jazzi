import type { Reader } from "../Reader/types.ts";
import type { Monad } from "../Union/monad.ts";

export * from "./_common/mod.ts";

export const map = <R,A,B>(fn: (a: A) => B ) => (r: Reader<R,A>): Reader<R,B> => r.map(fn);
export const fmap = <R,A,B>(fn: (a: A) => B ) => (r: Reader<R,A>): Reader<R,B> => r.fmap(fn);
export const mapTo = <R,A,B>(b: B) => (r: Reader<R,A>): Reader<R,B> => r.mapTo(b);
export const apply = <R,A,B>(ap: Reader<R,(a: A) => B>) => (r: Reader<R,A>): Reader<R,B> => r.apply(ap);
export const applyRight = <R,A,B>(ap: Reader<R,(a: A) => B>) => (r: Reader<R,A>): Reader<R,B> => r.applyRight(ap);
export const applyLeft = <R,B,C>(ap: Reader<R,B>) => (r: Reader<R,(b: B) => C>): Reader<R,C> => r.applyLeft(ap);
export const join = <R,A>(r: Reader<R,A>): A extends Monad<infer B> ? Reader<R,B> : A => r.join();
export const flat = <R,A>(r: Reader<R,A>): A extends Monad<infer B> ? Reader<R,B> : A => r.flat();
export const chain = <R,A,B>(fn: (a: A) => Reader<R,B>) => (r: Reader<R,A>): Reader<R,B> => r.chain(fn);
export const flatMap = <R,A,B>(fn: (a: A) => Reader<R,B>) => (r: Reader<R,A>): Reader<R,B> => r.flatMap(fn);