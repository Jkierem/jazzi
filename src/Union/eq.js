import { equals as eq, propOr } from "ramda"
import { forEachValue } from "../_internals"
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
        cases[trivial].prototype.equals = trivialEquals
    })
    empties.forEach(empt => {
        cases[empt].prototype.equals = emptyEquals
    })
    forEachValue((override,key) => {
        cases[key].prototype.equals = override
    }, overrides?.equals || {})
    globals.equals = eq;
})

mark(Eq);

export default Eq;