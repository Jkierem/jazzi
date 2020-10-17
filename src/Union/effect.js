import { propOr } from "ramda";
import { defineOverrides, currySetTypeclass as setTypeclass } from "../_internals"

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
    defineOverrides("effect",["peak"],overrides,cases)
})

mark(Effect)

export default Effect