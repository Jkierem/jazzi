import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import prop from "https://deno.land/x/ramda@v0.27.2/source/prop.js";
import { defineOverrides } from "../_internals/index.js";
import { setTypeclass } from "../_internals/index.js";

/**
 * Adds mappend, append and empty method to proto and empty to globals
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  zero: string,
 *  overrides?: {
 *      empty?: any;
 *      mappend?: any;
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Monoid = (defs) => setTypeclass("Monoid",(cases,globals) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const zero = prop("zero",defs)
    trivials.forEach(trivial => {
        function mappend(m){ return this.concat(m) }
        cases[trivial].prototype.mappend = mappend
        cases[trivial].prototype.append  = mappend
    })
    identities.forEach(empt => {
        function mappend(m){ return m }
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
    globals.empty = function(){ return new cases[zero]() }
    globals.accumulate = function(arr){ 
        return arr.reduce((acc,next) => acc.concat(next), globals.empty())
    }
    globals.foldMap = function(arr) {
        return arr.map(this.of).reduce((acc,next) => acc.concat(next), globals.empty())
    }
})

setTypeclass("Monoid",Monoid)

export default Monoid