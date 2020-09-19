import { equals, mergeAll } from "ramda";
import { Eq, Monad, Monoid, Semigroup, Union } from "../Union";

const Defs = {
    pure: "Merge",
    trivials: ["Merge"],
    identities: ["Empty"],
    zero: "Empty", 
    overrides: {
        concat: {
            Merge(m){ return Merge.from(mergeAll([this.get(),m.get()])) }
        }
    }
}

const Merge = Union("Merge",{
    Merge: x => x,
    Empty: () => ({})
},[
    Eq({
        trivials: ["Merge","Empty"],
        empties: []
    }),
    Monad(Defs),
    Semigroup(Defs),
    Monoid(Defs)
]).constructors({
    from(x){ return equals({},x) ? this.Empty() : this.Merge(x); }
})

export default Merge