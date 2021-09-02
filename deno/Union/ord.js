import assoc from "https://deno.land/x/ramda@v0.27.2/source/assoc.js";
import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { getVariant, forEachValue, setTypeclass } from "../_internals/mod.js";
import Enum from "./enum.js";
import Eq from "./eq.js";
import Show from "./show.js";
import Union from "./union.js";

const mark = x => setTypeclass("Ord",x)

const rawCases = ["LT","EQ","GT"]
const Ordering = Union("Ordering",{
    LT: () => {},
    EQ: () => {},
    GT: () => {},
},[
    Eq({ empties: rawCases }),
    Enum({ order: rawCases }),
    Ord({ order: rawCases }),
    Show({ overrides: {
        show: rawCases.reduce((acc,next) => {
            return assoc(next,() => `[Ordering => ${next}]`,acc)
        },{})
    } }),
    (cases,globals) => {
        rawCases.forEach((key) => {
            globals[key] = new cases[key]();
        })
    }
]).constructors({})

function Ord(defs){ 
    return mark((cases) => {
        const order = propOr([],"order",defs)
        const overrides = propOr({},"overrides",defs);
        const ltBased      = overrides?.lessThanOrEqual || false;
        const compareBased = overrides?.compare         || false;
        const orderBased   = order.length               || false;
        forEachValue( variant => {
            if( ltBased ){
                variant.prototype.lessThanOrEqual = overrides.lessThanOrEqual
                variant.prototype.compare = function(o){
                    if( this.lessThanOrEqual(o) ){
                        if( o.lessThanOrEqual(this) ){
                            return Ordering.EQ
                        }
                        return Ordering.LT
                    }
                    return Ordering.GT
                }
            } else if( compareBased ) {
                variant.prototype.compare = overrides.compare
                variant.prototype.lessThanOrEqual = function(o){
                    return !this.compare(o).isGT()
                }
            } else if( orderBased ) {
                variant.prototype.lessThanOrEqual = function(o){
                    const getOrder = y => order.findIndex(x => x === getVariant(y))
                    const a = getOrder(this)
                    const b = getOrder(o)
                    return a <= b
                }
                variant.prototype.compare = function(o){
                    if( this.lessThanOrEqual(o) ){
                        if( o.lessThanOrEqual(this) ){
                            return Ordering.EQ
                        }
                        return Ordering.LT
                    }
                    return Ordering.GT
                }
            } else {
                throw Error("Ord requires order or overrides for either compare or lessThanOrEqual")
            }
            variant.prototype.lessThan = function(o){
                return this.compare(o).isLT()
            }
            variant.prototype.greaterThan = function(o){
                return this.compare(o).isGT()
            }
            variant.prototype.greaterThanOrEqual = function(o){
                return !this.compare(o).isLT()
            }
        },cases)
    })
}

mark(Ord)

export default Ord

export { Ordering }