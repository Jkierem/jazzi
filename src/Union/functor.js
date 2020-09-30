import { includes, propOr } from "ramda"
import { setTypeclass, splitBy } from "../_internals"

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
        const fmap = overrides?.fmap?.[trivial] || trivialFmap
        cases[trivial].prototype.fmap = fmap
        cases[trivial].prototype.map = fmap
    })
    identities.forEach(empt => {
        function idFmap(fn){
            return this
        }
        const fmap = overrides?.fmap?.[empt] || idFmap
        cases[empt].prototype.fmap = fmap
        cases[empt].prototype.map = fmap
    })
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
        function trivialMapError(fn){
            return new cases[left](fn(this.get()))
        }
        const mapError = overrides?.mapError?.[left] || trivialMapError
        cases[left].prototype.mapError = mapError
    })

    rights.forEach(right => {
        function idMapError(){
            return this
        }
        const mapError = overrides?.mapError?.[right] || idMapError
        cases[right].prototype.mapError = mapError
    })
})

setTypeclass("FunctorError",FunctorError)

export { FunctorError }
export default Functor;