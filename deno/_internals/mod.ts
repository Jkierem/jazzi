import { Pipeable, ThenableOf } from "./types.ts";

export const fromPairs = <T>(pairs: [string,T][]) => pairs.reduce((acc,[key,val]) => {
    (acc as any)[key] = val;
    return acc;
} ,{}) as Record<string, T>

export const toPairs = <T>(obj: Record<string,T>) => Object.keys(obj).map((key) => [key, obj[key]]) as [string,T][] 

export const baseObject = <T>(extra: T) => ({
    ...extra,
    ["|>"]<Self, A>(this: Self, op: (self: Self) => A): A {
        return op(this);
    }
} as T & Pipeable)
