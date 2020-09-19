import { Eq, Monad, Monoid, Semigroup, Union } from '../Union';

const Defs = {
    pure: "Sum",
    trivials: ["Sum"],
    identities: ["Zero"],
    zero: "Zero",
    overrides: {
        concat: {
            Sum(o){ return Sum.from(this.get() + o.get()) }
        }
    }
}

const Sum = Union("Sum",{
    Sum :  x => x,
    Zero: () => 0,
},[
    Eq({
        trivials: ["Sum","Zero"],
        empties: []
    }),
    Monad(Defs),
    Semigroup(Defs),
    Monoid(Defs)
]).constructors({
    from(x){ return x === 0 ? this.Zero() : this.Sum(x) },
})

export default Sum