import { propOr } from "ramda";
import { getVariant, getInnerValue, setTypeclass, getTypeName } from "../_internals"

/**
 * Adds show and toString method to proto
 * @param {{
 *  overrides?: {
 *      show?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Show = (defs) => setTypeclass("Show",(cases) => {
    const overrides = propOr({},"overrides",defs);
    Object.keys(cases).forEach(trivial => {
        function trivialShow(){
            return `[${getTypeName(this)} => ${getVariant(this)} ${getInnerValue(this)}]`;
        }
        const show = overrides?.show?.[trivial] || trivialShow
        cases[trivial].prototype.show = show
        cases[trivial].prototype.toString = show
    })
})

setTypeclass("Show",Show)

export default Show