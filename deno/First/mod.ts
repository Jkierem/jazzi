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
import type { First, FirstRep } from "./types.ts";

const Defs: any = {
  trivials: ["First"],
  zero: "First",
  resolve: ["First"],
  overrides: {
    concat: {
      First<A>(this: First<A>, o: First<A>) {
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

function defaultConstructor<A>(this: FirstRep, x: A) {
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
}) as unknown as FirstRep;

export default First;
