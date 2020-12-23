import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable
} from "../Union";
import Union from '../Union/union'
import { monoidToPromise } from "../_internals";

const Defs = {
  trivials: ["Sum"],
  identities: ["Zero"],
  zero: "Zero",
  resolve: ["Sum"],
  reject: ["Zero"],
  overrides: {
    concat: {
      Sum(o) {
        return Sum.from(this.get() + o.get());
      },
    },
    toPromise: {
      Sum: monoidToPromise,
      Zero: monoidToPromise
    },
  },
};

function defaultConstructor(x) {
  return x === 0 ? this.Zero() : this.Sum(x);
}

const Sum = Union(
  "Sum",
  {
    Sum: (x) => x,
    Zero: () => 0,
  },
  [
    Eq({
      trivials: ["Sum", "Zero"],
      empties: [],
    }),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Thenable(Defs),
    Show(),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Sum;
