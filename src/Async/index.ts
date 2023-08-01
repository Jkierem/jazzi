import * as S from "../_internals/symbols"
import { Nil, Pipeable } from "../_internals/types";
import { isNil } from "../_internals/functions";
import { baseObject } from "../_internals";
import * as E from "../Either";
import * as M from "../Maybe";

type isNever<T> = [T] extends [never] ? true : false

type isUnknown<T> = isNever<T> extends false 
    ? unknown extends T
        ? true
        : false
    : false

export type RemoveUnknown<A> = isUnknown<A> extends true ? [env?: never] : [env: A];

type _R<A> = A extends Async<infer R,any,any> ? R : never
type Equals<T, S> =
    [T] extends [S] 
    ? ([S] extends [T] ? true : false) 
    : false
type EnvOf<R,A> = Equals<R,_R<A>> extends true ? A : never

const AsyncT: unique symbol = Symbol("Async")

type Type = typeof AsyncT;
type Variant = "Async";

type NullUnitOf<K extends string> = { type: K }
type UnitOf<K extends string, A> = { type: K, op: (prev: any) => A }

type Head<A> = UnitOf<"HEAD", Promise<A>>
type Map<A> = UnitOf<"MAP", A>
type MapError<A> = UnitOf<"MAP_ERROR", A>
type Recover<A> = UnitOf<"RECOVER", AsyncIO<unknown,A>>
type Chain<A> = UnitOf<"CHAIN", Async<unknown,unknown,A>>
type RecurIf = UnitOf<"RECUR_IF", AsyncUIO<boolean>>
type RecurWhile = UnitOf<"RECUR_WHILE", boolean>
type Swap = NullUnitOf<"SWAP">
type Task<A> = 
 | Head<A>
 | Map<A>
 | Chain<A>
 | MapError<A>
 | Recover<A>
 | RecurIf
 | RecurWhile
 | Swap

type Env<R> = ((arg: any) => R)

type Base<R,E,A> = {
    [S.Type]: Type;
    [S.Variant]: Variant;
    [S.Env]: Env<R>[];
    [S.Value]: Task<A>[];
    [S.ErrorMap]: E;
} & Pipeable

export interface Async<R,E,A> extends Base<R, E, A> {}
export type AsyncIO<E,A> = Async<unknown,E,A>
export type AsyncRIO<R,A> = Async<R,never,A>
export type AsyncUIO<A> = Async<unknown,never,A>

const makeHead = <R,A>(op: (r: R) => Promise<A>):  Head<A> => ({ type: "HEAD", op })
const makeMap = <A,B>(op: (a: A) => B): Map<B> => ({ type: "MAP", op })
const makeMapError = <A,B>(op: (a: A) => B): MapError<B> => ({ type: "MAP_ERROR", op })
const makeChain = <A,R,E,B>(op: (a: A) => Async<R,E,B>): Chain<B> => ({ type: "CHAIN", op })
const makeRecover = <A,E,B>(op: (a: A) => AsyncIO<E,B>): Recover<B> => ({ type: "RECOVER", op })
const makeRecurIf = <A>(op: (a: A) => AsyncUIO<boolean>): RecurIf => ({ type: "RECUR_IF", op })
const makeRecurWhile = <A>(op: (a: A) => boolean): RecurWhile => ({ type: "RECUR_WHILE", op })
const makeSwap = (): Swap => ({ type: "SWAP" })

const build = <R,E=never,A=unknown>(fn: (r: R) => Promise<A>) => {
    const base = baseObject({})
    const typ = S.setType(AsyncT);
    const van = S.setVariant("Async");
    const val = S.setValue([makeHead(fn)] as Task<A>[]);
    const env = S.setEnvironment([(x: any) => x]);
    return base
        ["|>"](val)
        ["|>"](typ)
        ["|>"](van)
        ["|>"](env) as Async<R,E,A>;
}

