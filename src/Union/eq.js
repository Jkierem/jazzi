import { equals as eq, propOr } from "ramda"
import { currySetTypeclass, getVariant } from "../_internals"

const mark = currySetTypeclass("Eq")

/**
 * Adds equals method to proto
 * @param {{ 
*  trivials: string[], 
*  empties: string[],
*  overrides?: {
*      equals?: any
*  }
* }} defs 
* @returns {(cases: any) => void}
*/
const Eq = (defs) => mark((cases,globals) => {
    const trivials = propOr([],"trivials",defs)
    const empties = propOr([],"empties",defs)
    const overrides = propOr({},"overrides",defs)
    function trivialEquals(other){
        return getVariant(this) === getVariant(other) && eq(this.get(), other.get())
    }
    function emptyEquals(other){
        return getVariant(this) === getVariant(other)
    }
    trivials.forEach(trivial => {
        const equals = overrides?.equals?.[trivial] || trivialEquals
        cases[trivial].prototype.equals = equals
    })
    empties.forEach(empt => {
        const equals = overrides?.equals?.[empt] || emptyEquals
        cases[empt].prototype.equals = equals
    })
    globals.equals = eq;
})

mark(Eq);

export default Eq;