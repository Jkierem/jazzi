import {
  Eq,
  Functor,
  Monoid,
  Ord,
  Semigroup,
  Show,
  Thenable,
} from "../Union/mod.ts";
import Union from "../Union/union.ts";
import { isNil, monoidThen, monoidToPromise } from "../_internals/mod.ts";
import { lessThanOrEqual } from "../_tools/mod.ts";
import { Min, MinRep } from "./types.ts";

const Defs: any = {
  trivials: ["Min"],
  zero: "Min",
  resolve: ["Min"],
  overrides: {
    concat: {
      Min(this: Min, o: Min) {
        return this.greaterThan(o) ? o : this;
      },
    },
    empty: {
      Min() {
        return Min.of(Infinity);
      },
    },
    lessThanOrEqual(this: Min, o: Min){
      return lessThanOrEqual(this.get(), o.get())
    },
    then: {
      Min: monoidThen
    },
    toPromise: {
      Min: monoidToPromise
    },
  },
};

function defaultConstructor(this: MinRep, x: any) {
  return this.Min(x);
}

const Min = Union(
  "Min",
  {
    Min: (x) => (isNil(x) ? Infinity : x),
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
}) as unknown as MinRep;

export default Min;
