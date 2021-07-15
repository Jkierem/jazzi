import { extractWith, getCaseSensitive, getType, getTypeclass, getTypeclasses, getVariant as _getVariant, safeMatch, includes, getTypeName as getTN } from "../_internals/index.js";

/**
 * Type match a value
 * @param {{ match: (cases: any) => any }} value
 * @param {any} cases
 */
export const match = (value,cases) => cases === undefined ? (cases) => safeMatch(value,cases) : safeMatch(value,cases)
/**
 * Calls unwrap on the given object
 * @param {{ unwrap: () => any }} x 
 */
export const unwrap = x => x?.unwrap ? x.unwrap() : x ;
/**
 * Returns variant name of the given value
 * @param {any} v 
 */
export const getTag = v => _getVariant(v)
export const getVariant = _getVariant
/**
 * Returns the name of the union this value belongs to
 * @param {any} v 
 * @returns {string} TypeName
 */
export const getTypeName = v => getTN(v)
/**
 * Returns the type representative of this value
 * @param {any} v 
 * @returns Type representative
 */
export const getTypeRep = v => getType(v);
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
export const next = (en) => en.next()
export const previous = (en) => en.previous()
export const map = (fn,obj) => obj === undefined ? (obj) => obj.map(fn)  : obj.map(fn);
export const fmap = (fn,fctor) => fctor === undefined ? (fctor) => fctor.fmap(fn)  : fctor.fmap(fn);

const _apImpl = (left, right) => right === undefined ? (right) => left.apply(right) : left.apply(right)
export const ap = _apImpl
export const applyRight = _apImpl
export const applyLeft = (left, right) => right === undefined ? (right) => right.apply(left) : right.apply(left)

export const join = (monad) => monad.join();
export const flat = (monad) => monad.join();
export const bind = (fn, monad) => monad === undefined ? (monad) => monad.bind(fn) : monad.bind(fn)
export const chain = (fn, monad) => monad === undefined ? (monad) => monad.chain(fn) : monad.chain(fn)
export const flatMap = (fn, monad) => monad === undefined ? (monad) => monad.flatMap(fn) : monad.flatMap(fn)

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