import type { FixedEndoFunctor } from "../Union";
import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";

export interface Min 
extends FixedEndoFunctor<Min,number>, FixedMonoid<Min,number>, 
        Thenable<number, number>, Eq, Show
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