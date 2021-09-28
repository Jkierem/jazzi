import { prop, propOr } from "../_internals"
import { getVariant, setTypeclass } from "../_internals/symbols";
import { AnyConstRec, AnyFnRec, Boxed } from "../_internals/types";

const mark = setTypeclass("Swap")

type SwapDefs = {
  left: string,
  right: string,
  overrides?: {
    swap?: AnyFnRec
  }
}

export interface Swap<R> extends Boxed<R>{
  /**
   * Swap the context without altering the inner value.
   */
  swap(): Swap<R>
  /**
   * Swap if predicate returns true
   */
  swapIf(fn: (a: R) => boolean): Swap<R>;
  /**
   * Swap if predicate returns true
   */
  swapOn(fn: (a: R) => boolean): Swap<R>;
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
    function swapOn(this: Swap<any>, fn: (data: any) => boolean) {
      const variant = getVariant(this);
      return fn(this.get()) ? this.swap() : new cases[variant](this.get());
    }
    const lswap = overrides?.swap?.[left] || triviallswap;
    const rswap = overrides?.swap?.[right] || trivialrswap;
    cases[left].prototype.swap = lswap;
    cases[right].prototype.swap = rswap;
    cases[left].prototype.swapIf = swapOn;
    cases[right].prototype.swapIf = swapOn;
    cases[left].prototype.swapOn = swapOn;
    cases[right].prototype.swapOn = swapOn;
  });

mark(Swap);

export default Swap;
