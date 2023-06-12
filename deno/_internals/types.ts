export type Extractable<A,Args extends any[] = []> = A | ((...args: Args) => A)

export type Key = string | number | symbol

export type Nil = null | undefined

export type MapFn<A,B> = (a: A) => B

export type NonEmptyArray<T> = [T, ...T[]];

export type Tuple<T0,T1> = [T0, T1]

export type Tuple2<T0,T1> = [T0, T1]

export type Tuple3<T0,T1,T2> = [T0, T1, T2]

export type isNever<T> = [T] extends [never] ? true : false

export type isUnknown<T> = isNever<T> extends false 
    ? unknown extends T
        ? true
        : false
    : false

export type Primitive = 
    | number 
    | bigint
    | string 
    | boolean 
    | symbol 
    | null 
    | undefined
export type IsPrimitive<T> = T extends Primitive ? true : false

export interface ThenableOf<Resolve,Reject> {
    /**
     * Calls onResolve if success case, calls onReject otherwise
     * @param onResolve 
     * @param onReject 
     */
    then(onResolve: (value: Resolve) => void, onReject?: (value: Reject) => void): void;
    /**
     * Shorthand to handle error case
     * @param onReject 
     */
    catch(onReject: (value: Reject) => void): void
}

export interface Pipeable {
    ["|>"]<Self, Result>(this: Self, next: (value: Self) => Result): Result;
}