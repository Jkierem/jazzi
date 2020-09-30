import { Eq, Functor, Monoid, Semigroup, Show, Union } from '../Union';

const Defs = {
    trivials: ["Sum"],
    identities: ["Zero"],
    zero: "Zero",
    overrides: {
        concat: {
            Sum(o){ return Sum.from(this.get() + o.get()) }
        }
    }
}

function defaultConstructor(x){ return x === 0 ? this.Zero() : this.Sum(x) }

const Sum = Union("Sum",{
    Sum :  x => x,
    Zero: () => 0,
},[
    Eq({
        trivials: ["Sum","Zero"],
        empties: []
    }),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Show()
]).constructors({
    of: defaultConstructor,
    from: defaultConstructor
})

export default Sum