import { Eq, Functor, Monoid, Semigroup, Show, Union } from '../Union';

const Defs = {
    trivials: ["Last"],
    zero: "Last",
    overrides: {
        concat: {
            Last(o){ return o }
        },
    }
}

function defaultConstructor(x){ return this.Last(x) }

const Last = Union("Last",{
    Last :  x => x,
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

export default Last