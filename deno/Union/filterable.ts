import { defineOverrides, propOr } from "../_internals/mod.ts";
import { setTypeclass } from "../_internals/symbols.ts";
import { AnyConstRec, AnyFnRec, Boxed } from "../_internals/types.ts";

const mark = setTypeclass("Filterable")

type FilterableDefs = {
    trivials: string[], 
    identities: string[],
    overrides?: {
        filter?: AnyFnRec
    }
}

export interface Filterable<A> {
    /**
     * Receives a predicate and returns the filtered structure
     * @param fn 
     */
    filter(fn: (a: A) => boolean): Filterable<A>;
}

/**
 * Adds filter method to proto
 */
const Filterable = (defs: FilterableDefs) => mark((cases: AnyConstRec) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function filter<A, FA extends { filter: <B>(b: B) => boolean }>(this: Filterable<FA> & Boxed<FA>, fn: (a: A) => boolean){
            return new cases[trivial](this.get().filter(fn))
        }
        cases[trivial].prototype.filter = filter
    });
    identities.forEach(empt => {
        function filter(this: Filterable<any>){
            return this
        }
        cases[empt].prototype.filter = filter
    });
    defineOverrides("filter",[],overrides,cases)
})

mark(Filterable)

export default Filterable