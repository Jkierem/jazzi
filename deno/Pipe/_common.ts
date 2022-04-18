import type { Thenable, ThenableOf } from "../union/thenable.ts";
import type { LazyShow, LiteralShow, Show } from "../union/show.ts";

type InferShow<A> = 
    A extends LiteralShow<infer T, infer V> ? `[${T} => ${V}]` :
    A extends LazyShow<any, infer V> ? `${V} => _` :
    A extends Show ? string :
    never
export const show = <A extends Show>(value: A) => value.show() as InferShow<A>
export const toString = <A extends Show>(value: A) => value.toString()

type InferToPromise<A> = A extends Thenable<infer Res,any> ? Promise<Res>: never
export const toPromise = <A extends Thenable<any,any>>(value: A) => value.toPromise() as InferToPromise<A> 
type InferToThenable<A> = A extends Thenable<infer Res, infer Rej> ? ThenableOf<Res,Rej>: never
export const toThenable = <A extends Thenable<any,any>>(value: A) => value.toThenable() as InferToThenable<A>