import { isNil } from "../_internals";
import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union";
import Union from '../Union/union'
import { monoidThen, monoidToPromise } from "../_internals";

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
