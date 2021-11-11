import type { FixedEndoFunctor } from "../Union/mod.ts";
import type { Eq, FixedEqRep } from "../Union/eq.ts";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid.ts";
import type { FixedOrd } from "../Union/ord.ts";
import type { Show } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";
import { Boxed } from "../_internals/types.ts";

export interface Min 
extends FixedEndoFunctor<Min,number>, FixedMonoid<Min,number>, 
        Thenable<number, number>, Eq, Show, Boxed<number,MinRep,"Min">, FixedOrd<Min>
{
    equals(m: Min): boolean;
}

export interface MinRep 
extends FixedMonoidRep<Min>, FixedEqRep<Min>
{
    Min(n: number): Min;
    of(n: number): Min;
    from(n: number): Min;
}