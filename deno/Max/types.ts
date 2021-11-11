import type { FixedEndoFunctor } from "../Union/mod.ts";
import type { Eq, FixedEqRep } from "../Union/eq.ts";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid.ts";
import type { FixedOrd } from "../Union/ord.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";
import type { Boxed } from "../_internals/types.ts";

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