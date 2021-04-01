import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { forEachValue } from "../_internals/index.js";
import { setTypeclass } from "../_internals/index.js";

/**
 * Adds concat method to proto
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  overrides?: {
 *      concat?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Semigroup = (defs) => setTypeclass("Semigroup",(cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function concat(m){
            return m.match({
                [trivial]: () => new cases[trivial](this.get().concat(m.get())),
                _: () => this
            })
        }
        cases[trivial].prototype.concat = concat
        cases[trivial].prototype.sconcat = concat
    })
    identities.forEach(empt => {
        function concat(m){
            return m
        }
        cases[empt].prototype.concat = concat
        cases[empt].prototype.sconcat = concat
    })
    forEachValue((override,key) => {
        cases[key].prototype.concat = override
    },overrides?.concat || {})
})

setTypeclass("Semigroup",Semigroup)

export default Semigroup;