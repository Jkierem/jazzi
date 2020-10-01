import { propOr } from "ramda";
import { currySetTypeclass as setTypeclass } from "../_internals"

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
        const effect = overrides?.effect?.[trivial] || trivialEffect
        cases[trivial].prototype.effect = effect
        cases[trivial].prototype.peak = effect
    })

    identities.forEach(empt => {
        function idEffect(){
            return this
        }
        const effect = overrides?.effect?.[empt] || idEffect
        cases[empt].prototype.effect = effect
        cases[empt].prototype.peak = effect
    })
})

mark(Effect)

export default Effect