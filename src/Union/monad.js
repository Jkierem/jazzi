import { prop, propOr } from "ramda";
import { setTypeclass } from "../_internals"

/**
 * Adds run, unsafeRun, pure, chain, bind and flatMap method to proto. Adds pure to global.
 * @param {{ 
 *  pure: string,
 *  trivials: string[], 
 *  identities: string[],
 *  overrides?: {
 *      chain?: any
 *  }
 * }} defs 
 * @returns {(cases: any, globals: any) => void}
 */
const Monad = (defs) => setTypeclass("Monad",(cases,globals) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const lazy = propOr(false,"lazy",defs);
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
    Object.keys(cases).forEach(key => {
        function run(){ return this }
        cases[key].prototype.run = overrides?.run?.[key] || run;
        cases[key].prototype.unsafeRun = overrides?.run?.[key] || run;
    })
    globals.pure = (...args) => new cases[pure](...args)
    globals.do = function(fn){
        let gen = undefined;
        const runDo = prev => {
            let monad = gen.next(prev)
            if( monad.done ){
              return monad.value;
            } else {
              return monad.value.flatMap(runDo)
            }
        }
        if( lazy ){
            return new cases[pure]((...args) => {
                gen = fn()
                return runDo().unsafeRun(...args)
            })
        } else {
            gen = fn();
            return runDo()
        }
    }
})

setTypeclass("Monad",Monad)

export default Monad;