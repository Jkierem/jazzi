import type { Box, Nil } from "../_internals/types";
import { Show } from "../union/show"
import { isEmpty, isNil } from "../_internals/functions";
import { Eq } from "../union/eq";
import { getVariant } from "../_internals/symbols";
import { alias, Builder } from "../_internals/builder";
import { Foldable } from "../union/foldable";
import { Thenable } from "../union/thenable";

const maybeCases = ["Just" , "None"] as const

type MaybeCases = typeof maybeCases[number]

type BoxedMaybe<A> = Box<"Maybe",MaybeCases,A>

export type Maybe<A> = BoxedMaybe<A> 
    & Show 
    & Eq<"Maybe">
    & Foldable<undefined, A>
    & Thenable<A>
    & { 
        fmap: <B>(fn: (a: A) => B) => Maybe<B>,
        map: <B>(fn: (a: A) => B) => Maybe<B>,
        
        join: () => A,
        flat: () => A,
        chain: <B>(fn: (a: A) => Maybe<B>) => Maybe<B>,
        bind: <B>(fn: (a: A) => Maybe<B>) => Maybe<B>,
        flatMap: <B>(fn: (a: A) => Maybe<B>) => Maybe<B>,

        tap: (fn: (a: A) => void) => Maybe<A>,
        peak: (fn: (a: A) => void) => Maybe<A>,
        effect: <B>(fn: (a: A) => Maybe<B>) => Maybe<A>,
    }

const maybeBuilder = Builder("Maybe", maybeCases)

export const Just = <A>(a: A): Maybe<A> => {
    return maybeBuilder
        .forVariant("Just",a)
        .mixWith({
            fmap: <B>(fn: (a: A) => B) => {
                return Just(fn(a))
            },
            chain<B>(fn: (a: A) => Maybe<B>){
                return fn(a)
            },
            tap: (fn: (a: A) => void) => {
                fn(a);
                return Just(a) 
            },
            effect: <B>(fn: (a: A) => Maybe<B>) => {
                return fn(a).map(() => a)
            },
            peak: alias("tap"),
            map: alias("fmap"),
            bind: alias("chain"),
            flatMap: alias("chain"),
            join: alias("get"),
            flat: alias("get")
        })
        .mix(Thenable())
        .mix(Foldable())
        .mix(Eq())
        .mix(Show())
        .finish()
}

export const None = <A>(): Maybe<A> => {
    return maybeBuilder
        .forVariant("None", undefined as unknown as A)
        .mixWith({
            fmap<B>(_fn: (a: A) => B){ return this as unknown as Maybe<B> },
            chain<B>(_fn: (a: A) => Maybe<B>){ return this as unknown as Maybe<B> },
            tap: alias("fmap"),
            peak: alias("tap"),
            effect: alias("chain"),
            map: alias("fmap"),
            bind: alias("chain"),
            flatMap: alias("chain"),
            join: alias("get"),
            flat: alias("get")
        })
        .mix(Thenable("Reject"))
        .mix(Foldable("Left"))
        .mix(Eq((other) => getVariant(other) === "None"))
        .mix(Show(() => `[Maybe => None]`))
        .finish()
}

export const fromFalsy = <A>(a: A): Maybe<A> => a ? Just(a) : None<A>()
export const fromNullish = <A>(a: A | Nil): Maybe<A> => isNil(a) ? None<A>() : Just(a)
export const fromEmpty = <A>(a: A): Maybe<A> => isEmpty(a) ? Just(a) : None<A>()
export const fromPredicate = <A>(pred: (a: A) => boolean, a: A): Maybe<A> => pred(a) ? Just(a) : None<A>()
export const of = <A>(a: A): Maybe<A> => Just(a)

export const Maybe = {
    Just, None, 
    of, fromNullish, fromEmpty,
    fromFalsy, fromPredicate
}