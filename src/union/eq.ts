import { equals } from "../_internals/functions"
import { getVariant } from "../_internals/symbols"
import { Family } from "../_internals/types"

export interface Eq<TName extends string> {
    equals: (eqA: Family<TName>) => boolean
}

export const Eq = <TName extends string, EqT extends Family<TName>>(impl?: (this: Family<TName>, other: Family<TName>) => boolean) => (eq: EqT): EqT & Eq<TName> => {
        if( impl ){
            return {
                ...eq,
                equals: impl
            }
        }
        return {
            ...eq,
            equals(other: Family<TName>){
                if( getVariant(this) !== getVariant(other) ){
                    return false;
                }
                const a = this.get()
                const b = other.get()
                if( a.equals ){
                    return a.equals(b)
                }
                if( b.equals ){
                    return b.equals(a)
                }
                return equals(a,b)
            }
        }
    }