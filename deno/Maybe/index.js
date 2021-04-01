import { default as rEquals } from "https://deno.land/x/ramda@v0.27.2/source/equals.js";
import isEmpty from "https://deno.land/x/ramda@v0.27.2/source/isEmpty.js";
import empty from "https://deno.land/x/ramda@v0.27.2/source/empty.js";
import { isNil } from "../_internals/index.js";
import { match as globalMatch } from "../_tools/index.js";
import {
  Functor,
  Monad,
  Applicative,
  Eq,
  Semigroup,
  Show,
  Monoid,
  Effect,
  Filterable,
  Thenable,
} from "../Union/index.js";
import Union from "../Union/union.js";

const MaybeType = () => (cases) => {
  cases.Just.prototype.ifNone = function () {
    return this;
  };
  cases.Just.prototype.ifJust = function (fn) {
    return fn(this.get());
  };
  cases.None.prototype.ifNone = function (fn) {
    return fn();
  };
  cases.None.prototype.ifJust = function () {
    return this;
  };
};

const MaybeDefs = {
  trivials: ["Just"],
  identities: ["None"],
  empties: ["None"],
  pure: "Just",
  zero: "None",
  resolve: ["Just"],
  reject: ["None"],
  overrides: {
    show: {
      None() {
        return `[Maybe => None]`;
      },
    },
    empty: {
      Just() {
        return Maybe.fromNullish(empty(this.get()));
      },
    },
    filter: {
      Just(fn) {
        return Maybe.fromPredicate(fn, this.get());
      },
    }
  },
};

function defaultConstructor(x) {
  return x ? this.Just(x) : this.None();
}

const Maybe = Union(
  "Maybe",
  {
    Just: (x) => x,
    None: () => {},
  },
  [
    Functor(MaybeDefs),
    Effect(MaybeDefs),
    Eq(MaybeDefs),
    Monad(MaybeDefs),
    Monoid(MaybeDefs),
    Applicative(MaybeDefs),
    Semigroup(MaybeDefs),
    Filterable(MaybeDefs),
    Thenable(MaybeDefs),
    Show(MaybeDefs),
    MaybeType(),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
  fromFalsy: defaultConstructor,
  fromArray(arr) {
    return arr.length === 0 ? this.None() : this.Just(arr);
  },
  fromNullish(x) {
    return isNil(x) ? this.None() : this.Just(x);
  },
  fromEmpty(x) {
    return isEmpty(x) ? this.None() : this.Just(x);
  },
  fromPredicate(pred, val) {
    return pred(val) ? this.Just(val) : this.None();
  },
  fromResult(r) {
    return r?.match?.({
      Ok: this.Just,
      Err: this.None,
    });
  },
  isEmpty(x) {
    return x?.isNone() || isEmpty(x?.get?.()) || false;
  },
  match: globalMatch,
  equals: rEquals,
});

export default Maybe;
