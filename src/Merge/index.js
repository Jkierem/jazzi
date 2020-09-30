import { equals, mergeAll } from "ramda";
import { Eq, Functor, Monad, Monoid, Semigroup, Show, Union } from "../Union";

const Defs = {
    trivials: ["Merge"],
    identities: ["Empty"],
    zero: "Empty", 
    overrides: {
        concat: {
            Merge(m){ return Merge.from(mergeAll([this.get(),m.get()])) }
        }
    }
}

function defaultConstructor(x){
    return equals({},x) ? this.Empty() : this.Merge(x);
}

const Merge = Union("Merge",{
    Merge: x => x,
    Empty: () => ({})
},[
    Eq({
        trivials: [ "Merge", "Empty" ],
        empties: []
    }),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Show(Defs)
]).constructors({
    of: defaultConstructor,
    from: defaultConstructor
})

export default Merge