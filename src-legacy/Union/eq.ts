import { forEachValue, propOr, equals as eq } from "../_internals"
import { getTypeName, getVariant, setTypeclass } from "../_internals/symbols"
import { AnyBoxed, AnyConstRec } from "../_internals/types"

const mark = setTypeclass("Eq")

type EqDefs = { 
    trivials?: string[],
    empties?: string[],
    overrides?: {
        equals?: any
    }
}

export interface Eq {
    /**
     * Performs an equality check
     * @param e Eq to be compared with
     */
    equals(e: Eq): boolean;
}

export interface EqRep { 
    /**
     * Performs an equality check
     * @param ea 
     * @param eb 
     */
    equals(ea: Eq, eb: Eq): boolean; 
}

/**
 * Adds equals method to proto and global
*/
const Eq = (defs: EqDefs) => mark((cases: AnyConstRec, globals: any) => {
    const trivials = propOr([],"trivials",defs)
    const empties = propOr([],"empties",defs)
    const overrides = propOr({},"overrides",defs)
    function trivialEquals(this: AnyBoxed, other: AnyBoxed){
        if( 
            getTypeName(this) !== getTypeName(other) ||
            getVariant(this) !== getVariant(other) 
        ){
            return false
        } 
        const a = this?.get?.()
        const b = other?.get?.()
        if( a?.equals ){
            return a.equals(b)
        }
        if( b?.equals ){
            return b.equals(a)
        }
        return eq(a, b)
    }
    function emptyEquals(this: AnyBoxed, other: AnyBoxed){
        return getTypeName(this) === getTypeName(other) && getVariant(this) === getVariant(other)
    }
    trivials.forEach(trivial => {
        cases[trivial].prototype.equals = trivialEquals
    })
    empties.forEach(empt => {
        cases[empt].prototype.equals = emptyEquals
    })
    forEachValue((override,key) => {
        cases[key].prototype.equals = override
    }, overrides?.equals || {})
    globals.equals = eq;
})

mark(Eq);

export default Eq;