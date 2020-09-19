import { Eq, Monad, Monoid, Semigroup, Union } from '../Union';

const Defs = {
    pure: "Mult",
    trivials: ["Mult"],
    identities: ["One"],
    zero: "One",
    overrides: {
        concat: {
            Mult(o){ return Mult.from(this.get() * o.get()) }
        }
    }
}

const Mult = Union("Mult",{
    Mult:  x => x,
    One : () => 1
},[
    Eq({ 
        trivials:["Mult","One"], 
        empties: [] 
    }),
    Monad(Defs),
    Semigroup(Defs),
    Monoid(Defs)
]).constructors({
    from(x){ return x === 1 ? this.One() : this.Mult(x) }
})

export default Mult;