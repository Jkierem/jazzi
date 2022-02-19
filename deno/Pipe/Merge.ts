import type { Merge } from "../Merge/types.ts";

import type { AnyRec, Extractable } from "../_internals/types.ts";


export * from "./_common/mod.ts";


export const onMerge = <A,B>(fn: Extractable<B,[A]>) => (m: Merge<A>): B  => m.onMerge(fn);
export const onEmpty = <A,B>(fn: Extractable<B,[A]>) => (m: Merge<A>): B  => m.onEmpty(fn);
export const isMerge = <A>(m: Merge<A>): boolean => m.isMerge();
export const isEmpty = <A>(m: Merge<A>): boolean => m.isEmpty();
/**
 * Semigroup combine method. Takes two semigroups and combines them.
 * The combination of a Merge type is shallow object merging
 * @param x 
 */
export const concat = <A,B extends AnyRec>(x: Merge<B>) => (m: Merge<A>): Merge<A & B> => m.concat(x);
/**
 * Semigroup combine method. Takes two semigroups and combines them.
 * The combination of a Merge type is shallow object merging
 * @param x 
 */
export const sconcat = <A,B extends AnyRec>(x: Merge<B>) => (m: Merge<A>): Merge<A & B> => m.sconcat(x);

export const append = <A,B extends AnyRec>(x: Merge<B>) => (m: Merge<A>): Merge<A & B> => m.append(x);
export const mappend = <A,B extends AnyRec>(x: Merge<B>) => (m: Merge<A>): Merge<A & B> => m.mappend(x);
export const empty = <A>(m: Merge<A>): Merge<AnyRec> => m.empty();
export const equals = (m0: Merge<any>) => <A>(m: Merge<A>): boolean => m.equals(m0);
export const map  = <A,B extends AnyRec>(fn: (a: A) => B) => (m: Merge<A>): Merge<B> => m.map(fn);
export const fmap = <A,B extends AnyRec>(fn: (a: A) => B) => (m: Merge<A>): Merge<B> => m.fmap(fn);
export const mapTo = <A,B extends AnyRec>(obj: B) => (m: Merge<A>): Merge<B> => m.mapTo(obj);