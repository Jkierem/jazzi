import { isEmpty, identity, isNil } from "./functions.ts";
import { AnyConstRec, AnyFnRec, AnyFn } from "./types.ts";

export * from "./functions.ts";

export const fromPairs = <T>(pairs: [string,T][]) => pairs.reduce((acc,[key,val]) => {
    (acc as any)[key] = val;
    return acc;
} ,{}) as Record<string, T>

export const toPairs = <T>(obj: Record<string,T>) => Object.keys(obj).map((key) => [key, obj[key]]) as [string,T][] 

const mapKeys = <K extends string,T>(fn: (key: string) => K, obj: Record<string,T>): Record<K,T> => fromPairs(toPairs(obj).map(([key, val]) => [ fn(key), val ]))

const toLower = (str: string) => str.toLowerCase();

export const getFirstCaseSensitive = (ps: string[], obj: AnyFnRec) => {
    const mappedObj = mapKeys(toLower,obj)
    const matched = ps.find(p => !isNil(mappedObj[p]))
    return matched ? mappedObj[matched] : undefined
}

const getFirstCaseInsensitive = (ps: string[], obj: AnyFnRec) => {
    const mappedObj = mapKeys(toLower,obj)
    const matched = ps.map(toLower).find(p => !isNil(mappedObj[p]))
    return matched ? mappedObj[matched] : undefined
}

export const includes = (val: any, arr: any[]) => Boolean(arr.find(x => x === val))

export const expandCases = (obj: AnyFnRec): AnyFnRec => {
    return fromPairs(toPairs(obj).flatMap(([key,value]) => {
        if(key.includes("|")){
            return key
                .split("|")
                .map(x => x.trim())
                .filter(Boolean)
                .map(k => [k,value]) as [string, AnyFn][]
        } 
        return [[key,value]] as [string, AnyFn][]
    }))
}
export const getCase = (name: string, obj: AnyFnRec) => getFirstCaseInsensitive([name,"default","_"],obj)
export const getCaseSensitive = (name: string, obj: AnyFnRec) => getFirstCaseSensitive([name,"default","_"],obj)
export const safeMatch = (val: any, cases: AnyFnRec) => val?.match?.(cases) || cases?.default?.(val) || cases?._?.(val)
export const splitBy = <T>(fn: (a: T) => boolean, arr: T[]) => arr.reduce(([left,right], next: T) => {
    return (fn(next) ? [ left, [...right, next]] : [ [...left,next], right]) as [T[],T[]]
},[[],[]] as [T[],T[]])

/**
 * iterates over values of an object
 * @param {(value: any, key?: string | number | symbol, index?: number, data?: any) => } fn 
 * @param {any} data 
 */
export const forEachValue = <T>(fn: (a: T, key: string, index:number, container: Record<string,T>) => void , data: Record<string,T> = {}) => {
    Object.keys(data).forEach((key,idx) => {
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
export const defineOverrides = (method: string, aliases: string[], overrides: { [P in typeof method]?: AnyFnRec } , cases: AnyConstRec) => {
    forEachValue((override,key) => {
        cases[key].prototype[method] = override
        aliases.forEach(alias => {
            cases[key].prototype[alias] = override
        })
    },overrides[method] || {})
}

export function monoidThen(this: any, res=identity,rej=identity){
    isEmpty(this) ? rej(this.get()) : res(this.get());
}
export function monoidToPromise(this: any){
    return new Promise((res,rej) => {
        isEmpty(this) ? rej(this.get()) : res(this.get());
    })
}