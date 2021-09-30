import { defineOverrides, forEachValue, propOr } from "../_internals"
import { setTypeclass } from "../_internals/symbols"
import { AnyConstRec } from "../_internals/types"
import { Functor } from "./functor"

const mark = setTypeclass("Tap")

type TapDefs = {
    trivials?: string[], 
    identities?: string[],
    overrides?: {
        tap?: any;
    }
}

export interface Tap<T> extends Functor<T> {
    /**
     * Runs a function with the inner value of a structure without altering it
     * @param {(x: T) => void} fn function to run
     */
    peak(fn: (x: T) => void): Tap<T>;
    /**
     * Runs a function with the inner value of a structure without altering it
     * @param {(x: T) => void} fn function to run
     */
    tap(fn: (x: T) => void): Tap<T>;
    /**
     * Runs match function without altering itself. More info see `match`
     * @param {Match} patterns
     * @returns structure unchanged
     */
    matchEffect(patterns: any): Tap<T>;
    /**
     * Runs match function without altering itself. More info see `match`
     * @param {Match} patterns
     * @returns structure unchanged
     */
    when(patterns: any): Tap<T>;
}

/**
 * Adds effect and peak method to proto
 */
const Tap = (defs: TapDefs) => mark((cases: AnyConstRec) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialTap<A>(this: Tap<A>, fn: (a: A) => void){
            return this.map(x => {
                fn(x)
                return x
            })
        }
        cases[trivial].prototype.peak = trivialTap
        cases[trivial].prototype.tap = trivialTap
    })

    identities.forEach(empt => {
        function idEffect(this: Tap<any>){
            return this
        }
        cases[empt].prototype.peak = idEffect
        cases[empt].prototype.tap = idEffect
    })
    forEachValue((variant) => {
        function baseImpl(this: Tap<any>, pat: any){
            this.match(pat)
            return this
        }
        variant.prototype.matchEffect = baseImpl;
        variant.prototype.when = baseImpl;
    },cases)

    defineOverrides("tap",["peak","effect"],overrides,cases)
})

mark(Tap)

export default Tap