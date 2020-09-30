import { prop, propOr } from "ramda";
import { currySetTypeclass as setTypeclass } from "../_internals";

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
    const firstMap  = overrides?.bimap?.[first]  || trivialFirst;
    const secondMap = overrides?.bimap?.[second] || trivialSecond;
    cases[first].prototype.bimap = firstMap;
    cases[second].prototype.bimap = secondMap;
})

mark(Bifunctor)

export default Bifunctor