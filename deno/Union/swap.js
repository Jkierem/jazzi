import prop from "https://deno.land/x/ramda@v0.27.2/source/prop.js";
import propOr from "https://deno.land/x/ramda@v0.27.2/source/propOr.js";
import { getVariant, setTypeclass } from "../_internals/index.js";

/**
 * Adds swap method to proto
 * @param {{
 *  left: string,
 *  right: string,
 *  overrides?: {
 *      swap?: any
 *  }
 * }} defs
 * @returns {(cases: any) => void}
 */
const Swap = (defs) =>
  setTypeclass("Swap", (cases) => {
    const left = prop("left", defs);
    const right = prop("right", defs);
    const overrides = propOr({}, "overrides", defs);
    function triviallswap() {
      return new cases[right](this.get());
    }
    function trivialrswap() {
      return new cases[left](this.get());
    }
    function swapOn(fn) {
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

setTypeclass("Swap", Swap);

export default Swap;
