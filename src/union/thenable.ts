import { propOr, identity, defineOverrides, forEachValue } from "../_internals"
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

export interface Thenable<Resolve,Reject> {
    /**
     * Converts to a promise
     */
    toPromise(): Promise<Resolve>;
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

/**
 * Add toPromise, then and catch methods to proto
 */
const Thenable = (defs: ThenableDefs) => mark((cases: AnyConstRec) => {
    const resolvers = propOr([],"resolve",defs)
    const rejecters = propOr([],"reject",defs)
    const overrides = propOr({},"overrides", defs);

    resolvers.forEach((variant) => {
        cases[variant].prototype.toPromise = function(){
            return Promise.resolve(this.get())
        }
        cases[variant].prototype.then = function(resolve=identity){
            resolve(this.get())
        }
    })

    rejecters.forEach((variant) => {
        cases[variant].prototype.toPromise = function(){
            return Promise.reject(this.get())
        }
        cases[variant].prototype.then = function(__: any, reject=identity){
            reject(this.get())
        }
    })

    defineOverrides("then",[],overrides,cases);
    defineOverrides("toPromise",[],overrides,cases);

    forEachValue((variant) => {
        variant.prototype.catch = function(reject=identity) {
            return this.then(undefined,reject);
        }
    },cases)

})

mark(Thenable)

export default Thenable;