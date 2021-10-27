import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union/mod.ts";
import Union from "../Union/union.ts";
import { monoidThen, monoidToPromise } from "../_internals/mod.ts";
import type { Last, LastRep } from "./types.ts";

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
