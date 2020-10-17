import { propOr } from "ramda";
import { forEachValue, getVariant } from "../_internals";

const Enum = (defs) => (cases,globals) => {
    const order = propOr(undefined,"order",defs);
    const defaultOrder = Object.keys(cases);
    const overrides = propOr({},"overrides",defs)
    const toEnum = propOr(undefined,"toEnum",overrides)
    const fromEnum = propOr(undefined,"fromEnum",overrides)
    if( order ){
        globals.fromEnum = (en) => order.findIndex(x => x === getVariant(en))
        globals.toEnum = (i) => { 
            const c = cases[order[i]]
            return c ? new c() : undefined
        }
    }
    else if( toEnum && fromEnum ){
        globals.toEnum = toEnum
        globals.fromEnum = fromEnum
    }
    else {
        globals.fromEnum = (en) => defaultOrder.findIndex(x => x === getVariant(en))
        globals.toEnum = (i) => { 
            const c = cases[defaultOrder[i]]
            return c ? new c() : undefined
        }
    }
    forEachValue((variant) => {
        variant.prototype.succ = function(){
            return globals.toEnum( globals.fromEnum(this) + 1 )
        }
        variant.prototype.pred = function(){
            return globals.toEnum( globals.fromEnum(this) - 1 )
        }
    },cases)
    globals.pred = en => en.pred()
    globals.succ = en => en.succ()
    globals.range = (start,end) => {
        const res = []
        let cur = start;
        while ( cur && !cur.equals(end) ){
            res.push(cur)
            cur = cur.succ()
        }
        if( cur?.equals?.(end) ){
            res.push(end)
        }
        return res
    }
}

export default Enum