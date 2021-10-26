import type { EqRep } from "../Union/eq";
import type { Functor } from "../Union/functor";
import type { Monoid, MonoidRep } from "../Union/monoid";
import type { Thenable } from "../Union/thenable";
import type { AnyRec, Extractable, Matcher, MatcherRep } from "../_internals/types";

type MergeCases = "Merge" | "Empty"

export interface Merge<A extends AnyRec>
extends Functor<A>, Monoid<A>, 
        Thenable<A, never>, Matcher<MergeCases>
{
    onMerge<B>(fn: Extractable<B,[A]>): B ;
    onEmpty<B>(fn: Extractable<B,[A]>): B ;
    isMerge(): boolean;
    isEmpty(): boolean;
    /**
     * Semigroup combine method. Takes two semigroups and combines them.
     * The combination of a Merge type is shallow object merging
     * @param x 
     */
    concat<B extends AnyRec>(x: Merge<B>): Merge<A & B>;
    /**
     * Semigroup combine method. Takes two semigroups and combines them.
     * The combination of a Merge type is shallow object merging
     * @param x 
     */
    sconcat<B extends AnyRec>(x: Merge<B>): Merge<A & B>;
    append<B extends AnyRec>(x: Merge<B>): Merge<A & B>;
    mappend<B extends AnyRec>(x: Merge<B>): Merge<A & B>;
    empty(): Merge<AnyRec>;
    equals(m: Merge<any>): boolean;
    map <B extends AnyRec>(fn: (a: A) => B): Merge<B>;
    fmap<B extends AnyRec>(fn: (a: A) => B): Merge<B>;
    mapTo<B extends AnyRec>(obj: B): Merge<B>;
}

export interface MergeRep
extends MonoidRep, EqRep, MatcherRep<MergeCases>
{
    Merge<A extends AnyRec>(x: A): Merge<A>;
    Empty<A extends AnyRec>(): Merge<A>;
    /**
     * If {}, returns Empty
     * Otherwise, returns Merge
     * @param {number} x inner value
     */
    of<A extends AnyRec>(x: A): Merge<A>;
    /**
     * If {}, returns Empty
     * Otherwise, returns Merge
     * @param {number} x inner value
     */
    from<A extends AnyRec>(x: A): Merge<A>;
    empty<A extends AnyRec>(): Merge<A>
    accumulate<A extends AnyRec>(arr: Merge<A>[]): Merge<A>;
    foldMap<A extends AnyRec>(as: A[]): Merge<A>;
}