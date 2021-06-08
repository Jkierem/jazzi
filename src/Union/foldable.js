import propOr from "ramda/src/propOr";
import { setTypeclass } from "../_internals"

const mark = x => setTypeclass("Foldable",x)

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

setTypeclass("Foldable",Foldable)

export default Foldable