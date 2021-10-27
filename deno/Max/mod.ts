import { isNil } from "../_internals/functions.ts";
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
import { Max, MaxRep } from "./types.ts";

const Defs: any = {
  trivials: ["Max"],
  zero: "Max",
  resolve: ["Max"],
  overrides: {
    concat: {
      Max(this: Max, o: Max) {
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

function defaultConstructor(this: MaxRep, x: any) {
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
}) as unknown as MaxRep;

export default Max;
