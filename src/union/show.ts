import { propOr } from "../_internals";
import { getVariant, getInnerValue, setTypeclass, getTypeName } from "../_internals/symbols"
import { AnyBoxed, AnyConstRec, AnyFn } from "../_internals/types";

type ShowDefs = {
    overrides?: {
        show?: {
            [P: string]: AnyFn
        }
    }
} 

export interface Show {
    /**
     * Returns the string representation
     */
    show(): string;
    /**
     * Returns the string representation
     */
    toString(): string;
}

export interface LazyShow<Type extends string, Var extends string> extends LiteralShow<Type, `${Var} => _`> {}

export interface LiteralShow<Type extends string, Val extends string> {
    /**
     * Returns the string representation
     */
    show(): `[${Type} => ${Val}]`;
    /**
     * Returns the string representation
     */
    toString(): string;
}

/**
 * Adds show and toString method to proto
 */
const Show = (defs?: ShowDefs) => setTypeclass("Show")((cases: AnyConstRec) => {
    const overrides = propOr({},"overrides",defs ?? {});
    Object.keys(cases).forEach(trivial => {
        function trivialShow(this: AnyBoxed){
            return `[${getTypeName(this)} => ${getVariant(this)} ${getInnerValue(this)}]`;
        }
        const show = overrides?.show?.[trivial] || trivialShow
        cases[trivial].prototype.show = show
        cases[trivial].prototype.toString = show
    })
})

setTypeclass("Show")(Show)

export default Show