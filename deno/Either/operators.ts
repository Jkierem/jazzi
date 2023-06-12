import { fromEither } from "../Async/mod.ts";

import { Just, None } from "../Maybe/constructors.ts";

import * as S from "../_internals/symbols.ts";

import { ThenableOf } from "../_internals/types.ts";

import { Either, Right, Left } from "./constructors.ts";


export const isRight = <L,R>(self: Either<L,R>): self is Right<R> => S.getVariant(self) === "Right";

export const isLeft = <L,R>(self: Either<L,R>): self is Left<L> => S.getVariant(self) === "Left";

type Narrow<T> = 
    T extends Right<infer R> ? R :
    T extends Left<infer L> ? L :
    undefined

export const get = <M extends Either<any, any>>(self: M) => S.getValue(self) as Narrow<M>

export const getOr = <L>(or: () => L) => <R>(self: Either<unknown, R>) => isRight(self) ? get(self) : or();

export const getLeftOr = <R>(or: () => R) => <L>(self: Either<L, unknown>) => isLeft(self) ? get(self) : or();

export const fold = <L,R,L0,R0>(onLeft: (l: L) => L0, onRight: (r: R) => R0) => (self: Either<L,R>) => isRight(self) 
    ? onRight(get(self) as R)
    : onLeft(get(self))

export const swap = <L,R>(self: Either<L,R>): Either<R,L> => self["|>"](fold(
    (l: L) => Right<L>(l), 
    (r: R) => Left<R>(r)
))

export const map = <R,B>(fn: (r: R) => B) => <L>(self: Either<L,R>): Either<L,B> => isRight(self) 
    ? Right(fn(get(self) as R) as B) 
    : Left(get(self) as L)

export const chain = <L0,R,R0>(fn: (r: R) => Either<L0, R0>) => <L>(self: Either<L,R>): Either<L0 | L, R0> => isRight(self) 
    ? fn(get(self) as R) 
    : Left(get(self) as L)

export const mapLeft = <L,B>(fn: (l: L) => B) => <R>(self: Either<L,R>): Either<B,R> => isRight(self) 
    ? Right(get(self))
    : Left(fn(get(self)))

export const mapTo = <B>(b: B) => <L,R>(self: Either<L,R>) => self["|>"](map(() => b))

export const mapLeftTo = <B>(b: B) => <L,R>(self: Either<L,R>) => self["|>"](mapLeft(() => b))

export type Pattern<L,R,A,B> = {
    Left: (l: L) => A,
    Right: (r: R) => B
}

export const match = <L,R,A,B>({ Left, Right }: Pattern<L,R,A,B>) => fold(Left, Right)

export const show = <L,R>(self: Either<L,R>) => fold(
    l => `[Either => Left => ${l}]`,
    r => `[Either => Right => ${r}]`
)(self)

export const tap = <R>(fn: (r: R) => void) => chain((r: R) => (fn(r), Right(r)))

export const zipWith = <A,B,C>(fn: (a: A, b: B) => C) => 
    <L0>(other: Either<L0, B>) => 
    <L1>(self: Either<L1, A>) => self["|>"](chain(a => other["|>"](map(b => fn(a,b)))))

export const zip = <L0,R0>(other: Either<L0, R0>) => <L,R>(self: Either<L,R>) => 
    self["|>"](zipWith<R, R0, [R, R0]>((a,b) => [a,b])(other))

export const zipLeft = <L0,R0>(other: Either<L0, R0>) => <L,R>(self: Either<L,R>) => 
    self["|>"](zip(other))["|>"](map<[R,R0], R>(([a]) => a))

export const zipRight = <L0,R0>(other: Either<L0, R0>) => <L,R>(self: Either<L,R>) => 
    self["|>"](zip(other))["|>"](map<[R,R0], R0>(([_,b]) => b))

export const toPromise = <L,R>(self: Either<L,R>) => self["|>"](fold(
    (l: L) => Promise.reject(l),
    (r: R) => Promise.resolve(r),
)) as Promise<Awaited<R>>

export const toThenable = <L,R>(self: Either<L,R>): ThenableOf<R,L> => ({
    then(onResolve: (r: R) => void, onReject = (x: L)=>x) {
        self["|>"](fold(onReject, onResolve))
    },
    catch(onReject: (l: L) => void) {
        self["|>"](fold(onReject, x => x))
    },
})

export const toMaybe = <L,R>(self: Either<L,R>) => fold(
    (_: L) => None<R>(), 
    (r: R) => Just<R>(r)
)(self) 

export const toAsync = <L,R>(self: Either<L,R>) => fromEither(self)