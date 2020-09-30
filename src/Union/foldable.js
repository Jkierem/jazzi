import { propOr } from "ramda";
import { currySetTypeclass } from "../_internals"

const mark = currySetTypeclass("Foldable")

/**
 * Adds apply method to proto
 * @param {{ 
 *  overrides: {
 *      fold: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Foldable = (defs) => mark((cases) => {
    const overrides = propOr({},"overrides",defs);
    Object.keys(cases).forEach((key) => {
        cases[key].prototype.fold = overrides?.fold?.[key]
    })
})

export default mark(Foldable)