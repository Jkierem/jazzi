import { equals as rEquals } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import {
  Applicative,
  Bifunctor,
  Effect,
  Eq,
  Filterable,
  Foldable,
  Functor,
  FunctorError,
  Monad,
  Show,
  Swap,
  Thenable
} from "../Union/index.js";
import Union from "../Union/union.js";
import { match } from "../_tools/index.js";

const Defs = {
  right: "Ok",
  left: "Err",
  first: "Ok",
  second: "Err",
  trivials: ["Ok"],
  identities: ["Err"],
  empties: ["Err"],
  errors: ["Err"],
  pure: "Ok",
  resolve: ["Ok"],
  reject: ["Err"],
  overrides: {
    equals: {
      Err(other) {
        return other?.match?.({
          Err: (x) => rEquals(this.get(), x),
          _: () => false,
        });
      },
    },
    filter: {
      Ok(pred) {
        return pred(this.get()) ? this : this.swap();
      },
    },
    fold: {
      Ok(f, g) {
        return g(this.get());
      },
      Err(f, g) {
        return f(this.get());
      },
    },
  },
};

const Result = Union(
  "Result",
  {
    Ok: (x) => x,
    Err: (x) => x,
  },
  [
    Foldable(Defs),
    Bifunctor(Defs),
    Effect(Defs),
    Eq(Defs),
    Functor(Defs),
    FunctorError(Defs),
    Monad(Defs),
    Applicative(Defs),
    Thenable(Defs),
    Show(Defs),
    Swap(Defs),
    Filterable(Defs),
  ]
).constructors({
  of(f) {
    try {
      return this.Ok(f());
    } catch (e) {
      return this.Err(e);
    }
  },
  from(f) {
    try {
      return this.Ok(f());
    } catch (e) {
      return this.Err(e);
    }
  },
  fromError(val) {
    return val instanceof Error ? this.Err(val) : this.Ok(val);
  },
  fromFalsy(val) {
    return val ? this.Ok(val) : this.Err(val);
  },
  fromPredicate(pred, val) {
    return pred(val) ? this.Ok(val) : this.Err(val);
  },
  fromMaybe(m, onNothing) {
    return m?.match?.({
      Just: this.Ok,
      None: () => this.Err(onNothing),
    });
  },
  attempt(f) {
    try {
      return this.Ok(f());
    } catch (e) {
      return this.Err(e);
    }
  },
  match,
  equals: rEquals,
});

export default Result;
