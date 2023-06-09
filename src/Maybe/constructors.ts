import * as S from "../_internals/symbols"
import { Key, Pipeable } from "../_internals/types";
import { isEmpty, isNil } from "../_internals/functions";
import { baseObject } from "../_internals";

const MaybeT: unique symbol = Symbol("Maybe")
const JustV = "Just"
const NoneV = "None"

type Type = typeof MaybeT;
type Variant = typeof JustV | typeof NoneV;

type Base<A, V extends Key> = 
    & S.WithValue<A> 
    & S.WithVariant<V>
    & S.WithType<Type>
    & Pipeable

export type None = Base<undefined, typeof NoneV>;
export type Just<A> = Base<A, typeof JustV>;
export type Maybe<A> = Just<A> | None

const build = <A>(a: A | undefined, vari: Variant) => {
    const base = baseObject({})
    const value = S.setValue(a);
    const mtype = S.setType(MaybeT);
    const variant = S.setVariant(vari);
    return value(mtype(variant(base))) as Maybe<A>;
}

export const Just = <A>(data: A): Maybe<A> => build<A>(data, JustV);

export const None = <A>() => build<A>(undefined, NoneV);

export const of = <A>(data: A) => data ? Just(data): None<A>();

export const from = of

export const fromFalsy = of

export const fromNullish = <A>(data: A | undefined | null) => isNil(data) ? None<A>() : Just(data)

export const fromEmpty = <A>(data: A[]) => isEmpty(data) ? None<A[]>() : Just(data);

export const fromCondition = <A>(cond: (a: A) => boolean) => (data: A) => cond(data) ? Just(data) : None<A>();

export const fromBoolean = fromCondition<boolean>(Boolean)