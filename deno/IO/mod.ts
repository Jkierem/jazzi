import { extractWith, compose2 } from "../_internals/mod.ts";
import { getInnerValue } from "../_internals/symbols.ts";
import { AnyFn } from "../_internals/types.ts";
import {
  Monad,
  Applicative,
  Functor,
  Show,
  Tap,
  Thenable,
  Runnable
} from "../Union/mod.ts";
import Union from "../Union/union.ts";
import { IO, IORep } from "./types.ts";

const IODefs: any = {
  trivials: ["IO"],
  identities: [],
  pure: "IO",
  pureM: "IO",
  lazy: true,
  overrides: {
    fmap: {
      IO(this:IO<any>, fn: AnyFn) {
        return IO.pure(compose2(fn, getInnerValue(this)));
      },
    },
    chain: {
      IO(this: IO<any>, fn: AnyFn) {
        return IO.pure(() => fn(this.unsafeRun()).unsafeRun());
      },
    },
    join: {
      IO(this: IO<any>){
        return IO.pure(() => this.unsafeRun().unsafeRun())
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
    Runnable(IODefs)
  ]
).constructors({
  of: defaultIO,
  from: defaultIO,
  forward: passThrough,
  through: passThrough,
  unary<A,B>(this: IORep, fn: (a: A) => B){ return (x: A) => this.IO(() => fn(x)) }
}) as unknown as IORep;

export default IO;
