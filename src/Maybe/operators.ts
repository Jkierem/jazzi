import { Either, Left, Right } from "../Either/constructors";
import * as S from "../_internals/symbols"
import { ThenableOf } from "../_internals/types";
import { Just, Maybe, None } from "./constructors";

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

export type Pattern<A,B,C> = {
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

export const toThenable = <A>(self: Maybe<A>): ThenableOf<A, undefined> => ({
    then(onResolve: (value: A) => void, onReject?: (val: undefined) => void): void {
        if(isJust(self)){
            onResolve(get(self));
        } else {
            onReject?.(undefined);
        }
    },
    catch(onReject: (va: undefined) => void): void {
        if(isNone(self)){
            onReject(undefined);
        }
    }
})

export const toEither = <A>(self: Maybe<A>): Either<undefined, A> => fold(() => Left(undefined), Right)(self)

/** TODO: Implement */
export const toAsync = <A>(self: A): any => ({} as any)