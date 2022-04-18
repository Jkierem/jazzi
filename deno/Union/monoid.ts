import { defineOverrides, prop, propOr } from "../_internals/mod.ts";
import { setTypeclass } from "../_internals/symbols.ts";
import type { AnyConstRec, AnyFnRec } from "../_internals/types.ts";
import type { FixedSemigroup, Semigroup } from "./semigroup.ts";

type MonoidDefs = {
    trivials: string[], 
    identities: string[],
    zero: string,
    overrides?: {
        empty?: AnyFnRec;
        mappend?: AnyFnRec;
    }
}

export interface Monoid<A> extends Semigroup<A>{
    /**
     * Returns the empty value of a Monoid
     */
    empty(): Monoid<A>
    /**
     * Monoid combine operation
     */
    append(m: Monoid<A>): Monoid<A>
    /**
     * Monoid combine operation
     */
    mappend(m: Monoid<A>): Monoid<A>
}

export interface FixedMonoid<Outer extends Monoid<Inner>, Inner> 
        extends FixedSemigroup<Outer,Inner>
{
    /**
     * Returns the empty value of a Monoid
     */
    empty(): Outer
    /**
     * Monoid combine operation
     */
    append(m: Outer): Outer
    /**
     * Monoid combine operation
     */
    mappend(m: Outer): Outer
}

export interface MonoidRep { 
    /**
     * Returns the empty value of a Monoid
     */
    empty<A>(): Monoid<A>; 
    /**
     * Combines a list of monoids
     * @param monoids list of monoids
     */
    accumulate<A>(monoids: Monoid<A>[]): Monoid<A>;
    /**
     * Maps a list of values into a list of monoids and combines them
     * @param values 
     */
    foldMap<A>(values: A[]): Monoid<A>;
}

type InnerType<A> = A extends Monoid<infer B> ? B : never

export interface FixedMonoidRep<A extends Monoid<any>> {
    /**
     * Returns the empty value of a Monoid
     */
     empty(): A; 
     /**
      * Combines a list of monoids
      * @param monoids list of monoids
      */
     accumulate(monoids: A[]): A;
     /**
      * Maps a list of values into a list of monoids and combines them
      * @param values 
      */
     foldMap(values: InnerType<A>[]): A;
}

/**
 * Adds mappend, append and empty method to proto and empty, accumulate and foldMap to globals
 */
const Monoid = (defs: MonoidDefs) => setTypeclass("Monoid")((cases: AnyConstRec, globals: any) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const zero = prop("zero")(defs)
    trivials.forEach(trivial => {
        function mappend<A>(this: Monoid<A>, m: Monoid<A>){ return this.concat(m) as Monoid<A> }
        cases[trivial].prototype.mappend = mappend
        cases[trivial].prototype.append  = mappend
    })
    identities.forEach(empt => {
        function mappend(m: Monoid<any>){ return m }
        cases[empt].prototype.mappend = mappend
        cases[empt].prototype.append  = mappend
    })
    Object.keys(cases).forEach(key => {
        function empty(){
            return globals.empty()
        }
        cases[key].prototype.empty = empty
    })
    defineOverrides("mappend",["append"],overrides,cases);
    defineOverrides("empty",[],overrides,cases);
    globals.empty = function<A>(): Monoid<A>{ return new cases[zero]() }
    globals.accumulate = function<A>(arr: Monoid<A>[]){ 
        return arr.reduce(
            (acc, next) => acc.append(next), 
            globals.empty() as Monoid<A>
        )
    }
    globals.foldMap = function<A>(arr: A[]) {
        const mapper = <B>(a: B): Monoid<B> => this.of(a)
        return arr
            .map(mapper)
            .reduce(
                (acc, next) => acc.append(next), 
                globals.empty() as Monoid<A>
            )
    }
})

setTypeclass("Monoid")(Monoid)

export default Monoid