import { forEachValue, assoc, propOr } from "../_internals/mod.ts";
import { getVariant, setTypeclass } from "../_internals/symbols.ts";
import { AnyConstRec } from "../_internals/types.ts";
import Enum, { Enum as TEnum, EnumRep } from "./enum.ts";
import Eq, { Eq as TEq, EqRep } from "./eq.ts";
import Show, { Show as TShow } from "./show.ts";
import Union from "./union.ts";

const mark = setTypeclass("Ord")

const rawCases = ["LT","EQ","GT"] as const
interface Ordering extends TEq, TEnum, Ord, TShow {
    equals(e: Ordering): boolean;
    succ(): Ordering | undefined;
    pred(): Ordering | undefined;
    compare(o: Ord): Ordering;
    lessThanOrEqual(o: Ord): boolean;
    greaterThan(o: Ord): boolean;
    greaterThanOrEqual(o: Ord): boolean;
    show(): string;
    toString(): string;
}

interface OrderingRep 
extends EqRep, EnumRep {
    LT: Ordering;
    EQ: Ordering;
    GT: Ordering;
    equals(ea: Ordering, eb: Ordering): boolean; 
    pred(v: Ordering): Ordering | undefined;
    succ(v: Ordering): Ordering | undefined;
    range(start: Ordering, end: Ordering): Ordering[];
    fromEnum(en: Ordering): number;
    toEnum(i: number): Ordering | undefined;
}

const Ordering = Union("Ordering",{
    LT: () => {},
    EQ: () => {},
    GT: () => {},
},[
    Eq({ empties: rawCases as unknown as string[] }),
    Enum({ order: rawCases as unknown as string[] }),
    Ord({ order: rawCases as unknown as string[] }),
    Show({ overrides: {
        show: rawCases.reduce((acc,next) => {
            return assoc(next,() => `[Ordering => ${next}]`,acc)
        },{} as Record<typeof rawCases[number], () => string>)
    } }),
    (cases: AnyConstRec, globals: any) => {
        rawCases.forEach((key) => {
            globals[key] = new cases[key]();
        })
    }
]).constructors({}) as unknown as OrderingRep

type OrdDefs = { 
    order?: string[], 
    overrides?: { 
        lessThanOrEqual?: (this: any, a: any) => boolean, 
        compare?: (this: any, a: any) => Ordering 
    }
}

export interface Ord {
    /**
     * Compares two Ord values
     * @param {Ord} o ord to compare to
     * @returns {Ordering}
     */
    compare(o: Ord): Ordering;
    /**
     * Returns whether caller is less than or equal to the argument
     * @param {Ord} o ord to compare to
     */
    lessThanOrEqual(o: Ord): boolean;
    /**
     * Returns whether caller is greater than the argument
     * @param {Ord} o ord to compare to
     */
    greaterThan(o: Ord): boolean;
    /**
     * Returns whether caller is greater than or equal to the argument
     * @param {Ord} o ord to compare to
     */
    greaterThanOrEqual(o: Ord): boolean;
}

/**
 * Partial ordering. Adds compare, lessThanOrEqual, greaterThan and greaterThanOrEqual methods to proto.
 * __Requires order or overrides for either lessThanOrEqual or compare__
 * @param defs 
 * @returns 
 */
function Ord(defs: OrdDefs){ 
    return mark((cases: AnyConstRec) => {
        const order = propOr([],"order",defs)
        const overrides = propOr({},"overrides",defs);
        const ltBased      = overrides?.lessThanOrEqual || false;
        const compareBased = overrides?.compare         || false;
        const orderBased   = order.length               || false;
        forEachValue( variant => {
            if( ltBased ){
                variant.prototype.lessThanOrEqual = overrides.lessThanOrEqual
                variant.prototype.compare = function(o: any){
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
                variant.prototype.lessThanOrEqual = function(o: any){
                    return !this.compare(o).isGT()
                }
            } else if( orderBased ) {
                variant.prototype.lessThanOrEqual = function(o: any){
                    const getOrder = (y: any) => order.findIndex(x => x === getVariant(y))
                    const a = getOrder(this)
                    const b = getOrder(o)
                    return a <= b
                }
                variant.prototype.compare = function(o: any){
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
            variant.prototype.lessThan = function(o: any){
                return this.compare(o).isLT()
            }
            variant.prototype.greaterThan = function(o: any){
                return this.compare(o).isGT()
            }
            variant.prototype.greaterThanOrEqual = function(o: any){
                return !this.compare(o).isLT()
            }
        },cases)
    })
}

mark(Ord)

export default Ord

export { Ordering }