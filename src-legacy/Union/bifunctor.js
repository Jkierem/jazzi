import propOr from "ramda/src/propOr";
import { defineOverrides, currySetTypeclass as setTypeclass } from "../_internals";

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
    const first = propOr(false,"first",defs);
    const second = propOr(false,"second",defs);
    const overrides = propOr({},"overrides",defs);
    function trivialFirst(f,g){
        return new cases[first](f(this.get()))
    }
    function trivialSecond(f,g){
        return new cases[second](g(this.get()))
    }
    if( first ){
        cases[first].prototype.bimap = trivialFirst;
    }
    if( second ){
        cases[second].prototype.bimap = trivialSecond;
    }
    defineOverrides("bimap",[],overrides,cases)
})

mark(Bifunctor)

export default Bifunctor