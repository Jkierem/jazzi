import { propOr, identity, defineOverrides } from "../_internals"
import { setTypeclass } from "../_internals/symbols"
import { AnyConstRec } from "../_internals/types"

const mark = setTypeclass("Thenable")

type ThenableDefs = {
    resolve: string[]
    reject: string[]
    overrides?: {
        toPromise?: {
            [x: string] : () => Promise<any>
        }
    }
}

export interface ThenableOf<Resolve,Reject> {
    /**
     * Calls onResolve if success case, calls onReject otherwise
     * @param onResolve 
     * @param onReject 
     */
    then(onResolve: (value: Resolve) => void, onReject?: (value: Reject) => void): void;
    /**
     * Shorthand to handle error case
     * @param onReject 
     */
    catch(onReject: (value: Reject) => void): void
}

export interface Thenable<Resolve,Reject> {
    /**
     * Converts to a promise
     */
    toPromise(): Promise<Resolve>;
    /**
     * Converts to a thenable object
     */
    toThenable(): ThenableOf<Resolve,Reject>;
}

const thenableOf = (thenImpl: (a: any, b: any) =>void) => {
    return {
        then: thenImpl,
        catch(fn=identity){
            this.then(undefined,fn)
        }
    }
}

/**
 * Add toPromise and toThenable methods to proto
 */
const Thenable = (defs: ThenableDefs) => mark((cases: AnyConstRec) => {
    const resolvers = propOr([],"resolve",defs)
    const rejecters = propOr([],"reject",defs)
    const overrides = propOr({},"overrides", defs);

    resolvers.forEach((variant) => {
        cases[variant].prototype.toPromise = function(){
            return Promise.resolve(this.get())
        }
        cases[variant].prototype.toThenable = function(){
            return thenableOf((resolve=identity) => {
                resolve(this.get())
            })
        }
    })

    rejecters.forEach((variant) => {
        cases[variant].prototype.toPromise = function(){
            return Promise.reject(this.get())
        }
        cases[variant].prototype.toThenable = function(){
            return thenableOf((__: any, reject=identity) => {
                reject(this.get())
            })
        }
    })

    defineOverrides("toPromise",[],overrides,cases);
    defineOverrides("toThenable",[],overrides,cases);
})

mark(Thenable)

export default Thenable;