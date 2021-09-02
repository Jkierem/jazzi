import propOr from "ramda/src/propOr";
import { defineOverrides, currySetTypeclass as setTypeclass, forEachValue } from "../_internals"

const mark = setTypeclass("Tap")

/**
 * Adds effect and peak method to proto
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  remove?: { matchEffect: boolean }, 
 *  overrides?: {
 *      tap?: any;
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Tap = (defs) => mark((cases) => {
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
        cases[trivial].prototype.tap = trivialEffect
    })

    identities.forEach(empt => {
        function idEffect(){
            return this
        }
        cases[empt].prototype.effect = idEffect
        cases[empt].prototype.peak = idEffect
        cases[empt].prototype.tap = idEffect
    })
    forEachValue((variant) => {
        function baseImpl(pat){
            this.match(pat)
            return this
        }
        variant.prototype.matchEffect = baseImpl;
        variant.prototype.when = baseImpl;
    },cases)

    defineOverrides("tap",["peak","effect"],overrides,cases)
})

mark(Tap)

export default Tap