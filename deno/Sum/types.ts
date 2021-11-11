import type { Eq, FixedEqRep } from "../Union/eq.ts";
import type { FixedEndoFunctor } from "../Union/functor.ts";
import type { FixedMonoid, FixedMonoidRep } from "../Union/monoid.ts";
import type { FixedOrd } from "../Union/ord.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";
import type { Boxed, Extractable, Matcher } from "../_internals/types.ts";

type SumCases = "Sum" | "Zero"

export interface Sum
extends Matcher<SumCases>, FixedEndoFunctor<Sum,number>,
Show, Eq, Thenable<number, 0>, FixedMonoid<Sum,number>, Boxed<number,SumRep,SumCases>,
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