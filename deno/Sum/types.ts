import { Eq, FixedEqRep } from "../Union/eq.ts";
import { FixedEndoFunctor } from "../Union/functor.ts";
import { FixedMonoid, FixedMonoidRep } from "../Union/monoid.ts";
import { Show } from "../Union/show.ts";
import { Thenable } from "../Union/thenable.ts";
import { Extractable, Matcher } from "../_internals/types.ts";

type SumCases = "Sum" | "Zero"

export interface Sum
extends Matcher<SumCases>, FixedEndoFunctor<Sum,number>,
Show, Eq, Thenable<number, 0>, FixedMonoid<Sum,number>
{
    onSum <B>(fn: Extractable<B,[number]>): B ;
    onZero<B>(fn: Extractable<B,[number]>): B ;
    isSum (): boolean;
    isZero(): boolean;
    equals(m: Sum): boolean;
}

export interface SumRep 
extends FixedMonoidRep<Sum>, FixedEqRep<Sum> {
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
}