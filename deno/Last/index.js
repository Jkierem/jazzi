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
  trivials: ["Last"],
  zero: "Last",
  resolve: ["Last"],
  overrides: {
    concat: {
      Last(o) {
        return o;
      },
    },
    then: {
      Last: monoidThen,
    },
    toPromise: {
      Last: monoidToPromise
    }
  },
};

function defaultConstructor(x) {
  return this.Last(x);
}

const Last = Union(
  "Last",
  {
    Last: (x) => x,
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

export default Last;
