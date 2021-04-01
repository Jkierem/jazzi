import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { defineOverrides, currySetTypeclass as setTypeclass, forEachValue } from "../_internals/index.js";

const mark = setTypeclass("Effect")

/**
 * Adds effect and peak method to proto
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  overrides?: {
 *      effect?: any;
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Effect = (defs) => mark((cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialEffect(fn){
            return this.map(x => {
                fn(x)
                return x
            })
        }
        cases[trivial].prototype.effect = trivialEffect
        cases[trivial].prototype.peak = trivialEffect
    })

    identities.forEach(empt => {
        function idEffect(){
            return this
        }
        cases[empt].prototype.effect = idEffect
        cases[empt].prototype.peak = idEffect
    })

    forEachValue((variant) => {
        function baseImpl(pat){
            this.match(pat)
            return this
        }
        variant.prototype.matchEffect = baseImpl;
        variant.prototype.when = baseImpl;
    },cases)

    defineOverrides("effect",["peak"],overrides,cases)
})

mark(Effect)

export default Effect