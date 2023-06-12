import * as S from "../_internals/symbols";
import { Key, Pipeable } from "../_internals/types";
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