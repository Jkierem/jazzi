import type { FixedEndoFunctor } from "../Union";
import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";

export interface Max 
extends FixedEndoFunctor<Max,number>, FixedMonoid<Max,number>, 
        Thenable<number, number>, Eq, Show
{
    equals(m: Max): boolean;
}

export interface MaxRep 
extends FixedMonoidRep<Max>, FixedEqRep<Max>
{
    Max(n: number): Max;
    of(n: number): Max;
    from(n: number): Max;
}