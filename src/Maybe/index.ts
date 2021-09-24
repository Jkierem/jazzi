import type { Box, Nil } from "../_internals/types";
import { Show } from "../union/show"
import { isNil } from "../_internals/functions";
import { Eq } from "../union/eq";
import { getVariant } from "../_internals/symbols";
import { Builder } from "../_internals/builder";
import { Functor } from "../union/functor";

const maybeCases = ["Just" , "None"] as const

type MaybeCases = typeof maybeCases[number]

type BoxedMaybe<A> = Box<"Maybe",MaybeCases,A>

export type Maybe<A> = BoxedMaybe<A> 
    & Show 
    & Eq<"Maybe"> 
    & { map: <B>(fn: (a: A) => B) => Maybe<B> }
    & { chain: <B>(fn: (a: A) => Maybe<B>) => Maybe<B> }

const maybeBuilder = Builder("Maybe", maybeCases)

export const Just = <A>(a: A): Maybe<A> => {
    return maybeBuilder
        .forVariant("Just",a)
        .mix(base => {
            return {
                ...base,
                map: <B>(fn: (a: A) => B) => {
                    return Just(fn(a))
                },
                chain: <B>(fn: (a: A) => Maybe<B>) => {
                    return fn(a)
                }
            }
        })
        .mix(Eq())
        .mix(Show())
        .finish()
}

export const None = <A>(): Maybe<A> => {
    return maybeBuilder
        .forVariant("None", undefined as unknown as A)
        .mix(Eq((other) => getVariant(other) === "None"))
        .mix(Show(() => `[Maybe => None]`))
        .finish()
}

export const fromNullish = <A>(a: A | Nil): Maybe<A> => isNil(a) ? None<A>() : Just(a)

export const Maybe = {
    Just, None, fromNullish
}

const f = Just(42)