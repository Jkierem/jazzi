import { defineOverrides, forEachValue, propOr, getFirstCaseSensitive as getFirst } from "../_internals/mod.ts";

import { getTypeclasses, setTypeclass } from "../_internals/symbols.ts";

import { AnyConstRec, AnyFn, Boxed } from "../_internals/types.ts";

import { hasInstance } from "../_tools/mod.ts";


const mark = setTypeclass("Natural")

type NaturalDefs = {
    natural?: string,
    overrides?: {
        to?: any
    }
}

export interface Natural<A> {
    /**
     * Attempts to perform a natural transformation by calling `natural` method on the argument. *Not actually a proper natural transformation*
     * @param typeRep 
     */
    to<B>(typeRep: { natural: (a: A) => B }): B;
}

export interface NaturalRep {
    /**
     * Method for transforming into the type.
     * @param data 
     */
    natural<A>(data: A): Natural<A> ;
}

/**
 * Adds a natural tranformation. Adds to method to proto and natural method to global
 */
const Natural = (defs: NaturalDefs) => mark((cases: AnyConstRec, globals: any) => {
    const natKey = propOr("of","natural",defs)
    const overrides = propOr({},"overrides",defs)
    globals.natural = function(...args: any[]){
        return this[natKey](...args);
    }
    forEachValue((variant) => {
        function NatTrans(this: any, other: NaturalRep){
            if( hasInstance(Natural,other) ){
                const tcs = (getTypeclasses(this) as any)()
                const defaultKey = '__default'
                return (getFirst([...tcs, defaultKey],{
                    Functor      : () => this.map(other.natural).get(),
                    Monad        : () => this.flatMap(other.natural),
                    [defaultKey] : () => other.natural(this.get())
                }) as unknown as AnyFn)()
            }
            throw Error("Cannot transform into something that doesn't have a Natural transform")
        }
        variant.prototype.to = NatTrans;
        defineOverrides("to",[],overrides,cases);
    },cases)
})

mark(Natural)

export default Natural