const copy = <R,E,A>(self: Async<R,E,A>) => {
    const base = baseObject({});
    const typ = S.setType(AsyncT);
    const van = S.setVariant("Async");
    const val = S.setValue([...S.getValue(self)]);
    const env = S.setEnvironment([...S.getEnvironment(self)]);
    return base
        ["|>"](val)
        ["|>"](typ)
        ["|>"](van)
        ["|>"](env) as Async<R,E,A>;
}

const queueTask = <R,E,A>(task: Task<unknown>, self: Async<unknown, unknown, unknown>) => {
    return S.setValue([...S.getValue(self), task])(copy(self)) as Async<R,E,A>
}

const queueProvision = <R,E,A>(pTask: Env<R>, self: Async<unknown, unknown, unknown>) => {
    return S.setEnvironment([...S.getEnvironment(self), pTask])(copy(self)) as Async<R,E,A>
}

export const Succeed = <A>(a: A) => build<unknown, never, A>(async () => await Promise.resolve(a))

export const succeedWith = <A>(fn: () => A) => build<unknown, never, A>(async () => fn())

export const Fail = <E>(e: E) => build<unknown, E, never>(async () => await Promise.reject(e))

export const failWith = <E>(e: () => E) => build<unknown, E, never>(async () => { throw e() });

export const of = <R,E=never,A=unknown>(fn: (r: R) => A) => from<R,E,A>(async (r: R) => await Promise.resolve(fn(r)));

export const from = <R,E=never,A=unknown>(fn: (r: R) => Promise<A>) => build<R,E,A>(fn);

export const fromCondition = <A>(fn: (a: A) => boolean) => (a: A) => from(() => {
    if( fn(a) ){
        return Promise.resolve(a);
    }
    throw a
}) as AsyncIO<A,A>

export const fromPredicate = <A, B extends A>(pred: (a: A) => a is B) => (a: A) => from(() => {
    if( pred(a) ){
        return Promise.resolve(a)
    } else {
        throw a
    }
}) as AsyncIO<Exclude<A,B>, B>

export const fromNullish = <A>(a: A | Nil) => {
    if( isNil(a) ){
        return Fail(a) as unknown as AsyncIO<Nil, A>
    } else {
        return Succeed(a) as AsyncIO<Nil, A>
    }
}

export const fromMaybe = <A>(m: M.Maybe<A>) => m["|>"](M.fold(
    () => Fail(undefined),
    Succeed
)) as AsyncIO<undefined, A>

export const fromEither = <L,R>(e: E.Either<L,R>) => e["|>"](E.fold(
    Fail,
    Succeed
)) as AsyncIO<L,R>

const _require = <R>(): AsyncRIO<R,R> => build(async (r: R) => await Promise.resolve(r));

const _do = () => Succeed({});

export { _require as require, _do as do };

export const map = <A,B>(fn: (a: A) => B) => <R,E>(self: Async<R,E,A>) => {
    return queueTask<R,E,B>(makeMap(fn), self);
}

export const mapError = <E,B>(fn: (a: E) => B) => <R,A>(self: Async<R,E,A>) => {
    return queueTask<R,B,A>(makeMapError(fn), self);
}

export const chain = <A,R0,E0,B>(fn: (a: A) => Async<R0, E0, B>) => <R,E>(self: Async<R,E,A>) => {
    return queueTask<R & R0, E | E0, B>(makeChain(fn), self);
}

export const recover = <E,E0,A0>(fn: (e: E) => AsyncIO<E0,A0>) => <R,A>(self: Async<R,E,A>) => {
    return queueTask<R, E0, A0 | A>(makeRecover(fn), self)
}

export const swap = <R,E,A>(self: Async<R,E,A>) => {
    return queueTask<R,A,E>(makeSwap(), self);
}

export const recurIf = <A>(fn: (a: A) => AsyncUIO<boolean>) => <R,E>(self: Async<R,E,A>) => {
    return queueTask<R,E,A>(makeRecurIf(fn), self)
}

