import identity from 'ramda/src/identity';
import any from 'ramda/src/any';
import equals from 'ramda/src/equals';
import map from 'ramda/src/map';
import isEmpty from 'ramda/src/isEmpty';

const fromPairs = (pairs) => pairs.reduce((acc,[key,val]) => {
    acc[key] = val;
    return acc;
} ,{})

const toPairs = (obj) => Object.keys(obj).map((key) => [ key, obj[key]]);

const mapKeys = (fn,obj) => {
    const run = (fn,obj) => fromPairs(toPairs(obj).map(([key, val]) => [ fn(key), val ]))
    if(obj === undefined){
        return (obj) => run(fn,obj)
    }
    return run(fn,obj)
}

const toLower = str => str.toLowerCase();

const getFirstCaseSensitive = (ps,obj) => {
    const mappedObj = mapKeys(toLower,obj)
    const matched = ps.find(p => !isNil(mappedObj[p]))
    return mappedObj[matched]
}

const getFirstCaseInsensitive = (ps,obj) => {
    const mappedObj = mapKeys(toLower,obj)
    const matched = ps.map(toLower).find(p => !isNil(mappedObj[p]))
    return mappedObj[matched]
}

/**
 * Assigns a value to a key for the given object, returning the same object, mutating it.
 * @param {string | number | symbol} key 
 * @returns {<T>(val: any, obj: T) => T}
 */
const mutate = (key) => (val,obj) => {
    obj[key] = val;
    return obj
}
const prop = (key) => (obj) => obj?.[key];

/**
 * @description if the value given is a function, 
 * applies it with "data" as arguments and returns the result. 
 * Otherwise, it is equal to identity
 * @param {any} data arguments for apply
 */
export const extractWith = (data) => (value) => {
    if( typeof value === "function" ){
        return value(...data)
    }
    return value;
}

export const includes = (val,arr) => Boolean(arr.find(x => x === val))
export const isNil = x => x === undefined || x === null;

export const getCase = (name,obj) => getFirstCaseInsensitive([name,"default","_"],obj)
export const getCaseSensitive = (name,obj) => getFirstCaseSensitive([name,"default","_"],obj)
export const safeMatch = (val,cases) => val?.match?.(cases) || cases?.default?.(val) || cases?._?.(val)
export const splitBy = (fn,arr) => arr.reduce(([left,right],next) => { 
    return fn(next) ? [ left, [...right, next]] : [ [...left,next], right]
},[[],[]])

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