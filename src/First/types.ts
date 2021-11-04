import type { Eq, EqRep } from "../Union/eq";
import type { Functor } from "../Union/functor";
import type { FixedMonoid, MonoidRep } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import { Boxed } from "../_internals/types";

export interface First<A> 
extends FixedMonoid<First<A>,A>, Functor<A>, 
        Thenable<A, undefined>, Show, Eq, Boxed<A>
{
    equals(other: First<A>): boolean;
    map <B>(fn: (a: A) => B): First<B>;
    fmap<B>(fn: (a: A) => B): First<B>;
    mapTo<B>(b: B): First<B>;
}

export interface FirstRep 
extends MonoidRep, EqRep
{
    First<A>(a: A): First<A>
    of<A>(a: A): First<A>
    from<A>(a: A): First<A>
    empty<A>(): First<A>
    accumulate<A>(arr: First<A>[]): First<A>;
    foldMap<A>(as: A[]): First<A>;
}