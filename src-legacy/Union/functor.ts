import { defineOverrides, forEachValue, splitBy, propOr, includes } from "../_internals";
import { setTypeclass } from "../_internals/symbols"
import { AnyBoxed, AnyConstRec, AnyFnRec, Boxed } from "../_internals/types";

type FunctorDefs = {
    trivials?: string[],
    identities?: string[],
    overrides?: {
        fmap?: AnyFnRec
    }
}

export interface Functor<A> extends Boxed<A> {
    /**
     * Map a functor over a given function (`fn`)
     * @param fn function used to map inner value
     * @returns mapped functor
     */
    map<B>(fn: (a: A) => B ): Functor<B>;
    /**
     * Map a functor over a given function (`fn`)
     * @param fn function used to map inner value
     * @returns mapped functor
     */
    fmap<B>(fn: (a: A) => B ): Functor<B>;
    /**
     * Maps a functor to a constant value
     * @param b 
     */
    mapTo<B>(b: B): Functor<B>
}

/**
 * Adds map and fmap method to proto
 */
const Functor = (defs: FunctorDefs) => setTypeclass("Functor")((cases: AnyConstRec) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    trivials.forEach(trivial => {
        function trivialFmap(this: AnyBoxed, fn: <A,B>(a: A) => B){
            return new cases[trivial](fn(this.get()))
        }
        cases[trivial].prototype.fmap = trivialFmap
        cases[trivial].prototype.map = trivialFmap
        cases[trivial].prototype.mapTo = function<B>(this: Functor<any>, b: B){
            return this.map(() => b)
        }
    })
    identities.forEach(empt => {
        function idFmap(this: any){
            return this
        }
        cases[empt].prototype.fmap = idFmap
        cases[empt].prototype.map = idFmap
        cases[empt].prototype.mapTo = idFmap
    })
    defineOverrides("fmap",["map"],overrides,cases);
})

setTypeclass("Functor")(Functor)

type FunctorErrorDefs = {
    errors?: string[],
    overrides?: {
        mapError?: AnyFnRec
    }
}

export interface FunctorError<A> {
    /**
     * Map error case of a functor
     * @param fn function to map over
     */
    mapError<B>(fn: (a: A) => B): FunctorError<B>;
}

export type AnyFunctorError = FunctorError<any>

/**
 * Adds mapError method to proto of error cases
 */
const FunctorError = (defs: FunctorErrorDefs) => setTypeclass("FunctorError")((cases: AnyConstRec) => {
    const errors = propOr([],"errors",defs);
    const overrides = propOr({},"overrides",defs);
    const [ lefts, rights ] = splitBy( c => !includes(c,errors), Object.keys(cases))
    lefts.forEach(left => {
        cases[left].prototype.mapError = function(this, fn: <A,B>(a: A) => B){
            return new cases[left](fn(this.get()))
        }
    })

    function idMapError(this: any){
        return this
    }
    rights.forEach(right => {
        cases[right].prototype.mapError = idMapError
    })

    forEachValue((override,key) => {
        cases[key].prototype.mapError = override
    }, overrides?.mapError)
})

setTypeclass("FunctorError")(FunctorError)

export { FunctorError }
export default Functor;