import { Eq, FixedEqRep } from "../Union/eq";
import { FixedEndoFunctor } from "../Union/functor";
import { FixedMonoid, FixedMonoidRep } from "../Union/monoid";
import { Show } from "../Union/show";
import { Thenable } from "../Union/thenable";
import { Extractable, Matcher } from "../_internals/types";

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