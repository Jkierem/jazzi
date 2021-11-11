import type { FixedEndoFunctor } from "../Union/mod.ts";
import type { Eq, FixedEqRep } from "../Union/eq.ts";
import type { FixedMonoid, FixedMonoidRep } from "../Union/monoid.ts";
import type { FixedOrd } from "../Union/ord.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";
import type { Boxed, Extractable, Matcher } from "../_internals/types.ts";

type MultCases = "Mult" | "One"

export interface Mult 
extends FixedMonoid<Mult,number>, 
        FixedEndoFunctor<Mult,number>,
        Eq, Thenable<number,1>, Show, Matcher<MultCases>, Boxed<number,MultRep,MultCases>, FixedOrd<Mult>
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