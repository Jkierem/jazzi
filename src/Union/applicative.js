import { propOr } from "ramda";
import { currySetTypeclass as setTypeclass } from "../_internals"

const mark = setTypeclass("Applicative")

/**
 * Adds apply method to proto
 * @param {{ 
*  trivials: string[], 
*  identities: string[],
*  overrides?: {
*      apply?: any
*  }
* }} defs 
* @returns {(cases: any) => void}
*/
const Applicative = (defs) => mark((cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        cases[trivial].prototype.apply = function(other){
            return other?.match?.({
                [trivial]: () => new cases[trivial]( other.get()(this.get()) ) ,
                _: () => other
            })
        }
    })
    identities.forEach(empt => {
        cases[empt].prototype.apply = function(){ return this }
    })
    Object.keys(overrides?.apply || {}).forEach(key => {
        cases[key].prototype.apply = overrides?.apply?.[key]
    })
})

mark(Applicative);

export default Applicative