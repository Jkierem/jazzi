import { isNil } from "../_internals/index.js";
import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union/index.js";
import Union from "../Union/union.js";
import { monoidThen, monoidToPromise } from "../_internals/index.js";

const Defs = {
  trivials: ["Max"],
  zero: "Max",
  resolve: ["Max"],
  overrides: {
    concat: {
      Max(o) {
        return this.get() < o.get() ? o : this;
      },
    },
    empty: {
      Max() {
        return Max.of(-Infinity);
      },
    },
    then: {
      Max: monoidThen
    },
    toPromise: {
      Max: monoidToPromise
    },
  },
};

function defaultConstructor(x) {
  return this.Max(x);
}

const Max = Union(
  "Max",
  {
    Max: (x) => (isNil(x) ? -Infinity : x),
  },
  [
    Eq(Defs), 
    Functor(Defs), 
    Semigroup(Defs), 
    Monoid(Defs),
    Thenable(Defs),
    Show()
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Max;
