import { isNil } from "ramda";
import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
} from "../Union";
import Union from '../Union/union'

const Defs = {
  trivials: ["Max"],
  zero: "Max",
  overrides: {
    concat: {
      Max(o) {
        return this.get() < o.get() ? o : this;
      },
    },
    empty: {
      Max() {
        return Max.of(-Infinity);
      },
    },
  },
};

function defaultConstructor(x) {
  return this.Max(x);
}

const Max = Union(
  "Max",
  {
    Max: (x) => (isNil(x) ? -Infinity : x),
  },
  [Eq(Defs), Functor(Defs), Semigroup(Defs), Monoid(Defs), Show()]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
});

export default Max;
