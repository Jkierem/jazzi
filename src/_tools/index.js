import { curryN, includes } from "ramda";
import { getType, getTypeclass, getTypeclasses, getVariant, safeMatch } from "../_internals";

/**
 * Type match a value
 * @param {{ match: (cases: any) => any }} value
 * @param {any} cases
 */
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
export const hasInstance = (tc,x) => includes(getTypeclass(tc) || tc, getTypeclasses(x)?.() || [])

export const foldMap = (t,values) => values.reduce((acc,next) => acc.concat(t.of(next)) , t.empty())

export const show = x => x.show()

export const fromEnum = en => getType(en).fromEnum(en)
export const toEnum = (en,i) => en.toEnum(i)
export const succ = (en) => en.succ()
export const pred = (en) => en.pred()

export const getTag = v => getVariant(v)