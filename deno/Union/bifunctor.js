import { prop, propOr } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import { defineOverrides, currySetTypeclass as setTypeclass } from "../_internals/index.js";

const mark = setTypeclass("Bifunctor")

/**
 * Adds bimap method to proto
 * @param {{ 
 *  first: string, 
 *  second: string,
 *  overrides?: {
 *      bimap?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Bifunctor = (defs) => mark((cases) => {
    const first = prop("first",defs);
    const second = prop("second",defs);
    const overrides = propOr({},"overrides",defs);
    function trivialFirst(f,g){
        return new cases[first](f(this.get()))
    }
    function trivialSecond(f,g){
        return new cases[second](g(this.get()))
    }
    cases[first].prototype.bimap = trivialFirst;
    cases[second].prototype.bimap = trivialSecond;
    defineOverrides("bimap",[],overrides,cases)
})

mark(Bifunctor)

export default Bifunctor