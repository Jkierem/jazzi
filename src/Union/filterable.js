import { propOr } from "ramda";
import { currySetTypeclass } from "../_internals";

const mark = currySetTypeclass("Filterable")

/**
 * Adds filter method to proto
 * @param {{ 
*  trivials: string[], 
*  identities: string[],
*  overrides?: {
*      filter?: any
*  }
* }} defs 
* @returns {(cases: any) => void}
*/
const Filterable = (defs) => mark((cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialFilter(fn){
            return new cases[trivial](this.get().filter(fn))
        }
        const filter = overrides?.filter?.[trivial] || trivialFilter;
        cases[trivial].prototype.filter = filter
    });
    identities.forEach(empt => {
        function idFilter(){
            return this
        }
        const filter = overrides?.filter?.[empt] || idFilter;
        cases[empt].prototype.filter = filter
    });
})

mark(Filterable)

export default Filterable