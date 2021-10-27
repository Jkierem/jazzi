import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union/mod.ts";
import Union from "../Union/union.ts";
import { equals, monoidToPromise, merge } from "../_internals/mod.ts";
import { Merge, MergeRep } from "./types.ts";

const Defs: any = {
  trivials: ["Merge"],
  identities: ["Empty"],
  zero: "Empty",
  resolve: ["Merge"],
  reject: ["Empty"],
  overrides: {
    concat: {
      Merge(this: Merge<any>, m: Merge<any>) {
        return Merge.from(merge(this.get(), m.get()));
      },
    },
    toPromise: {
      Merge: monoidToPromise,
      Empty: monoidToPromise,
    }
  },
};

function defaultConstructor(this: MergeRep, x: any) {
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
}) as unknown as MergeRep;

export default Merge;
