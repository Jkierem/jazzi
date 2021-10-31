export interface Call<Args extends any[], Ret> {
    readonly isJazziSpyCall: true;
    args: Args,
    result: Ret,
    callTime: number,
    calledBefore<T extends Call<any,any>>(other: T): boolean,
    calledAfter<T extends Call<any,any>>(other: T): boolean,
}

const clock = (() => {
    let order = 0
    return {
        getTime(){
            order++
            return order
        }
    }
})()

const mkCall = <Args extends any[],Ret>(data: { args: Args, result: Ret }): Call<Args,Ret> => {
    return {
        ...data,
        callTime: clock.getTime(),
        calledBefore(otherCall){
            return this.callTime - otherCall.callTime < 0
        },
        calledAfter(otherCall){
            return this.callTime - otherCall.callTime > 0
        },
        isJazziSpyCall: true
    }
}

export interface Spy<Args extends any[], Ret> {
    (...args: Args): Ret, 
    readonly calls: Call<Args,Ret>[],
    readonly callCount: number,
    readonly called: boolean,
    readonly calledOnce: boolean,
    readonly calledTwice: boolean,
    readonly calledThrice: boolean,
    readonly isJazziSpy: true,
    calledWith(...args: Args): boolean,
    getNthCall(n: number): Call<Args,Ret>,
    findCall(fn: (call: Call<Args,Ret>) => boolean): Call<Args,Ret> | undefined,
    setImplementation(impl: (...args: Args[]) => Ret): Spy<Args,Ret>,
    reset(): Spy<Args,Ret>,
}

export type SpyFactory<Args extends any[],Ret> = {
    (fn: (...args: Args) => Ret): Spy<Args,Ret>
    unit: Spy<[any],any>
}

const defineReadonly = <T,U>(obj: T, prop: string, get: () => U): T => {
    return Object.defineProperty(obj, prop, { get })
}

const equals = (a: any, b: any): boolean => {
    const typeA = typeof a
    const typeB = typeof b
    if( typeA !== typeB || typeA === "function" ){
        return false
    }
    if( typeA === "object" ){
        if( a === b ){
            return true
        }
        if( Array.isArray(a) && Array.isArray(b) ){
            return a.every((_a, idx) => equals(_a, b[idx]))
        }
        if( 
            (Array.isArray(a) && !Array.isArray(b)) ||
            (!Array.isArray(a) && Array.isArray(b)) 
        ){
            return false
        }
        const setAB = new Set([...Object.keys(a), ...Object.keys(b)])
        return Array.from(setAB).every(key => equals(a[key], b[key]))
    }
    return a === b
}

const head = ([a]: any[]) => a
const identity = <A extends any[]>(...as: A) => head(as)

export const Spy = <Args extends any[],Ret>(fn: (...args: Args) => Ret = identity) => {
    let calls: Call<Args,Ret>[] = []
    let impl = fn 

    function sp(...args: Args): Ret {
        const result = impl(...args)
        calls.push(mkCall<Args,Ret>({ 
            args, 
            result
        }))
        return result
    }

    defineReadonly(sp, "calls", () => calls)
    defineReadonly(sp, "callCount", () => calls.length)
    defineReadonly(sp, "called", () => calls.length > 0)
    defineReadonly(sp, "calledOnce", () => calls.length === 1)
    defineReadonly(sp, "calledTwice", () => calls.length === 2)
    defineReadonly(sp, "calledThrice", () => calls.length === 3)
    defineReadonly(sp, "isJazziSpy", () => true)

    sp.calledWith = (...args: Args) => calls.some(call => call.args.every((a,idx) => equals(a,args[idx])))
    sp.getNthCall = (n: number) => calls[n]
    sp.findCall = (fn: (call: Call<Args,Ret>) => boolean): Call<Args,Ret> | undefined => calls.find(fn)
    sp.setImplementation = (fn: (...args: Args) => Ret) => {
        impl = fn
        return sp
    }
    sp.reset = () => {
        calls = []
        impl = fn
        return sp;
    }

    return sp as unknown as Spy<Args,Ret>
}