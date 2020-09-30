import { prop, propOr } from "ramda";
import { setTypeclass } from "../_internals"

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
        function trivMappend(m){ return this.concat(m) }
        const mappend = overrides?.mappend?.[trivial] || trivMappend
        cases[trivial].prototype.mappend = mappend
        cases[trivial].prototype.append = mappend
    })
    identities.forEach(empt => {
        function idMappend(m){ return m }
        const mappend = overrides?.mappend?.[empt] || idMappend
        cases[empt].prototype.mappend = mappend
        cases[empt].prototype.append = mappend
    })
    Object.keys(cases).forEach(key => {
        function trivialEmpty(){
            return new cases[zero]()
        }
        const empty = overrides?.empty?.[key] || trivialEmpty;
        cases[key].prototype.empty = empty
    })
    globals.empty = function(){ return new cases[zero]() }
    globals.accumulate = function(arr){ 
        return arr.reduce((acc,next) => acc.concat(next), new cases[zero]())
    }
})

setTypeclass("Monoid",Monoid)

export default Monoid