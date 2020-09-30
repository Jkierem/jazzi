import { prop, propOr } from "ramda";
import { setTypeclass } from "../_internals"

/**
 * Adds swap method to proto
 * @param {{ 
 *  left: string, 
 *  right: string,
 *  overrides?: {
 *      swap?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Swap = (defs) => setTypeclass("Swap",(cases) => {
    const left = prop("left",defs);
    const right = prop("right",defs);
    const overrides = propOr({},"overrides",defs);
    function triviallswap(){
        return new cases[right](this.get())
    }
    function trivialrswap(){
        return new cases[left](this.get())
    }
    const lswap = overrides?.swap?.[left]  || triviallswap
    const rswap = overrides?.swap?.[right] || trivialrswap
    cases[left].prototype.swap = lswap
    cases[right].prototype.swap = rswap
})

setTypeclass("Swap",Swap)

export default Swap