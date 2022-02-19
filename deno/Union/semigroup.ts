import { forEachValue, propOr } from "../_internals/mod.ts";

import { setTypeclass, getVariant } from "../_internals/symbols.ts";

import type { AnyConstRec, AnyFnRec, Boxed } from "../_internals/types.ts";


type SemigroupDefs = {
    trivials: string[], 
    identities: string[],
    overrides?: {
        concat?: AnyFnRec
    }
}

export interface Semigroup<A> {
    /**
     * Semigroup combine method. Takes two semigroups and combines them
     * @param {Semigroup<A>} s Semigroup to be combined
     */
    concat(s: Semigroup<A>): Semigroup<A>
    /**
     * Semigroup combine method. Takes two semigroups and combines them
     * @param {Semigroup<A>} s Semigroup to be combined
     */
    sconcat(s: Semigroup<A>): Semigroup<A>
}

export interface FixedSemigroup<Outer extends Semigroup<Inner>, Inner> 
        extends Semigroup<Inner> 
{
    concat(s: Outer): Outer
    sconcat(s: Outer): Outer
}

/**
 * Adds concat method to proto
 */
const Semigroup = (defs: SemigroupDefs) => setTypeclass("Semigroup")((cases: AnyConstRec) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function concat<A,SA extends Semigroup<A>>(this: Semigroup<SA> & Boxed<SA>, m: Semigroup<SA> & Boxed<SA>){
            const mVar = getVariant(m)
            if( mVar !== trivial ){
                return this
            }
            return new cases[trivial](this.get().concat(m.get())) as Semigroup<SA>
        }
        cases[trivial].prototype.concat = concat
        cases[trivial].prototype.sconcat = concat
    })
    identities.forEach(empt => {
        function concat<A>(m: Semigroup<A>){
            return m
        }
        cases[empt].prototype.concat = concat
        cases[empt].prototype.sconcat = concat
    })
    forEachValue((override,key) => {
        cases[key].prototype.concat = override
        cases[key].prototype.sconcat = override
    },overrides?.concat || {})
})

setTypeclass("Semigroup")(Semigroup)

export default Semigroup;