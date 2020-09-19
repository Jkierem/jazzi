import { equals as eq } from "ramda"
import { currySetTypeclass, getVariant } from "../_internals"

const mark = currySetTypeclass("Eq")

const Eq = ({ trivials, empties, overrides }) => mark((cases) => {
    function trivialEquals(other){
        return getVariant(this) === getVariant(other) && eq(this.get(), other.get())
    }
    function emptyEquals(other){
        return getVariant(this) === getVariant(other)
    }
    trivials.forEach(trivial => {
        const equals = overrides?.equals?.[trivial] || trivialEquals
        cases[trivial].prototype.equals = equals
    })
    empties.forEach(empt => {
        const equals = overrides?.equals?.[empt] || emptyEquals
        cases[empt].prototype.equals = equals
    })
})

export default mark(Eq);