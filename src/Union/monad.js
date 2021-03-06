import { prop, propOr } from "ramda";
import { defineOverrides, forEachValue } from "../_internals";
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
        function chain(fn){
            return fn(this.get())
        }
        cases[trivial].prototype.chain   = chain
        cases[trivial].prototype.bind    = chain
        cases[trivial].prototype.flatMap = chain
    })
    identities.forEach(empt => {
        function chain(){
            return this
        }
        cases[empt].prototype.chain   = chain
        cases[empt].prototype.bind    = chain
        cases[empt].prototype.flatMap = chain
    })
    Object.keys(cases).forEach(key => {
        function run(){ return this }
        cases[key].prototype.run       = run;
        cases[key].prototype.unsafeRun = run;
    })
    defineOverrides("chain",["bind","flatMap"],overrides,cases)
    defineOverrides("run",["unsafeRun"],overrides,cases)
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
                gen = fn(this.pure)
                return runDo().unsafeRun(...args)
            })
        } else {
            gen = fn(this.pure);
            return runDo()
        }
    }
})

setTypeclass("Monad",Monad)

export default Monad;