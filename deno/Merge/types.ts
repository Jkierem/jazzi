import type { EqRep } from "../Union/eq.ts";
import type { Functor } from "../Union/functor.ts";
import type { Monoid, MonoidRep } from "../Union/monoid.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";
import type { AnyRec, Boxed, Extractable, Matcher, MatcherRep } from "../_internals/types.ts";

type MergeCases = "Merge" | "Empty"

export interface Merge<A extends AnyRec>
extends Functor<A>, Monoid<A>, 
        Thenable<A, never>, Matcher<MergeCases>, Boxed<A,MergeRep,MergeCases>, Show
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
    /**
     * Transform an Async value through `fn`. It is an alternate way of using jazzi.
     * @param fn 
     */
    pipe<A0>(fn: (self: Merge<A>) => A0): A0;
    /**
     * Terse pipe operator. Transform an Async value through `fn`. It is an alternate way of using jazzi.
     * @param fn 
     */
    ['|>']<A0>(fn: (self: Merge<A>) => A0): A0;
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