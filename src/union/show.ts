import { getInnerValue, getTypeName, getVariant } from "../_internals/symbols"
import { Boxed } from "../_internals/types"

export interface Show { 
    show: () => string,
    toString: () => string
}

export const Show = <A,V extends Boxed<A>>(impl?: (a: A) => string) => (v: V): V & Show => {
    if( impl ){
        return {
            ...v,
            show(){
                return impl(getInnerValue(this))
            },
            toString(){ return this.show() }
        }
    }
    return {
        ...v,
        show(){
            return `[${getTypeName(this)} => ${getVariant(this)} ${getInnerValue(this)}]`
        },
        toString(){ return this.show() }
    }
}