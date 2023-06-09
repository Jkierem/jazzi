import * as S from "../_internals/symbols";
import { Key, ThenableOf, Pipeable } from "../_internals/types";
import { isNil } from "../_internals/functions";
import { baseObject } from "../_internals";

const EitherT: unique symbol = Symbol("Either")
const LeftV = "Left"
const RightV = "Right"

type Type = typeof EitherT;
type Variant = typeof LeftV | typeof RightV;

type Base<A, V extends Key> = 
    & S.WithValue<A> 
    & S.WithVariant<V>
    & S.WithType<Type>
    & Pipeable

export type Left<L> = Base<L, typeof LeftV>;
export type Right<R> = Base<R, typeof RightV>;
export type Either<L,R> = Left<L> | Right<R>;

const build = <L,R>(a: L|R, vari: Variant) => {
    const base = baseObject({})
    const value = S.setValue(a);
    const mtype = S.setType(EitherT);
    const variant = S.setVariant(vari);
    return value(mtype(variant(base))) as Either<L,R>;
}

export const Left  = <L>(l: L) => build<L, never>(l, LeftV);

export const Right = <R>(r: R) => build<never, R>(r, RightV);

export const of = <R>(r: R) => build<R, NonNullable<R>>(r, isNil(r) ? LeftV : RightV);

export const from = <L,R>(l: L, r: R) => {
    const isN = isNil(r);
    return build<L, NonNullable<R>>( isN ? l : r as NonNullable<R>,  isN ? LeftV : RightV);
};

export const fromNullish = from;

export const fromFalsy = <L,R>(l: L, r: R): Either<L,R> => r ? Right(r) : Left(l);

export const fromPredicate = <L, R extends L>(pred: (r: L) => r is R, r: L): Either<L,R> => pred(r) ? Right(r) : Left(r)

export const fromCondition = <R>(pred: (r: R) => boolean, r: R): Either<R,R> => pred(r) ? Right(r) : Left(r);

export const defaultTo = <L>(l: L) => <R>(r: R) => from(l, r);

export const attemptR = <Args, E=never, R=unknown>(fn: (...args: Args[]) => R, ...args: Args[]): Either<E,R> => {
    try {
        return Right(fn(...args))
    } catch(e: unknown){
        return Left(e as E);
    }
}

export const attempt = <E=never, R=unknown>(fn: () => R): Either<E,R> => attemptR(fn)

export const asyncAttempt = <E=never, R=unknown>(
    fn: () => Promise<Awaited<R>>
): Promise<Either<E, Awaited<R>>> => asyncAttemptR(fn)

export const asyncAttemptR = async <Args, E=never, R=unknown>(
    fn: (...args: Args[]) => Promise<Awaited<R>>, 
    ...args: Args[]
) => {
    try {
        return Right(await fn(...args)) as Either<E, Awaited<R>>
    } catch(e: unknown){
        return Left(e as E) as Either<E, Awaited<R>>
    }
}

export const isRight = <L,R>(self: Either<L,R>): self is Right<R> => S.getVariant(self) === RightV;

export const isLeft = <L,R>(self: Either<L,R>): self is Left<L> => S.getVariant(self) === LeftV;

type Narrow<T> = 
    T extends Right<infer R> ? R :
    T extends Left<infer L> ? L :
    undefined

export const get = <M extends Either<any, any>>(self: M) => S.getValue(self) as Narrow<M>

export const getOr = <L>(or: () => L) => <R>(self: Either<unknown, R>) => isRight(self) ? get(self) : or();

export const getLeftOr = <R>(or: () => R) => <L>(self: Either<L, unknown>) => isLeft(self) ? get(self) : or();

export const fold = <L,R,L0,R0>(onLeft: (l: L) => L0, onRight: (r: R) => R0) => (self: Either<L,R>) => isRight(self) 
    ? onRight(get(self))
    : onLeft(get(self))

export const swap = <L,R>(self: Either<L,R>): Either<R,L> => self["|>"](fold(Right<L>, Left<R>))

export const map = <R,B>(fn: (r: R) => B) => <L>(self: Either<L,R>): Either<L,B> => isRight(self) 
    ? Right(fn(get(self))) 
    : Left(get(self))

export const chain = <L0,R,R0>(fn: (r: R) => Either<L0, R0>) => <L>(self: Either<L,R>): Either<L0 | L, R0> => isRight(self) 
    ? fn(get(self)) 
    : Left(get(self))

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
    self["|>"](zip(other))["|>"](map(([a]) => a))

export const zipRight = <L0,R0>(other: Either<L0, R0>) => <L,R>(self: Either<L,R>) => 
    self["|>"](zip(other))["|>"](map(([_,b]) => b))

export const toPromise = <L,R>(self: Either<L,R>) => self["|>"](fold(
    (l: L) => Promise.reject(l),
    (r: R) => Promise.resolve(r),
)) as Promise<Awaited<R>>

export const toThenable = <L,R>(self: Either<L,R>): ThenableOf<R,L> => ({
    then(onResolve, onReject = x=>x) {
        self["|>"](fold(onReject, onResolve))
    },
    catch(onReject) {
        self["|>"](fold(onReject, x => x))
    },
})

/** TODO */
export const toAsync = () => ({})