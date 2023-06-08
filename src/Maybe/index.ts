import * as S from "../_internals/symbols"
import { Key, ThenableOf, Pipeable } from "../_internals/types";
import { isEmpty, isNil } from "../_internals/functions";
import { baseObject } from "../_internals";

const MaybeT: unique symbol = Symbol("Maybe")
const JustV = "Just"
const NoneV = "None"

type Type = typeof MaybeT;
type Variant = typeof JustV | typeof NoneV;

type MaybeHelper<A, V extends Key> = 
    & S.WithValue<A> 
    & S.WithVariant<V>
    & S.WithType<Type>
    & ThenableOf<A, undefined>
    & Pipeable

export type None = MaybeHelper<undefined, typeof NoneV>;
export type Just<A> = MaybeHelper<A, typeof JustV>;
export type Maybe<A> = Just<A> | None

const build = <A>(a: A | undefined, vari: Variant) => {
    const base = baseObject({
        then(this: Maybe<A> , onResolve: (value: A) => void, onReject?: () => void): void {
            if(isJust(this)){
                onResolve(get(this));
            } else {
                onReject?.();
            }
        },
        catch(this: Maybe<A>, onReject: () => void): void {
            if(isNone(this)){
                onReject();
            }
        }
    })
    const value = S.setValue(a);
    const mtype = S.setType(MaybeT);
    const variant = S.setVariant(vari);
    return value(mtype(variant(base))) as Maybe<A>;
}

export const Just = <A>(data: A): Maybe<A> => build<A>(data, JustV);

export const None = <A>() => build<A>(undefined, NoneV);

export const of = <A>(data: A) => data ? None<A>() : Just(data);

export const from = of

export const fromFalsy = of

export const fromNullish = <A>(data: A | undefined | null) => isNil(data) ? None<A>() : Just(data)

export const fromEmpty = <A>(data: A[]) => isEmpty(data) ? None<A[]>() : Just(data);

export const fromCondition = <A>(cond: (a: A) => boolean) => (data: A) => cond(data) ? Just(data) : None<A>();

export const fromBoolean = fromCondition<boolean>(Boolean)

export const isJust = <A>(self: Maybe<A>): self is Just<A> => S.getVariant(self) === "Just"

export const isNone = <A>(self: Maybe<A>): self is None => S.getVariant(self) === "None"

export const get = <M extends Maybe<any>>(self: M): M extends Just<infer A> ? A : undefined => S.getValue(self as Maybe<any>);

export const fold = <A,L,R>(onNone: () => L, onJust: (data: A) => R) => (self: Maybe<A>) => {
    if( isJust(self) ){
        return onJust(get(self));
    } else {
        return onNone();
    }
}

type Pattern<A,B,C> = {
    Just: (a: A) => B,
    None: () => C
}

export const match = <A,B,C>({ Just, None }: Pattern<A,B,C>) => fold(None, Just);

export const show = <A>(self: Maybe<A>) => fold(
    () => "[Maybe => None]",
    (data) => `[Maybe => Just => ${data}]`
)(self)

export const map = <A,B>(fn: (a: A) => B) => fold(
    None<B>,
    (a: A) => Just<B>(fn(a))
)

export const chain = <A,B>(fn: (a: A) => Maybe<B>) => fold(None<B>, fn)

export const tap = <A>(fn: (data: A) => void) => chain((a: A) => (fn(a), Just(a)))

export const mapTo = <B>(c: B) => map(() => c)

export const zipWith = <A,B,C>(fn: (a: A, b: B) => C) => (b: Maybe<B>) => (self: Maybe<A>) => {
    return self["|>"](chain(x => b["|>"](map(y => fn(x,y)))))
}

export const zip = <B>(other: Maybe<B>) => <A>(self: Maybe<A>) => zipWith((a,b) => [a,b] as [A,B])(other)(self)

export const zipLeft = <B>(other: Maybe<B>) => <A>(self: Maybe<A>) => self["|>"](zip(other))["|>"](map(([a]) => a))

export const zipRight = <B>(other: Maybe<B>) => <A>(self: Maybe<A>) => self["|>"](zip(other))["|>"](map(([_,b]) => b))

export const toPromise = <A>(self: Maybe<A>) => fold(
    () => Promise.reject<A>() as Promise<Awaited<A>>, 
    (a: A) => Promise.resolve(a)
)(self)

/** TODO: Implement */
export const toAsync = <A>(self: A): any => ({} as any)