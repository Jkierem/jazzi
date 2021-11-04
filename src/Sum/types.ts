import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedEndoFunctor } from "../Union/functor";
import type { FixedMonoid, FixedMonoidRep } from "../Union/monoid";
import type { FixedOrd } from "../Union/ord";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import type { Boxed, Extractable, Matcher } from "../_internals/types";

type SumCases = "Sum" | "Zero"

export interface Sum
extends Matcher<SumCases>, FixedEndoFunctor<Sum,number>,
Show, Eq, Thenable<number, 0>, FixedMonoid<Sum,number>, Boxed<number>,
FixedOrd<Sum>
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