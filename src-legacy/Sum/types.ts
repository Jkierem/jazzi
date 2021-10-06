import { Eq, EqRep } from "../Union/eq";
import { EndoFunctor } from "../Union/functor";
import { FixedMonoidRep, Monoid } from "../Union/monoid";
import { Show } from "../Union/show";
import { Thenable } from "../Union/thenable";
import { Extractable, Matcher } from "../_internals/types";

type SumCases = "Sum" | "Zero"

export interface Sum
extends Matcher<SumCases>, EndoFunctor<number>,
Show, Eq, Thenable<number, 0>, Monoid<number>
{
    onSum <B>(fn: Extractable<B,[number]>): B ;
    onZero<B>(fn: Extractable<B,[number]>): B ;
    isSum (): boolean;
    isZero(): boolean;

    /**
     * Semigroup combine method. Takes two semigroups and combines them.
     * The combination of a Sum type is addition
     * @param x 
     */
    concat(x: Sum): Sum;

    empty(): Sum;

    equals(m: Sum): boolean;

    map (fn: (a: number) => number): Sum;
    fmap(fn: (a: number) => number): Sum;
    mapTo(n: number): Sum;
}

export interface SumRep 
extends FixedMonoidRep<number>, EqRep {
    Sum(x: number): Sum;
    Zero(): Sum;
    /**
     * If 0, returns Cero
     * Otherwise, returns Sum
     * @param {number} x inner value
     */
    of(x: number): Sum;
    /**
     * If 0, returns Cero
     * Otherwise, returns Sum
     * @param {number} x inner value
     */
    from(x: number): Sum;
    empty(): Sum;
    accumulate(monoids: Sum[]): Sum;
    foldMap(values: number[]): Sum;
    equals(ma: Sum, mb: Sum): boolean;
}