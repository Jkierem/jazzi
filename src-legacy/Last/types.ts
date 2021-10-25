import type { Eq, EqRep } from "../Union/eq";
import type { Functor } from "../Union/functor";
import type { Monoid, MonoidRep } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";

export interface Last<A> 
extends Monoid<A>, Functor<A>, 
        Thenable<A, undefined>, Show, Eq
{
    equals(other: Last<A>): boolean;
    map <B>(fn: (a: A) => B): Last<B>;
    fmap<B>(fn: (a: A) => B): Last<B>;
    concat(other: Last<A>): Last<A>;
    sconcat(other: Last<A>): Last<A>;
    append(other: Last<A>): Last<A>;
    mappend(other: Last<A>): Last<A>;
    empty(): Last<A>;
}

export interface LastRep 
extends MonoidRep, EqRep
{
    Last<A>(a: A): Last<A>
    of<A>(a: A): Last<A>
    from<A>(a: A): Last<A>
    empty<A>(): Last<A>
    accumulate<A>(arr: Last<A>[]): Last<A>
    foldMap<A>(as: A[]): Last<A>
}