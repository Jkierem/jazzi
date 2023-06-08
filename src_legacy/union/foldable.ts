import { prop } from "../_internals";
import { setTypeclass } from "../_internals/symbols"
import { AnyConstRec, AnyFnRec, AnyFn } from "../_internals/types";

const mark = setTypeclass("Foldable")

type FoldableDefs = {
    overrides: {
        fold: AnyFnRec
    }
}

export interface Foldable {
    /**
     * Catamorphism. Breaks structure using the provided functions. 
     */
    fold: (fnLeft: AnyFn, fnRight: AnyFn) => any
}

/**
 * Adds fold method to proto
 */
const Foldable = (defs: FoldableDefs) => mark((cases: AnyConstRec) => {
    const overrides = prop("overrides")(defs);
    Object.keys(cases).forEach((key) => {
        cases[key].prototype.fold = overrides?.fold?.[key]
    })
})

setTypeclass("Foldable")(Foldable)

export default Foldable