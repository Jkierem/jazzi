import { defineOverrides, prop, propOr } from "../_internals/mod.ts";

import { setTypeclass } from "../_internals/symbols.ts";

import type { AnyConstRec, AnyFnRec } from "../_internals/types.ts";

import type { Functor } from "./functor.ts";


const mark = setTypeclass("Applicative")

type ApplicativeDefs = {
    trivials: string[], 
    identities: string[],
    pure: string,
    overrides?: {
        apply?: AnyFnRec
    }
}

export interface Applicative<A> extends Functor<A> {
    /**
     * Applies the given applicative (`ap`) with inner value
     * @param ap Applicative to be applied
     * @returns applied Applicative
     */
    apply<B>(ap: Applicative<(a: A) => B>): Applicative<B>;
    /**
     * Applies the given applicative (`ap`) with inner value
     * @param ap Applicative to be applied
     * @returns applied Applicative
     */
    applyRight<B>(ap: Applicative<(a: A) => B>): Applicative<B>;
    /**
     * Applies the value inside the given applicative (`ap`) to the inner value of `this`
     * @param ap Applicative to use for application
     * @returns applied Applicative
     */
    applyLeft<B,C>(this: Applicative<(b: B) => C>,ap: Applicative<B>): Applicative<C>;
}

export interface ApplicativeRep {
    /**
     * Wraps a value of type `a` into an Applicative value `Ap a`
     * @param x value to be wrapped
     */   
    pure<A>(a: A): Applicative<A>;
}

/**
 * Adds apply, applyLeft, applyRight methods to proto
*/
const Applicative = (defs: ApplicativeDefs) => mark((cases: AnyConstRec, globals: any) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const pure = prop("pure")(defs);
    trivials.forEach((trivial: string) => {
        function ap<A,B>(this: Applicative<A>, other: Applicative<(a: A) => B>){
            return (other as any)?.match?.({
                [trivial]: (fn: (a: A) => B) => this.map(fn),
                _: () => other
            }) as unknown as Applicative<B>
        }
        cases[trivial].prototype.apply = ap
        cases[trivial].prototype.applyRight = ap
        cases[trivial].prototype.applyLeft = function apLeft<B,C>(this: Applicative<(b: B) => C>, ap: Applicative<B>){
            return ap.apply(this);
        }
    })
    identities.forEach((empt: keyof typeof cases) => {
        function id(this: any){ return this }
        cases[empt].prototype.apply = id
        cases[empt].prototype.applyRight = id
        cases[empt].prototype.applyLeft = id
    })
    defineOverrides("apply",["applyRight"],overrides,cases)
    globals.pure = (...args: any[]) => new cases[pure](...args)
})

mark(Applicative);

export default Applicative