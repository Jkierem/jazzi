import type { IO } from "../IO/types";
import type { Monad } from "../Union/monad";

export * from "./_common"

export const map = <A,B>(fn: (a: A) => B ) => (io: IO<A>): IO<B> => io.map(fn);
export const fmap = <A,B>(fn: (a: A) => B ) => (io: IO<A>): IO<B> => io.fmap(fn);
export const mapTo = <A,B>(b: B) => (io: IO<A>): IO<B> => io.mapTo(b)
export const apply = <A,B>(ap: IO<(a: A) => B>) => (io: IO<A>): IO<B> => io.apply(ap)
export const applyRight = <A,B>(ap: IO<(a: A) => B>) => (io: IO<A>): IO<B> => io.applyRight(ap)
export const applyLeft = <B,C>(ap: IO<B>) => (io: IO<(b: B) => C>,): IO<C> => io.applyLeft(ap);
export const join = <A>(io: IO<A>): A extends Monad<infer B> ? IO<B> : A => io.join();
export const flat = <A>(io: IO<A>): A extends Monad<infer B> ? IO<B> : A => io.flat();
export const chain = <A,B>(fn: (a: A) => IO<B>) => (io: IO<A>): IO<B> => io.chain(fn);
export const flatMap = <A,B>(fn: (a: A) => IO<B>) => (io: IO<A>): IO<B> => io.flatMap(fn);
export const peak = <A>(fn: (x: A) => void) => (io: IO<A>): IO<A> => io.peak(fn);
export const tap = <A>(fn: (x: A) => void) => (io: IO<A>): IO<A> => io.tap(fn);
export const matchEffect = <A>(patterns: any) => (io: IO<A>): IO<A> => io.matchEffect(patterns)
export const when = <A>(patterns: any) => (io: IO<A>): IO<A> => io.when(patterns)
export const run = <A>(io: IO<A>) => io.run()
export const unsafeRun = <A>(io: IO<A>) => io.unsafeRun()