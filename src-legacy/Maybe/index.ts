import { equals, isNil, isEmpty, empty } from "../_internals/functions";
import { match } from "../_tools";
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
import { AnyConstRec, AnyFn } from "../_internals/types";
import { Maybe, MaybeRep } from "./types";

const MaybeType = () => (cases: AnyConstRec) => {
  cases.Just.prototype.ifNone = function () {
    return this;
  };
  cases.Just.prototype.ifJust = function (fn: AnyFn) {
    return fn(this.get());
  };
  cases.None.prototype.ifNone = function (fn: AnyFn) {
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
    fmap: undefined,
    tap: undefined,
    equals: undefined,
    chain: undefined,
    apply: undefined,
    concat: undefined,
    toPromise: undefined,
    show: {
      None() {
        return `[Maybe => None]`;
      },
    },
    empty: {
      Just<A>(this: Maybe<A>): Maybe<A> {
        return Maybe.fromNullish(empty(this.get())) as Maybe<A>;
      },
    },
    filter: {
      Just<A>(this: Maybe<A>, fn: (a: A) => boolean) {
        return Maybe.fromPredicate(fn, this.get());
      },
    },
    fold: {
      Just<A,B,C>(this: Maybe<A>, onNone: () => B, onJust: (a: A) => C){ return onJust(this.get()) },
      None<A,B,C>(this: Maybe<A>, onNone: () => B, onJust: (a: A) => C){ return onNone() }
    }
  },
};

function defaultConstructor<T>(this: MaybeRep, x: T): Maybe<T> {
  return x ? this.Just(x) : this.None<T>();
}

const Maybe: MaybeRep = Union(
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
  fromArray<A extends any[]>(this: MaybeRep, arr: A): Maybe<A> {
    return arr.length === 0 ? this.None<A>() : this.Just<A>(arr);
  },
  fromNullish<A>(this: MaybeRep, x: A): Maybe<A> {
    return isNil(x) ? this.None() : this.Just(x);
  },
  fromEmpty<A>(this: MaybeRep, x: A): Maybe<A> {
    return isEmpty(x) ? this.None() : this.Just(x);
  },
  fromPredicate<A>(this: MaybeRep, pred: (a: A) => boolean, val: A) {
    return pred(val) ? this.Just(val) : this.None();
  },
  isEmpty(x: any) {
    return x?.isNone?.() || isEmpty(x?.get?.()) || false;
  },
  match,
  equals,
}) as unknown as MaybeRep;

export default Maybe;