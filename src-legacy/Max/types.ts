import type { EndoFunctor } from "../Union";
import type { FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, Monoid } from "../Union/monoid";
import type { Thenable } from "../Union/thenable";

export interface Max 
extends EndoFunctor<number>, Monoid<number>, Thenable<number, number>
{
    map(fn: (a: number) => number ): Max;
    fmap(fn: (a: number) => number ): Max;
    mapTo(b: number): Max;
    concat(x: Max): Max;
    sconcat(x: Max): Max;
    append(x: Max): Max;
    mappend(x: Max): Max;
    empty(): Max;
    equals(m: Max): boolean;
}

export interface MaxRep 
extends FixedMonoidRep<Max>, FixedEqRep<Max>
{
    Max(n: number): Max;
    of(n: number): Max;
    from(n: number): Max;
}