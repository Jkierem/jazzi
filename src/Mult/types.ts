import type { FixedEndoFunctor } from "../Union";
import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedMonoid, FixedMonoidRep } from "../Union/monoid";
import type { FixedOrd } from "../Union/ord";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import type { Boxed, Extractable, Matcher } from "../_internals/types";

type MultCases = "Mult" | "One"

export interface Mult 
extends FixedMonoid<Mult,number>, 
        FixedEndoFunctor<Mult,number>,
        Eq, Thenable<number,1>, Show, Matcher<MultCases>, Boxed<number>, FixedOrd<Mult>
{
    onMult<B>(fn: Extractable<B,[number]>): B;
    onOne<B>(fn: Extractable<B,[number]>): B;
    isMult(): boolean;
    isOne(): boolean;
    equals(m: Mult): boolean;
}

export interface MultRep 
extends FixedMonoidRep<Mult>, FixedEqRep<Mult>
{
    Mult(n: number): Mult;
    One(): Mult;
    /**
     * If 1, returns One
     * Mult otherwise
     * @param n 
     */
    of(n: number): Mult;
    /**
     * If 1, returns One
     * Mult otherwise
     * @param n 
     */
    from(n: number): Mult;
}