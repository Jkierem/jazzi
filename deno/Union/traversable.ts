import { defineOverrides, prop } from "../_internals/mod.ts";
import { setTypeclass } from "../_internals/symbols.ts";
import { AnyConstRec, AnyFn, AnyFnRec } from "../_internals/types.ts";

const mark = setTypeclass("Traversable")

type TraversableDefs = {
    overrides: {
        sequence: AnyFnRec,
        traverse?: <T,A>(fn: (a: A) => Traversable<T>, data: A[]) => Traversable<T[]>,
    }
}

export interface Traversable<T> {
    /**
     * Sequences two traversables collecting the results in an array
     * @param other 
     */
    sequence<U>(other: Traversable<U>): Traversable<(T | U)[]>
}

export interface TraversableRep {
    /**
     * Use `fn` to map values to a traversable and then sequence them collecting the results in an array
     * @param fn 
     * @param data 
     */
    traverse<A,T>(data: A[], fn: (a: A) => Traversable<T>): Traversable<T[]>;
}

const Traversable = (defs: TraversableDefs) => mark((cases: AnyConstRec, globals: any) => {
    const overrides = prop("overrides")(defs)
    defineOverrides("sequence",[],overrides as any,cases)

    globals.traverse = function<T>(arr: T[], fn: (a: any) => any){
        return arr
            .map(fn)
            .reduce((acc,next) => acc.sequence(next))
    }
    const traverseOverride = prop("traverse")(overrides)
    if( traverseOverride ){
        globals.traverse = traverseOverride;
    }
})

mark(Traversable)

export default Traversable;