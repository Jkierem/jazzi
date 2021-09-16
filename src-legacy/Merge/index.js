import equals from "ramda/src/equals";
import mergeAll from "ramda/src/mergeAll";
import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable,
} from "../Union";
import Union from '../Union/union'
import { monoidToPromise } from "../_internals";

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
