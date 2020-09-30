import { 
    ifElse, is, apply, identity, 
    __, toPairs, toLower, curryN, 
    compose, find, fromPairs, isNil, 
    prop, complement, any, equals 
} from 'ramda'

/**
 * @description if the value given is a function, applies it with "data" as arguments and returns the result. Otherwise, it is equal to R.identity
 * @param {any} data arguments for apply
 */
export const extractWith = (data) => (value) => ifElse(
    is(Function), 
    apply(__,data), 
    identity
)(value)

const mapKeys = curryN(2,(fn,obj) => fromPairs(toPairs(obj).map(([key, val]) => [ fn(key), val ])))

const getFirstCaseInsensitive = (ps,obj) => {
    const mappedObj = mapKeys(toLower,obj)
    const props = ps.map(toLower)
    return compose(
        prop(__,mappedObj),
        o => find(compose( complement(isNil), prop(__,o)))(props),
    )(mappedObj)
}

export const getCase = (name,obj) => getFirstCaseInsensitive([name,"default","_"],obj)

export const safeMatch = (val,cases) => val?.match?.(cases) || cases?.default?.(val) || cases?._?.(val)

export const splitBy = (fn,arr) => arr.reduce(([left,right],next) => { 
    return fn(next) ? [ left, [...right, next]] : [ [...left,next], right]
},[[],[]])

/**
 * Assigns a value to a key for the given object, returning the same object, mutating it.
 * @param {string | number | symbol} key 
 * @returns {<T>(val: any, obj: T) => T}
 */
const mutate = (key) => (val,obj) => {
    obj[key] = val;
    return obj
}

export const InnerValue = Symbol("@@value");
export const getInnerValue = prop(InnerValue)
export const setInnerValue = mutate(InnerValue);

export const Type = Symbol("@@type");
export const getType = prop(Type);
export const setType = (t, val) => {
    Object.defineProperty(val,Type,{
        get: () => t()
    })
};

export const TypeName = Symbol("@@typename");
export const getTypeName = prop(TypeName)
export const setTypeName = mutate(TypeName)

export const Variant = Symbol("@@variant");
export const getVariant = prop(Variant)
export const setVariant = mutate(Variant)

export const Typeclass = Symbol("@@typeclass");
export const getTypeclass = prop(Typeclass);
export const setTypeclass = mutate(Typeclass);
export const currySetTypeclass = t => x => setTypeclass(t,x)

export const Typeclasses = Symbol("@@typeclasses");
export const getTypeclasses = prop(Typeclasses);
export const setTypeclasses = mutate(Typeclasses)

export const Spy = (fn = x => x) => {
    let callCount = 0;
    let calls = []
    let _spy = (...args) => {
        callCount++;
        calls.push(args);
        return fn(...args)
    }

    Object.defineProperty(_spy,"called",{
        get: () => callCount > 0
    })

    Object.defineProperty(_spy,"callCount",{
        get: () => callCount
    })

    _spy.calledWith = (...args) => any(equals(args),calls);

    _spy.reset = () => {
        callCount = 0 
        calls = []
    }

    return _spy
}