import { extractWith, getInnerValue } from "../_internals/index.js";
import {
  Monad,
  Applicative,
  Functor,
  Show,
  Effect,
  Thenable,
} from "../Union/index.js";
import Union from "../Union/union.js";
import compose from "https://deno.land/x/ramda@v0.27.2/source/compose.js";

const IODefs = {
  trivials: ["IO"],
  identities: [],
  pure: "IO",
  lazy: true,
  overrides: {
    fmap: {
      IO(fn) {
        return IO.pure(compose(fn, getInnerValue(this)));
      },
    },
    chain: {
      IO(fn) {
        return IO.pure((...args) => fn(this.unsafeRun(...args)).unsafeRun());
      },
    },
    apply: {
      IO(ioFn) {
        return IO.pure((...args) => ioFn.get()(this.get()(...args)));
      },
    },
    show: {
      IO() {
        return `[IO => () => _]`;
      },
    },
    run: {
      IO() {
        return this.get()();
      },
    },
    then: {
      IO(res){
        res(this.run());
      }
    },
    toPromise: {
      IO() {
        return Promise.resolve(this.run())
      }
    }
  },
};

function defaultIO(x) {
  return this.IO(x);
}

function passThrough(fn) {
  return (...args) => this.IO(() => fn(...args))
}

const IO = Union(
  "IO",
  {
    IO: (fn) => (...args) => extractWith(args)(fn),
  },
  [
    Functor(IODefs),
    Applicative(IODefs),
    Monad(IODefs),
    Thenable(IODefs),
    Show(IODefs),
    Effect(IODefs),
  ]
).constructors({
  of: defaultIO,
  from: defaultIO,
  forward: passThrough,
  through: passThrough,
  unary(fn){ return (x) => this.IO(() => fn(x))}
});

export default IO;
