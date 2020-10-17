import { isNil } from 'ramda';
import { Eq, Functor, Monoid, Semigroup, Show, Union } from '../Union';

const Defs = {
    trivials: ["Min"],
    zero: "Min",
    overrides: {
        concat: {
            Min(o){ return this.get() > o.get() ? o : this }
        },
        empty: {
            Min(){ return Min.of(Infinity) }
        }
    }
}

function defaultConstructor(x){ return this.Min(x) }

const Min = Union("Min",{
    Min :  x => isNil(x) ? Infinity : x,
},[
    Eq(Defs),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Show()
]).constructors({
    of: defaultConstructor,
    from: defaultConstructor
})

export default Min