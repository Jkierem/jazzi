import { 
    ifElse, is, apply, identity, 
    __, toPairs, toLower, curryN, 
    compose, find, fromPairs, isNil, 
    prop, complement, any, equals, map, isEmpty 
} from 'https://deno.land/x/ramda@v0.27.2/mod.ts'

/**
 * @description if the value given is a function, 
 * applies it with "data" as arguments and returns the result. 
 * Otherwise, it is equal to R.identity
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

/* istanbul ignore next : spy works believe me*/
export const Spy = (fn = x => x) => {
    let callCount = 0;
    let calls = []
    let _spy = (...args) => {
        callCount++;
        const res = fn(...args)
        calls.push({args, result: res});
        return res;
    }

    Object.defineProperty(_spy,"called",{
        get: () => callCount > 0
    })

    Object.defineProperty(_spy,"callCount",{
        get: () => callCount
    })
    Object.defineProperty(_spy,"calls",{
        get: () => calls
    })

    _spy.calledWith = (...args) => any(equals(args),map(prop("args"))(calls));
    _spy.returned = (val) => any(equals(val),map(prop("result"))(calls));

    _spy.reset = () => {
        callCount = 0 
        calls = []
    }

    _spy.debug = () => {
        return {
            callCount: _spy.callCount,
            calls: _spy.calls,
            called: _spy.called,
        }
    }

    return _spy
}

/**
 * iterates over values of an object
 * @param {(value: any, key?: string | number | symbol, index?: number, data?: any) => } fn 
 * @param {any} data 
 */
export const forEachValue = (fn , data={}) => {
    Object.keys(data).forEach( (key,idx) => {
        fn(data[key],key,idx,data)
    })
}

/**
 * Sets overrides on the cases proto
 * @param {string} method 
 * @param {string[]} aliases 
 * @param {any} overrides 
 * @param {any} cases 
 */
export const defineOverrides = (method,aliases,overrides,cases) => {
    forEachValue((override,key) => {
        cases[key].prototype[method] = override
        aliases.forEach(alias => {
            cases[key].prototype[alias] = override
        })
    },overrides[method] || {})
}

export function monoidThen(res=identity,rej=identity){
    isEmpty(this) ? rej(this.get()) : res(this.get());
}
export function monoidToPromise(){
    return new Promise((res,rej) => {
        isEmpty(this) ? rej(this.get()) : res(this.get());
    })
}