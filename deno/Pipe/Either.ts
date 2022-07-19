import type { Async } from "../Async/types.ts";

import type { Either } from "../Either/types.ts";

import type { Monad } from "../Union/monad.ts";

import type { Extractable } from "../_internals/types.ts";


export * from "./_common/mod.ts";


export const get = <L,R>(e: Either<L,R>): R | L => e.get()
export const getRight = <L,R>(e: Either<L,R>): R => e.getRight();
export const getRightOr = <L,R,B>(or: Extractable<B>) => (e: Either<L,R>): R | B => e.getRightOr(or);
export const getLeft = <L,R>(e: Either<L,R>): L => e.getLeft();
export const getLeftOr = <L,R,B>(or: Extractable<B>) => (e: Either<L,R>) : L | B => e.getLeftOr(or);
export const getEither = <L,R>(e: Either<L,R>): L | R => e.getEither();

export const onRight = <L,R,B>(fn: B | ((x: R) => B)) => (e: Either<L,R>): B => e.onRight(fn);
export const onLeft =  <L,R,B>(fn: B | ((x: L) => B)) => (e: Either<L,R>): B => e.onLeft(fn);
export const ifRight = <L,R,B>(fn: (x: R) => Either<L,B>) => (e: Either<L,R>): Either<B,R> => e.ifRight(fn);
export const ifLeft =  <L,R,B>(fn: (x: L) => Either<B,R>) => (e: Either<L,R>): Either<L,B> => e.ifLeft(fn);
export const isRight = <L,R>(e: Either<L,R>): boolean => e.isRight();
export const isLeft = <L,R>(e: Either<L,R>): boolean => e.isLeft();
export const map = <L,R,B>(fn: (a: R) => B) => (e: Either<L,R>): Either<L,B> => e.map(fn);
export const fmap = <L,R,B>(fn: (a: R) => B) => (e: Either<L,R>): Either<L,B> => e.fmap(fn);
export const mapTo = <L,R,B>(b: B) => (e: Either<L,R>): Either<L,B> => e.mapTo(b)
export const mapRight = <L,R,B>(fn: (a: R) => B) => (e: Either<L,R>): Either<L,B> => e.mapRight(fn)
export const mapError = <L,R,B>(fn: (a: L) => B) => (e: Either<L,R>): Either<B,R> => e.mapError(fn)
export const mapLeft = <L,R,B>(fn: (a: L) => B) => (e: Either<L,R>): Either<B,R> => e.mapLeft(fn)
export const swap = <L,R>(e: Either<L,R>): Either<R,L> => e.swap()
export const swapIf = <L,R>(fn: (a: R) => boolean) => (e: Either<L,R>): Either<R | L,L | R> => e.swapIf(fn)
export const swapOn = <L,R>(fn: (a: R) => boolean) => (e: Either<L,R>): Either<R | L,L | R> => e.swapOn(fn)
/**
 * If Left, calls the first function with inner value.
 * If Right, calls the second function with inner value.
 */
export const fold = <L,R,B>(onLeft: (x:L) => B, onRight:(x: R) => B) => (e: Either<L,R>): B => e.fold(onLeft,onRight);
export const chain = <L,R,B>(fn : (x: R) => Either<L,B>) => (e: Either<L,R>): Either<L,B> => e.chain(fn);
export const flatMap = <L,R,B>(fn : (x: R) => Either<L,B>) => (e: Either<L,R>): Either<L,B> => e.flatMap(fn);
export const join = <L,R>(e: Either<L,R>): R extends Monad<infer B> ? Either<L,B> : R => e.join();
export const flat = <L,R>(e: Either<L,R>): R extends Monad<infer B> ? Either<L,B> : R => e.flat();
export const apply = <L,R,B>(ap: Either<any,(a: R) => B>) => (e: Either<L,R>): Either<L,B> => e.apply(ap);
export const applyRight = <L,R,B>(ap: Either<any,(a: R) => B>) => (e: Either<L,R>): Either<L,B> => e.applyRight(ap);
export const applyLeft = <L,B,C>(ap: Either<L,B>) => (e: Either<L,(b: B) => C>): Either<L,C> => e.applyLeft(ap)
/**
 * Success on Right
 * Fail on Left
 */
export const toAsync = <L,R>(e: Either<L,R>): Async<unknown, L, R> => e.toAsync();