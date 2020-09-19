import { curryN, includes } from "ramda";
import { getTypeclass, getTypeclasses, safeMatch } from "../_internals";

export const match = curryN(2,safeMatch)
/**
 * Calls unwrap on the given object
 * @param {{ unwrap: () => any }} x 
 */
export const toPrimitive = x => x?.unwrap?.() || x;

/**
 * Returns true if value implements the provided typeclass or typeclass name
 * @param {any} value
 * @param {any} typeclass 
 */
export const hasInstance = (x,tc) => includes(getTypeclass(tc) || tc, getTypeclasses(x)?.() || [])