import { prop, propOr } from "ramda";
import { setTypeclass } from "../_internals"

/**
 * Adds pure, chain, bind and flatMap method to proto. Adds pure to global.
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  pure: string,
 *  overrides?: {
 *      chain?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Monad = (defs) => setTypeclass("Monad",(cases,globals) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const pure = prop("pure",defs);
    trivials.forEach(trivial => {
        function trivialChain(fn){
            return fn(this.get())
        }
        const chain = overrides?.chain?.[trivial] || trivialChain
        cases[trivial].prototype.chain   = chain
        cases[trivial].prototype.bind    = chain
        cases[trivial].prototype.flatMap = chain
    })
    identities.forEach(empt => {
        function idChain(){
            return this
        }
        const chain = overrides?.chain?.[empt] || idChain
        cases[empt].prototype.chain   = chain
        cases[empt].prototype.bind    = chain
        cases[empt].prototype.flatMap = chain
    })
    globals.pure = (...args) => new cases[pure](...args)
})

setTypeclass("Monad",Monad)

export default Monad;