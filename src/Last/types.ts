import type { Eq, EqRep } from "../Union/eq";
import type { Functor } from "../Union/functor";
import type { FixedMonoid, MonoidRep } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import type { Boxed } from "../_internals/types";

export interface Last<A> 
extends FixedMonoid<Last<A>, A>, Functor<A>, 
        Thenable<A, undefined>, Show, Eq, Boxed<A,LastRep,"Last">
{
    map <B>(fn: (a: A) => B): Last<B>;
    fmap<B>(fn: (a: A) => B): Last<B>;
    mapTo<B>(b: B): Last<B>;
    equals(other: Last<any>): boolean;
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