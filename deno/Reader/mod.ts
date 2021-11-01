import { Applicative, Functor, Monad, Show, Thenable } from "../Union/mod.ts";
import Union from "../Union/union.ts";
import { extractWith } from "../_internals/mod.ts";
import { getTypeRep } from "../_internals/symbols.ts";
import { AnyConstRec, AnyFn } from "../_internals/types.ts";
import { Reader, ReaderRep } from "./types.ts";

const ReaderMonad = () => (cases: AnyConstRec, global: any) => {
  cases.Reader.prototype.local = function (this: Reader<any,any>, fn: AnyFn) {
    return getTypeRep(this).pure((...env: any[]) => this.run(fn(...env)));
  };
  global.runReader = function (reader: Reader<any,any>,env: any) {
    return reader.run(env);
  };
  global.ask = function () {
    return new cases.Reader((x: any) => x);
  };
};

const Defs: any = {
  trivials: ["Reader"],
  identities: [],
  pure: "Reader",
  lazy: true,
  resolve: ["Reader"],
  overrides: {
    fmap: {
      Reader(this: Reader<any,any>, fn: AnyFn) {
        return Reader.Reader((...env: any[]) => fn(this.get()(...env)));
      },
    },
    chain: {
      Reader(this: Reader<any,any>, fn: AnyFn) {
        return Reader.Reader((env: any) => fn(this.run(env)).run(env));
      },
    },
    join: {
      Reader(this: Reader<any,any>){
        return Reader.Reader((env: any) => this.run(env).run(env));
      }
    },
    apply: {
      Reader(this: Reader<any,any>, readerFn: Reader<any, AnyFn>) {
        return Reader.Reader((env: any) => readerFn.get()(this.run(env)));
      },
    },
    show: {
      Reader() {
        return "[Reader => R => _]";
      },
    },
    run: {
      Reader(this: Reader<any,any>,...env: any[]) {
        return this.get()(...env);
      },
    },
    then: {
      Reader(this: Reader<unknown,any>, res: AnyFn){
        res(this.run(undefined))
      }
    },
    toPromise: {
      Reader(this: Reader<any,any>,args: any) {
        return Promise.resolve(this.run(args))
      }
    }
  },
};

const Reader = Union(
  "Reader",
  {
    Reader: (fn) => (env: any) => extractWith([env])(fn),
  },
  [
    Functor(Defs), 
    Applicative(Defs), 
    Monad(Defs), 
    Show(Defs), 
    Thenable(Defs),
    ReaderMonad()
  ]
).constructors({
  of(this: ReaderRep, x: any) {
    return this.Reader(x);
  },
  from(this: ReaderRep, x: any) {
    return this.Reader(x);
  },
}) as unknown as ReaderRep;

export default Reader;
