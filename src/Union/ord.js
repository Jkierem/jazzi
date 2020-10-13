import { propOr } from 'ramda'
import { EnumType } from './union'
import { getVariant } from '../_internals'

const Ord = defs => (cases) => {
    const order = propOr([],"order",defs)
    const overrides = propOr({},"overrides",defs);
    Object.keys(cases).forEach( key => {
        if( overrides?.lessThanOrEqual ){
            cases[key].prototype.lessThanOrEqual = overrides?.lessThanOrEqual
            cases[key].prototype.compare = function(o){
                if( this.lessThanOrEqual(o) ){
                    if( o.lessThanOrEqual(this) ){
                        return Ordering.EQ
                    }
                    return Ordering.LT
                }
                return Ordering.GT
            }
        } else if( overrides?.compare ) {
            cases[key].prototype.compare = overrides?.compare
            cases[key].prototype.lessThanOrEqual = function(o){
                return !this.compare(o).isGT()
            }
        } else if( order.length ) {
            cases[key].prototype.lessThanOrEqual = function(o){
                const getOrder = y => order.findIndex(x => x === getVariant(y))
                const a = getOrder(this)
                const b = getOrder(o)
                return a <= b
            }
            cases[key].prototype.compare = function(o){
                if( this.lessThanOrEqual(o) ){
                    if( o.lessThanOrEqual(this) ){
                        return Ordering.EQ
                    }
                    return Ordering.LT
                }
                return Ordering.GT
            }
        }
        cases[key].prototype.lessThan = function(o){
            return this.compare(o).isLT()
        }
        cases[key].prototype.greaterThan = function(o){
            return this.compare(o).isGT()
        }
        cases[key].prototype.greaterThanOrEqual = function(o){
            return !this.compare(o).isLT()
        }
    })
}

export const Ordering = EnumType("Ordering",[ "LT", "EQ", "GT" ])

export default Ord