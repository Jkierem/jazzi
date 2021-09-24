import { equals as rEquals, isNil, isEmpty, empty } from "../_internals/functions";
import { match as globalMatch } from "../_tools";
import {
  Functor,
  Monad,
  Applicative,
  Eq,
  Semigroup,
  Show,
  Monoid,
  Tap,
  Foldable,
  Filterable,
  Thenable,
} from "../Union";
import Union from '../Union/union'

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
    },
    fold: {
      Just(onNone,onJust){ return onJust(this.get()) },
      None(onNone,onJust){ return onNone() }
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
    Tap(MaybeDefs),
    Eq(MaybeDefs),
    Monad(MaybeDefs),
    Monoid(MaybeDefs),
    Applicative(MaybeDefs),
    Semigroup(MaybeDefs),
    Filterable(MaybeDefs),
    Thenable(MaybeDefs),
    Show(MaybeDefs),
    Foldable(MaybeDefs),
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
  isEmpty(x) {
    return x?.isNone() || isEmpty(x?.get?.()) || false;
  },
  match: globalMatch,
  equals: rEquals,
});

export default Maybe;
