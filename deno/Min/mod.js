import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union/mod.js";
import Union from "../Union/union.js";
import { isNil, monoidThen, monoidToPromise } from "../_internals/mod.js";

const Defs = {
  trivials: ["Min"],
  zero: "Min",
  resolve: ["Min"],
  overrides: {
    concat: {
      Min(o) {
        return this.get() > o.get() ? o : this;
      },
    },
    empty: {
      Min() {
        return Min.of(Infinity);
      },
    },
    then: {
      Min: monoidThen
    },
    toPromise: {
      Min: monoidToPromise
    },
  },
};

function defaultConstructor(x) {
  return this.Min(x);
}

const Min = Union(
  "Min",
  {
    Min: (x) => (isNil(x) ? Infinity : x),
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

export default Min;
