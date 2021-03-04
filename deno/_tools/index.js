import { curryN, includes } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import { extractWith, getCaseSensitive, getType, getTypeclass, getTypeclasses, getVariant, safeMatch } from "../_internals/index.js";

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
export const unwrap = x => x?.unwrap ? x.unwrap() : x ;

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

export const stringSwitch = (str,_patt) => {
    return extractWith([])(getCaseSensitive(str,_patt))
}

export const stringMatcher = (str) => {
    return {
        match: (patterns) => {
            return extractWith([])(getCaseSensitive(str,patterns));
        }
    }
}