import type { Eq, EqRep } from "../Union/eq";
import type { Functor } from "../Union/functor";
import type { Monoid, MonoidRep } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";

export interface First<A> 
extends Monoid<A>, Functor<A>, 
        Thenable<A, undefined>, Show, Eq
{
    equals(other: First<A>): boolean;
    map <B>(fn: (a: A) => B): First<B>;
    fmap<B>(fn: (a: A) => B): First<B>;
    concat(other: First<A>): First<A>;
    sconcat(other: First<A>): First<A>;
    append(other: First<A>): First<A>;
    mappend(other: First<A>): First<A>;
    empty(): First<A>;
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