import { isNil } from "../_internals/functions";
import {
  Eq,
  Functor,
  Monoid,
  Ord,
  Semigroup,
  Show,
  Thenable,
} from "../Union";
import Union from '../Union/union'
import { monoidThen, monoidToPromise } from "../_internals";
import { Max, MaxRep } from "./types";
import { lessThanOrEqual } from "../_tools";

const Defs: any = {
  trivials: ["Max"],
  zero: "Max",
  resolve: ["Max"],
  overrides: {
    concat: {
      Max(this: Max, o: Max) {
        return this.lessThan(o) ? o : this;
      },
    },
    lessThanOrEqual(this: Max, o: Max) {
      return lessThanOrEqual(this.get(), o.get())
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
    Ord(Defs),
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