export const recurWhile = <A>(fn: (a: A) => boolean) => <R,E>(self: Async<R,E,A>) => {
    return queueTask<R,E,A>(makeRecurWhile(fn), self)
}

export const recurN = (n: number) => <R,E,A>(self: Async<R,E,A>) => {
    let recur = n;
    return self
        ["|>"](chain(x => {
            recur--;
            return Succeed(x)
        }))
        ["|>"](recurWhile(() => recur > 0))
}

export const zipWith = <A,B,C>(fn: (a: A, b: B) => C) => 
    <R0, E0>(right: Async<R0,E0,B>) => 
    <R,E>(self: Async<R,E,A>) => 
    {
        return self
            ["|>"](chain(a => right["|>"](map(b => fn(a,b))))) 
    }

export const zip = <R0,E0,B>(right: Async<R0,E0,B>) => <R,E,A>(self: Async<R,E,A>) => 
    self["|>"](zipWith((a: A, b: B) => [a,b] as [A,B])(right))

export const zipLeft = <R0,E0,B>(right: Async<R0,E0,B>) => <R,E,A>(self: Async<R,E,A>) => {
    return self["|>"](zip(right))["|>"](map<[A,B], A>(([a]) => a))
}

export const zipRight = <R0,E0,B>(right: Async<R0,E0,B>) => <R,E,A>(self: Async<R,E,A>) => {
    return self["|>"](zip(right))["|>"](map<[A,B], B>(([_,b]) => b))
}

export const provide = <R>(r: R) => <E,A>(self: Async<R,E,A>) => {
    return queueProvision<unknown, E, A>(() => r, self)
}

export const access = <A,K extends keyof A>(key: K) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](map(a => a[key]))
}

export const pick = <A, K extends keyof A>(keys: K[]) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](map(a => 
        Object.fromEntries(Object
        .entries(a as Record<keyof A, A[keyof A]>)
        .filter(([key]) => keys.includes(key as any))) as { [P in K]: A[P] }
    ))
}

export const omit = <A, K extends keyof A>(keys: K[]) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](map(a => 
        Object.fromEntries(Object
        .entries(a as Record<keyof A, A[keyof A]>)
        .filter(([key]) => !keys.includes(key as any))) as { [P in Exclude<keyof A, K>]: A[P] }
    ))
}

export const alias = <A, K extends keyof A, K0 extends string>(original: K, aliased: Exclude<K0, keyof A>) => 
    <R,E>(self: Async<R,E,A>): Async<R, E, { [P in K0 | keyof A]: P extends keyof A ? A[P] : A[K] }> => {
        return self
            ["|>"](map(data => ({ ...data, [aliased]: data[original] } as { [P in K0 | keyof A]: P extends keyof A ? A[P] : A[K] })))    
    }

export const rename = <A, K extends keyof A, K0 extends string>(original: K, aliased: Exclude<K0, keyof A>) => 
    <R,E>(self: Async<R,E,A>): Async<R, E, { [P in K0 | Exclude<keyof A, K>]: P extends Exclude<keyof A, K> ? A[P] : A[K]}> => {
        return self["|>"](map(({ [original]: val, ...other }) => ({
            ...other,
            [aliased]: val
        } as { [P in K0 | Exclude<keyof A, K>]: P extends Exclude<keyof A, K> ? A[P] : A[K]})))
    }

export const tapEffect = <R0,E0,A0,A>(fn: (a: A) => Async<R0,E0,A0>) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](chain(a => fn(a)["|>"](map(() => a))))
}

export const bind = <K extends string, A, R0, E0, A0>(key: Exclude<K, keyof A>, fn: (a: A) => Async<R0,E0,A0>) => <R,E>(self: Async<R,E,A>) => 
    self['|>'](chain(val => fn(val)['|>'](map(bound => ({ ...val, [key]: bound } as { [P in K | keyof A]: P extends keyof A ? A[P]: A0 })))))

