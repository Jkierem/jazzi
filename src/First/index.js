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
