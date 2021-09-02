import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { defineOverrides } from "../_internals/mod.js";
import { currySetTypeclass } from "../_internals/mod.js";

const mark = currySetTypeclass("Filterable")

/**
 * Adds filter method to proto
 * @param {{ 
*  trivials: string[], 
*  identities: string[],
*  overrides?: {
*      filter?: any
*  }
* }} defs 
* @returns {(cases: any) => void}
*/
const Filterable = (defs) => mark((cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function filter(fn){
            return new cases[trivial](this.get().filter(fn))
        }
        cases[trivial].prototype.filter = filter
    });
    identities.forEach(empt => {
        function filter(){
            return this
        }
        cases[empt].prototype.filter = filter
    });
    defineOverrides("filter",[],overrides,cases)
})

mark(Filterable)

export default Filterable