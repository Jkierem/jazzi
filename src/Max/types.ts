import type { FixedEndoFunctor } from "../Union";
import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid";
import type { FixedOrd } from "../Union/ord";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import type { Boxed } from "../_internals/types";

export interface Max 
extends FixedEndoFunctor<Max,number>, FixedMonoid<Max,number>, 
        Thenable<number, number>, Eq, Show, Boxed<number,MaxRep,"Max">, FixedOrd<Max>
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