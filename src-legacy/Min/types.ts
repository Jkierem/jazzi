import type { EndoFunctor } from "../Union";
import type { FixedEqRep } from "../Union/eq";
import type { FixedMonoidRep, Monoid } from "../Union/monoid";
import type { Thenable } from "../Union/thenable";

export interface Min 
extends EndoFunctor<number>, Monoid<number>, Thenable<number, number>
{
    map(fn: (a: number) => number ): Min;
    fmap(fn: (a: number) => number ): Min;
    mapTo(b: number): Min;
    concat(x: Min): Min;
    sconcat(x: Min): Min;
    append(x: Min): Min;
    mappend(x: Min): Min;
    empty(): Min;
    equals(m: Min): boolean;
}

export interface MinRep 
extends FixedMonoidRep<Min>, FixedEqRep<Min>
{
    Min(n: number): Min;
    of(n: number): Min;
    from(n: number): Min;
}