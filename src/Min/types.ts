import type { FixedEndoFunctor } from "../Union";
import type { Eq, FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, FixedMonoid } from "../Union/monoid";
import type { FixedOrd } from "../Union/ord";
import type { Show } from "../Union/show";
import type { Thenable } from "../Union/thenable";
import { Boxed } from "../_internals/types";

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