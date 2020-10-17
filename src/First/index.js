import { Eq, Functor, Monoid, Semigroup, Show, Union } from '../Union';

const Defs = {
    trivials: ["First"],
    zero: "First",
    overrides: {
        concat: {
            First(o){ return this.get() === undefined ? o : this }
        },
    }
}

function defaultConstructor(x){ return this.First(x) }

const First = Union("First",{
    First :  x => x,
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

export default First