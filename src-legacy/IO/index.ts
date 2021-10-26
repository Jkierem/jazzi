import { extractWith, compose2 } from "../_internals";
import { getInnerValue } from "../_internals/symbols";
import { AnyFn } from "../_internals/types";
import {
  Monad,
  Applicative,
  Functor,
  Show,
  Tap,
  Thenable,
} from "../Union";
import Union from '../Union/union'
import { IO, IORep } from "./types"

const IODefs: any = {
  trivials: ["IO"],
  identities: [],
  pure: "IO",
  lazy: true,
  overrides: {
    fmap: {
      IO(this:IO<any>, fn: AnyFn) {
        return IO.pure(compose2(fn, getInnerValue(this)));
      },
    },
    chain: {
      IO(this: IO<any>, fn: AnyFn) {
        return IO.pure((...args: any[]) => fn(this.unsafeRun(...args)).unsafeRun());
      },
    },
    join: {
      IO(this: IO<any>){
        return IO.pure((...args: any[]) => this.unsafeRun(...args).unsafeRun())
      }
    },
    apply: {
      IO(this: IO<any>, ioFn: IO<AnyFn>) {
        return IO.pure((...args: any[]) => ioFn.get()(this.get()(...args)));
      },
    },
    show: {
      IO() {
        return `[IO => () => _]`;
      },
    },
    run: {
      IO(this: IO<any>) {
        return this.get()();
      },
    },
    then: {
      IO(this: IO<any>, res: AnyFn){
        res(this.run());
      }
    },
    toPromise: {
      IO(this: IO<any>) {
        return Promise.resolve(this.run())
      }
    }
  },
};

function defaultIO(this: IORep, x: any) {
  return this.IO(x);
}

function passThrough(this: IORep, fn: AnyFn) {
  return (...args: any[]) => this.IO(() => fn(...args))
}

const IO = Union(
  "IO",
  {
    IO: (fn) => (...args: any[]) => extractWith(args)(fn),
  },
  [
    Functor(IODefs),
    Applicative(IODefs),
    Monad(IODefs),
    Thenable(IODefs),
    Show(IODefs),
    Tap(IODefs),
  ]
).constructors({
  of: defaultIO,
  from: defaultIO,
  forward: passThrough,
  through: passThrough,
  unary<A,B>(this: IORep, fn: (a: A) => B){ return (x: A) => this.IO(() => fn(x)) }
}) as unknown as IORep;

export default IO;
