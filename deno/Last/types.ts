import type { Eq, EqRep } from "../Union/eq.ts";
import type { Functor } from "../Union/functor.ts";
import type { FixedMonoid, MonoidRep } from "../Union/monoid.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";

export interface Last<A> 
extends FixedMonoid<Last<A>, A>, Functor<A>, 
        Thenable<A, undefined>, Show, Eq
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