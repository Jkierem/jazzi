import equals from "https://deno.land/x/ramda@v0.27.2/source/equals.js";
import mergeAll from "https://deno.land/x/ramda@v0.27.2/source/mergeAll.js";
import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union/mod.js";
import Union from "../Union/union.js";
import { monoidToPromise } from "../_internals/mod.js";

const Defs = {
  trivials: ["Merge"],
  identities: ["Empty"],
  zero: "Empty",
  resolve: ["Merge"],
  reject: ["Empty"],
  overrides: {
    concat: {
      Merge(m) {
        return Merge.from(mergeAll([this.get(), m.get()]));
      },
    },
    toPromise: {
      Merge: monoidToPromise,
      Empty: monoidToPromise,
    }
  },
};

function defaultConstructor(x) {
  return equals({}, x) ? this.Empty() : this.Merge(x);
}

const Merge = Union(
  "Merge",
  {
    Merge: (x) => x,
    Empty: () => ({}),
  },
  [
    Eq({
      trivials: ["Merge", "Empty"],
      empties: [],
    }),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Thenable(Defs),
    Show(Defs),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Merge;