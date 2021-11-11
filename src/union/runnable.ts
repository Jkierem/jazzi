import { defineOverrides, propOr } from "../_internals"
import { setTypeclass } from "../_internals/symbols"
import { AnyConstRec, AnyFnRec } from "../_internals/types"

const mark = setTypeclass("Runnable")

type RunnableDefs = {
    overrides?: {
        run?: AnyFnRec
    }
}

export interface Runnable<Args extends any[], Return> {
    /**
     * Perform an effect
     * @param args 
     */
    run(...args: Args): Return;
    /**
     * Perform an effect
     * @param args 
     */
    unsafeRun(...args: Args): Return;
}

const Runnable = (defs: RunnableDefs) => mark((cases: AnyConstRec) => {
    const overrides = propOr({},"overrides",defs);
    Object.keys(cases).forEach(key => {
        function run<A>(this: any){ return this.get() }
        cases[key].prototype.run       = run;
        cases[key].prototype.unsafeRun = run;
    })
    defineOverrides("run",["unsafeRun"],overrides,cases)
})

mark(Runnable)

export default Runnable