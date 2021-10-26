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
import type { Last, LastRep } from "./types";

const Defs: any = {
  trivials: ["Last"],
  zero: "Last",
  resolve: ["Last"],
  overrides: {
    concat: {
      Last<T>(o: Last<T>) {
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

function defaultConstructor<A>(this: LastRep, x: A) {
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
