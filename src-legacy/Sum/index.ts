import {
  Eq,
  Functor,
  Monoid,
  Semigroup,
  Show,
  Thenable
} from "../Union";
import Union from '../Union/union'
import { equals, monoidToPromise } from "../_internals";
import { Sum, SumRep } from "./types";

const Defs = {
  trivials: ["Sum"],
  identities: ["Zero"],
  zero: "Zero",
  resolve: ["Sum"],
  reject: ["Zero"],
  overrides: {
    fmap: undefined,
    empty: undefined,
    concat: {
      Sum(this: Sum, o: Sum) {
        if( o.isZero() ){
          return this
        }
        return Sum.from(this.get() + o.get());
      }
    },
    equals: {
      Sum(this: Sum, o: Sum) {
        return equals(this.get(),o.get())
      },
      Zero(this: Sum, o: Sum) {
        return equals(this.get(),o.get())
      },
    },
    toPromise: {
      Sum: monoidToPromise,
      Zero: monoidToPromise
    },
  },
};

function defaultConstructor(this: SumRep, x: number): Sum {
  return x === 0 ? this.Zero() : this.Sum(x);
}

const Sum = Union(
  "Sum",
  {
    Sum: (x: number) => x,
    Zero: () => 0,
  },
  [
    Eq(Defs),
    Functor(Defs),
    Semigroup(Defs),
    Monoid(Defs),
    Thenable(Defs),
    Show(),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
}) as unknown as SumRep;

export default Sum;
