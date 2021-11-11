import { isNil } from "../_internals/functions";
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
import { AnyConstRec, AnyFn, Extractable } from "../_internals/types";
import { Either, EitherRep } from "./types";
import { getInnerValue } from "../_internals/symbols";
import Async from "../Async";

type AnyEither = Either<any,any>

const EitherType = () => (cases: AnyConstRec, globals: any) => {
  function getImpl(this: AnyEither) {
    return getInnerValue(this)
  };
  cases.Right.prototype.get = getImpl;
  cases.Left.prototype.get = getImpl;
  cases.Right.prototype.getEither = getImpl;
  cases.Left.prototype.getEither = getImpl;

  function getRightImpl(this: AnyEither) {
    return this.isRight() ? getInnerValue(this) : undefined
  };
  cases.Right.prototype.getRight = getRightImpl
  cases.Left.prototype.getRight = getRightImpl

  function getOrImpl(this: AnyEither, fn: Extractable<any>) {
    return this.isRight() ? getInnerValue(this) : fn()
  };
  cases.Right.prototype.getOr = getOrImpl;
  cases.Left.prototype.getOr = getOrImpl;

  function getLeftImpl(this: AnyEither) {
    return this.isLeft() ? getInnerValue(this) : undefined
  };
  cases.Right.prototype.getLeft = getLeftImpl;
  cases.Left.prototype.getLeft = getLeftImpl;

  function getLeftOrImpl(this: AnyEither, fn: Extractable<any>) {
    return this.isLeft() ? getInnerValue(this) : fn()
  };
  cases.Right.prototype.getLeftOr = getLeftOrImpl;
  cases.Left.prototype.getLeftOr = getLeftOrImpl;

  
  function mapImpl(this: AnyEither, fn: AnyFn){
    return this.isRight() ? this.map(fn) : this
  }
  function mapErrorImpl(this: AnyEither, fn: AnyFn){
    return this.isLeft() ? this.mapError(fn) : this
  }

  cases.Right.prototype.ifRight = mapImpl
  cases.Right.prototype.mapRight = mapImpl
  cases.Right.prototype.ifLeft = mapErrorImpl
  cases.Right.prototype.mapLeft = mapErrorImpl

  cases.Left.prototype.ifRight = mapImpl
  cases.Left.prototype.mapRight = mapImpl
  cases.Left.prototype.ifLeft = mapErrorImpl
  cases.Left.prototype.mapLeft = mapErrorImpl

  cases.Right.prototype.toAsync = function(){
    return Async.Success(this.get())
  };
  cases.Left.prototype.toAsync = function(){
    return Async.Fail(this.getEither())
  };

  globals.lefts = (ls: AnyEither[]) => ls.filter((l) => l.isLeft());
  globals.rights = (rs: AnyEither[]) => rs.filter((r) => r.isRight());
  globals.partition = (lrs: AnyEither[]) => [
    lrs.filter((l) => l.isLeft()),
    lrs.filter((r) => r.isRight()),
  ];
  globals.collectLefts = <L,R>(xs: Either<L,R>[]): Either<L[], never> =>
    xs
      .filter((x) => x.isLeft?.())
      .reduce((acc: Either<L[], never>, next) => {
        return acc.mapLeft((ls) => ls.concat(next.getLeft()));
      }, new cases.Left([]));
  globals.collectRights = <L,R>(xs: Either<L,R>[]): Either<never, R[]> =>
    xs
      .filter((x) => x.isRight?.())
      .reduce((acc: Either<never, R[]>, next) => {
        return acc.map((rs) => rs.concat(next.getRight()));
      }, new cases.Right([]));
};

const Defs: any = {
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
      Left: function (this: AnyEither, fnLeft: AnyFn, fnRight: AnyFn) {
        return fnLeft(this.getLeft());
      },
      Right: function (this: AnyEither, fnLeft: AnyFn, fnRight: AnyFn) {
        return fnRight(this.get());
      },
    },
  },
};

function defaultConstructor<L,R>(this: EitherRep, l: L, r: R) {
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
  of(this: EitherRep, x: any){ return defaultConstructor.bind(this)(x,x) },
  from: defaultConstructor,
  fromNullish: defaultConstructor,
  fromFalsy(this: EitherRep, l: any, r: any) {
    return r ? this.Right(r) : this.Left(l);
  },
  fromPredicate(this: EitherRep, pred: any, x: any) {
    return pred(x) ? this.Right(x) : this.Left(x);
  },
  fromMaybe(this: EitherRep, m: any) {
    return m.match({ Just: this.Right, None: this.Left });
  },
  defaultTo(this: EitherRep, left: any) {
    return (right: any) => (right ? this.Right(right) : this.Left(left));
  },
  attempt(this: EitherRep, fn: any,...args: any[]){
    try {
      return this.Right(fn(...args))
    } catch(e) {
      return this.Left(e)
    }
  },
  async asyncAttempt(this: EitherRep, fn: any,...args: any[]){
    try {
      return this.Right(await fn(...args))
    } catch(e) {
      return this.Left(e)
    }
  }
}) as unknown as EitherRep;

export default Either;
