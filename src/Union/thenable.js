import identity from "ramda/src/identity";
import propOr from "ramda/src/propOr";
import { setTypeclass, defineOverrides, forEachValue } from "../_internals"

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

setTypeclass("Thenable",Thenable)

export default Thenable;