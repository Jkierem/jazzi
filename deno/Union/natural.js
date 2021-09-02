import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { defineOverrides, forEachValue, setTypeclass, getFirstCaseSensitive as getFirst, getTypeclasses } from "../_internals/mod.js";
import { hasInstance } from "../_tools/mod.js";

/**
 * Adds a natural tranformation 
 * @param {{
 *   natural?: string,
 *   overrides?: {
 *     to?: any
 *   }
 * }} defs 
 * @returns {(cases: any, globals: any) => void}
 */
const Natural = (defs) => setTypeclass("Natural", (cases,globals) => {
    const natKey = propOr("of","natural",defs)
    const overrides = propOr({},"overrides",defs)
    globals.natural = function(...args){
        return this[natKey](...args);
    }
    forEachValue((variant) => {
        function NatTrans(other){
            if( hasInstance(Natural,other) ){
                const tcs = getTypeclasses(this)()
                const defaultKey = '__default'
                return getFirst([...tcs, defaultKey],{
                    Functor      : () => this.map(other.natural).get(),
                    Monad        : () => this.flatMap(other.natural),
                    [defaultKey] : () => other.natural(this.get())
                })()
            }
            throw Error("Cannot transform into something that doesn't have a Natural transform")
        }
        variant.prototype.to = NatTrans;
        defineOverrides("to",[],overrides,cases);
    },cases)
})

setTypeclass("Natural",Natural)

export default Natural