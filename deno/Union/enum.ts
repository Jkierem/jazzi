import { propOr, prop, forEachValue } from "../_internals/mod.ts";
import { getVariant, setTypeclass } from "../_internals/symbols.ts";
import { AnyConstRec } from "../_internals/types.ts";
import { Eq } from "./eq.ts";

const mark = setTypeclass("Enum")

type EnumDefs = {
    order?: string[],
    overrides?: {
        toEnum?: (i: number) => Enum,
        fromEnum?: (en: Enum) => number
    }
}

export interface Enum extends Eq {
    /**
     * Returns succesor, if it exists.
     */
    succ(): Enum | undefined;
    /**
     * Returns predecessor, if it exists.
     */
    pred(): Enum | undefined; 
}

export interface EnumRep {
    /**
     * Return predecessor of an inhabitant of the Enum type
     * @param {Enum} v Enum value
     */
    pred(v: Enum): Enum | undefined;
    /**
     * Return successor of an inhabitant of the Enum type
     * @param {Enum} v Enum value
     */
    succ(v: Enum): Enum | undefined;
    /**
     * Returns an array from start to end (exclusive)
     * @param {Enum} start
     * @param {Enum} end
     */
    range(start: Enum, end: Enum): Enum[];
    /**
     * Returns numeric representation of Enum value. -1 if does not belong on Enum type
     * @param {Enum} en 
     */
    fromEnum(en: Enum): number;
    /**
     * Returns respective Enum value of the Enum type. Undefined if non-existant
     * @param {number} i 
     */
    toEnum(i: number): Enum | undefined;
}

/**
 * Adds succ and pred method to proto and pred, succ, fromEnum, toEnum and range to global
 */
const Enum = (defs: EnumDefs) => mark((cases: AnyConstRec, globals: any) => {
    const order = prop("order")(defs);
    const defaultOrder = Object.keys(cases);
    const overrides = propOr({},"overrides",defs)
    const toEnum = prop("toEnum")(overrides)
    const fromEnum = prop("fromEnum")(overrides)
    if( order ){
        globals.fromEnum = (en: Enum) => order.findIndex(x => x === getVariant(en))
        globals.toEnum = (i: number) => { 
            const c = cases[order[i]]
            return c ? new c() : undefined
        }
    } else if( toEnum && fromEnum ){
        globals.toEnum = toEnum
        globals.fromEnum = fromEnum
    } else {
        globals.fromEnum = (en: Enum) => defaultOrder.findIndex(x => x === getVariant(en))
        globals.toEnum = (i: number) => { 
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
    globals.pred = (en: Enum) => en.pred()
    globals.succ = (en: Enum) => en.succ()
    globals.range = (start: Enum, end: Enum) => {
        const res = []
        let cur: Enum | undefined = start;
        while ( cur && !cur.equals(end) ){
            res.push(cur)
            cur = cur.succ()
        }
        if( cur?.equals?.(end) ){
            res.push(end)
        }
        return res
    }
})

mark(Enum)

export default Enum