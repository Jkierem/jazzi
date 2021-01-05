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
  trivials: ["First"],
  zero: "First",
  resolve: ["First"],
  overrides: {
    concat: {
      First(o) {
        return this.get() === undefined ? o : this;
      },
    },
    then: {
      First: monoidThen
    },
    toPromise: {
      First: monoidToPromise
    }
  },
};

function defaultConstructor(x) {
  return this.First(x);
}

const First = Union(
  "First",
  {
    First: (x) => x,
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

export default First;
