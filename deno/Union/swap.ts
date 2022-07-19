import { prop, propOr } from "../_internals/mod.ts";

import { getVariant, setTypeclass } from "../_internals/symbols.ts";

import { AnyConstRec, AnyFnRec, Boxed } from "../_internals/types.ts";


const mark = setTypeclass("Swap")

type SwapDefs = {
  left: string,
  right: string,
  overrides?: {
    swap?: AnyFnRec
  }
}

export interface Swap<L,R> {
  /**
   * Swap the context without altering the inner value.
   */
  swap(): Swap<R,L>
  /**
   * Swap if predicate returns true
   */
  swapIf(fn: (a: R) => boolean): Swap<R | L,L | R>;
  /**
   * Swap if predicate returns true
   */
  swapOn(fn: (a: R) => boolean): Swap<R | L,L | R>;
}

/**
 * Adds swap method to proto
 */
const Swap = (defs: SwapDefs) => mark((cases: AnyConstRec) => {
    const left = prop("left")(defs);
    const right = prop("right")(defs);
    const overrides = propOr({}, "overrides", defs);
    function triviallswap(this: Boxed<any>) {
      return new cases[right](this.get());
    }
    function trivialrswap(this: Boxed<any>) {
      return new cases[left](this.get());
    }
    function swapIf(this: Boxed<any> & Swap<any,any>, fn: (data: any) => boolean) {
      const variant = getVariant(this);
      return fn(this.get()) ? this.swap() : new cases[variant](this.get());
    }
    const lswap = overrides?.swap?.[left] || triviallswap;
    const rswap = overrides?.swap?.[right] || trivialrswap;
    cases[left].prototype.swap = lswap;
    cases[right].prototype.swap = rswap;
    cases[left].prototype.swapIf = swapIf;
    cases[right].prototype.swapIf = swapIf;
    cases[left].prototype.swapOn = swapIf;
    cases[right].prototype.swapOn = swapIf;
  });

mark(Swap);

export default Swap;
