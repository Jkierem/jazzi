import { includes, propOr } from "ramda"
import { defineOverrides, forEachValue, setTypeclass, splitBy } from "../_internals";
import { hasInstance } from "../_tools"

/**
 * Adds map and fmap method to proto
 * @param {{ 
 *  trivials: string[], 
 *  identities: string[],
 *  overrides?: {
 *      fmap?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const Functor = (defs) => setTypeclass("Functor",(cases) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialFmap(fn){
            return new cases[trivial](fn(this.get()))
        }
        cases[trivial].prototype.fmap = trivialFmap
        cases[trivial].prototype.map = trivialFmap
    })
    identities.forEach(empt => {
        function idFmap(){
            return this
        }
        cases[empt].prototype.fmap = idFmap
        cases[empt].prototype.map = idFmap
    })
    forEachValue((variant) => {
        function NatTrans(other){
            if( hasInstance(Functor,other) ){
                return this.map(other.of).get()
            }
            throw Error("Cannot transform into a non-Functor")
        }
        variant.prototype.natural = NatTrans;
        variant.prototype.to      = NatTrans;
    },cases)
    defineOverrides("fmap",["map"],overrides,cases);
    defineOverrides("natural",["to"],overrides,cases);
})

setTypeclass("Functor",Functor)

/**
 * Adds mapError method to proto of error cases
 * @param {{ 
 *  errors: string[], 
 *  overrides?: {
 *      mapError?: any
 *  }
 * }} defs 
 * @returns {(cases: any) => void}
 */
const FunctorError = (defs) => setTypeclass("FunctorError",(cases) => {
    const errors = propOr([],"errors",defs);
    const overrides = propOr({},"overrides",defs);
    const [ lefts, rights ] = splitBy( c => !includes(c,errors), Object.keys(cases))
    lefts.forEach(left => {
        cases[left].prototype.mapError = function(fn){
            return new cases[left](fn(this.get()))
        }
    })

    function idMapError(){
        return this
    }
    rights.forEach(right => {
        cases[right].prototype.mapError = idMapError
    })

    forEachValue((override,key) => {
        cases[key].prototype.mapError = override
    }, overrides?.mapError)
})

setTypeclass("FunctorError",FunctorError)

export { FunctorError }
export default Functor;