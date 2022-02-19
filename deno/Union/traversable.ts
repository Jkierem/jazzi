import { prop } from "../_internals/mod.ts";

import { setTypeclass } from "../_internals/symbols.ts";

import { Applicative, ApplicativeRep } from "./applicative.ts";


const mark = setTypeclass("Traversable")

type TraversableDefs = {
    overrides: {
        traverse?: <T,A>(fn: (a: A) => Applicative<T>, data: A[]) => Applicative<T[]>,
    }
}
export interface TraversableRep {
    /**
     * Use `fn` to map values to a traversable and then sequence them collecting the results in an array
     * @param fn 
     * @param data 
     */
    traverse<A,T>(data: A[], fn: (a: A) => Applicative<T>): Applicative<T[]>;
}

const Traversable = (defs: TraversableDefs) => mark((_: any, globals: any) => {
    const overrides = prop("overrides")(defs)

    globals.traverse = function<T>(this: ApplicativeRep, arr: T[], fn: (a: any) => Applicative<any>){
        const res: any[] = []
        const mark = Symbol("@@stop")
        const stop = this.pure({ [mark]: true })
        const pushOrReturn = (x: any) => {
            if( x[mark] ){
                return res;
            }
            res.push(x)
            return pushOrReturn
        }
        const init = this.pure(pushOrReturn)
        return arr
            .map(fn)
            .concat(stop)
            .reduce((acc,next) => acc.applyLeft(next), init)
    }
    const traverseOverride = prop("traverse")(overrides)
    if( traverseOverride ){
        globals.traverse = traverseOverride;
    }
})

mark(Traversable)

export default Traversable;