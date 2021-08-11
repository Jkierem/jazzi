import { isNil } from "../_internals";
import {
  Applicative,
  Foldable,
  Functor,
  FunctorError,
  Monad,
  Thenable,
  Show,
  Swap
} from "../Union";
import Union from '../Union/union'

const EitherType = () => (cases, globals) => {
  cases.Right.prototype.ifRight = function (fn) {
    return this.map(fn);
  };
  cases.Right.prototype.ifLeft = function (fn) {
    return this;
  };
  cases.Left.prototype.ifLeft = function (fn) {
    return this.mapError(fn);
  };
  cases.Left.prototype.ifRight = function (fn) {
    return this;
  };

  cases.Right.prototype.mapLeft = function (fn) {
    return this;
  };
  cases.Left.prototype.mapLeft = function (fn) {
    return this.mapError(fn);
  };

  cases.Right.prototype.mapRight = function (fn) {
    return this.map(fn);
  };
  cases.Left.prototype.mapRight = function (fn) {
    return this;
  };

  globals.fromRight = function (or, val) {
    return val.isRight?.() ? val.get() : or;
  };
  globals.fromLeft = function (or, val) {
    return val.isLeft?.() ? val.get() : or;
  };

  globals.lefts = (ls) => ls.filter((l) => l.isLeft());
  globals.rights = (rs) => rs.filter((r) => r.isRight());
  globals.partition = (lrs) => [
    lrs.filter((l) => l.isLeft()),
    lrs.filter((r) => r.isRight()),
  ];
  globals.collectLefts = (xs) =>
    xs
      .filter((x) => x.isLeft?.())
      .reduce((acc, next) => {
        return acc.mapLeft((ls) => ls.concat(next.get()));
      }, new cases.Left([]));
  globals.collectRights = (xs) =>
    xs
      .filter((x) => x.isRight?.())
      .reduce((acc, next) => {
        return acc.map((rs) => rs.concat(next.get()));
      }, new cases.Right([]));
};

const Defs = {
  trivials: ["Right"],
  identities: ["Left"],
  errors: ["Left"],
  pure: "Right",
  left: "Left",
  right: "Right",
  resolve: ["Right"],
  reject: ["Left"],
  overrides: {
    fold: {
      Left: function (fnLeft, fnRight) {
        return fnLeft(this.get());
      },
      Right: function (fnLeft, fnRight) {
        return fnRight(this.get());
      },
    },
  },
};

function defaultConstructor(l, r) {
  return isNil(r) ? this.Left(l) : this.Right(r);
}

const Either = Union(
  "Either",
  {
    Left: (x) => x,
    Right: (x) => x,
  },
  [
    Functor(Defs),
    FunctorError(Defs),
    Applicative(Defs),
    Foldable(Defs),
    Monad(Defs),
    Swap(Defs),
    Show(Defs),
    Thenable(Defs),
    EitherType(),
  ]
).constructors({
  of: defaultConstructor,
  from: defaultConstructor,
  fromNullish: defaultConstructor,
  fromFalsy(l, r) {
    return r ? this.Right(r) : this.Left(l);
  },
  fromPredicate(pred, x) {
    return pred(x) ? this.Right(x) : this.Left(x);
  },
  fromMaybe(m) {
    return m.match({ Just: this.Right, None: this.Left });
  },
  fromResult(m) {
    return m.match({ Ok: this.Right, Err: this.Left });
  },
  defaultTo(left) {
    return (right) => (right ? this.Right(right) : this.Left(left));
  },
  attempt(fn,...args){
    try {
      return this.Right(fn(...args))
    } catch(e) {
      return this.Left(e)
    }
  },
});

export default Either;