export const bindTo = <K extends string, A, R0, E0, A0>(key: Exclude<K, keyof A>, other: Async<R0,E0,A0>) => <R,E>(self: Async<R,E,A>) => 
    self['|>'](chain(val => other['|>'](map(bound => ({ ...val, [key]: bound } as { [P in K | keyof A]: P extends keyof A ? A[P]: A0 })))))

const _let = <K extends string, A, B>(key: Exclude<K, keyof A>, fn: (a: A) => B) => <R,E>(self: Async<R,E,A>) => 
    self['|>'](map((val) => ({ ...val, [key]: fn(val) } as { [P in K | keyof A]: P extends keyof A ? A[P]: B })))

export { _let as let };

export const provideTo = <A,E0,A0>(other: Async<A, E0, A0>) => <R,E>(self: Async<R,E,A>) => self["|>"](chain(r => other["|>"](provide(r))))

export const mapTo = <T>(a: T) => map(() => a)

export const ignore = <R,E,A>(self: Async<R,E,A>) => self["|>"](mapTo(undefined))["|>"](recover(() => Succeed(undefined)))

export const run = <E,A>(self: Async<unknown, E, A>) => self["|>"](runWith()) as Promise<A>

export const runWith = <R>(...args: RemoveUnknown<R>) => async <E,A, Self extends Async<R,E,A>>(self: EnvOf<R,Self>) => {
    const env = S.getEnvironment(self).reduce((acc, next) => next(acc), args[0]);
    const tasks = S.getValue(self);

    type Context = {
        state: "Success" | "Failure",
        value: any
    } 

    const context: Context = {
        state: "Success",
        value: undefined
    };

    for( const task of tasks ){
        switch(task.type){
            case "HEAD":
                try {
                    context.value = await task.op(env)
                } catch(e) {
                    context.state = "Failure";
                    context.value = e;
                }
                break;
            case "CHAIN":
                if( context.state === "Success" ){
                    try {
                        const next = task.op(context.value)
                        context.value = await next["|>"](runWith(...args as any))
                    } catch(e) {
                        context.state = "Failure"
                        context.value = e
                    }
                }
                break;
            case "MAP":
                if( context.state === "Success" ){
                    try {
                        context.value = task.op(context.value);
                    } catch(e) {
                        context.state = "Failure"
                        context.value = e;
                    }
                }
                break;
            case "MAP_ERROR":
                if( context.state === "Failure" ){
                    try {
                        context.value = task.op(context.value);
                    } catch(e) {
                        context.state = "Failure";
                        context.value = e;
                    }
                }
                break;
            case "RECOVER":
                if( context.state === "Failure" ){
                    try {
                        const next = task.op(context.value);
                        const value = await next["|>"](runWith())
                        context.state = "Success";
                        context.value = value;
                    } catch(e) {
                        context.state = "Failure"
                        context.value = e
                    }
                }
                break;
            case "RECUR_IF":
                if( context.state === "Success" ){
                    try {
                        const shouldRecur = await task.op(context.value)["|>"](runWith());
                        if( shouldRecur ){
                            const next = await self["|>"](runWith(...args))
                            context.state = "Success"
                            context.value = next
                        }
                    } catch(e){
                        context.state = "Failure"
                        context.value = e;
                    }
                }
                break;
            case "RECUR_WHILE":
                if( context.state === "Success" ){
                    try {
                        const shouldRecur = task.op(context.value);
                        if( shouldRecur ){
                            const next = await self["|>"](runWith(...args))
                            context.state = "Success"
                            context.value = next
                        }
                    } catch(e){
                        context.state = "Failure"
                        context.value = e;
                    }
                }
                break;
            case "SWAP":
                context.state = context.state === "Success" ? "Failure" : "Success"
                break;
        }
    }

    if( context.state === "Success"){
        return context.value as A
    } else {
        throw context.value
    }
}