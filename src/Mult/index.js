import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union";
import Union from '../Union/union'
import { monoidToPromise } from "../_internals";

const Defs = {
  trivials: ["Mult"],
  identities: ["One"],
  zero: "One",
  resolve: ["Mult"],
  reject: ["One"],
  overrides: {
    concat: {
      Mult(o) {
        return Mult.from(this.get() * o.get());
      },
    },
    toPromise: {
      Mult: monoidToPromise,
      One: monoidToPromise,
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
    Thenable(Defs),
    Show(Defs),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Mult;
