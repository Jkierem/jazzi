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
  Traversable,
} from "../Union";
import Union from '../Union/union'
import { AnyConstRec, AnyFn } from "../_internals/types";
import { Maybe, MaybeRep } from "./types";
import { getTypeName } from "../_internals/symbols";
import Async from "../Async"

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
  cases.Just.prototype.toAsync = function(){
    return Async.Success(this.get())
  }
  cases.None.prototype.toAsync = function(){
    return Async.Fail(undefined)
  }
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
    traverse: undefined,
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
        return Maybe.fromCondition(fn, this.get());
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
    Applicative(MaybeDefs),
    Monad(MaybeDefs),
    Tap(MaybeDefs),
    Eq(MaybeDefs),
    Semigroup(MaybeDefs),
    Monoid(MaybeDefs),
    Filterable(MaybeDefs),
    Thenable(MaybeDefs),
    Show(MaybeDefs),
    Foldable(MaybeDefs),
    Traversable(MaybeDefs),
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
  fromPredicate<A, T extends A>(this: MaybeRep, pred: (a: A) => a is T, val: A) {
    return pred(val) ? this.Just(val) : this.None();
  },
  fromCondition<A>(this: MaybeRep, pred: (a?: A) => boolean, val?: A) {
    return pred(val) ? this.Just(val) : this.None();
  },
  isEmpty(x: any) {
    const t = getTypeName(x);
    if( t !== "Maybe" ){
      return false;
    }
    return x.isNone() || isEmpty(x.get());
  },
  match,
  equals,
}) as unknown as MaybeRep;

export default Maybe;