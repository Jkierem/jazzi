import { propOr } from "ramda";
import { currySetTypeclass as setTypeclass, defineOverrides } from "../_internals"

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
    defineOverrides("apply",[],overrides,cases)
})

mark(Applicative);

export default Applicative