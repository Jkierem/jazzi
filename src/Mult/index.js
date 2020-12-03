import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
} from "../Union";
import Union from '../Union/union'

const Defs = {
  trivials: ["Mult"],
  identities: ["One"],
  zero: "One",
  overrides: {
    concat: {
      Mult(o) {
        return Mult.from(this.get() * o.get());
      },
    },
  },
};

function defaultConstructor(x) {
  return x === 1 ? this.One() : this.Mult(x);
}

const Mult = Union(
  "Mult",
  {
    Mult: (x) => x,
    One: () => 1,
  },
  [
    Eq({
      trivials: ["Mult", "One"],
      empties: [],
    }),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Show(Defs),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Mult;
