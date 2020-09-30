import { propOr } from "ramda"
import { setTypeclass } from "../_internals"

/**
 * Adds concat method to proto
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  overrides?: {
 *      concat?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Semigroup = (defs) => setTypeclass("Semigroup",(cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialConcat(m){
            return m.match({
                [trivial]: () => new cases[trivial](this.get().concat(m.get())),
                _: () => this
            })
        }
        const concat = overrides?.concat?.[trivial] || trivialConcat
        cases[trivial].prototype.concat = concat
    })
    identities.forEach(empt => {
        function idConcat(m){
            return m
        }
        const concat = overrides?.concat?.[empt] || idConcat
        cases[empt].prototype.concat = concat
    })
})

setTypeclass("Semigroup",Semigroup)

export default Semigroup;