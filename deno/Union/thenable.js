import { identity, propOr } from "https://deno.land/x/ramda@v0.27.2/mod.ts"
import { currySetTypeclass, defineOverrides, forEachValue } from "../_internals/index.js";

const mark = currySetTypeclass("Thenable")

/**
 * 
 * @param {{
 *  resolve: string[]
 *  reject: string[]
 *  overrides: {
 *      toPromise: {
 *          [x: string] : () => Promise<any>
 *      }
 *  }
 * }} defs 
 */
const Thenable = (defs) => mark((cases) => {
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
        cases[variant].prototype.then = function(__,reject=identity){
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

export default mark(Thenable);