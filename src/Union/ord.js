import { propOr } from 'ramda'
import { getVariant, forEachValue } from '../_internals'
import EnumType from './enumType'

const Ord = defs => (cases) => {
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
}

export default Ord

export const Ordering = EnumType("Ordering",[ "LT", "EQ", "GT" ])
