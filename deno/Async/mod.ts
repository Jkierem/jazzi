// deno-lint-ignore-file no-explicit-any
import * as S from "../_internals/symbols.ts";

import { Nil, Pipeable } from "../_internals/types.ts";

import { isNil } from "../_internals/functions.ts";

import { baseObject } from "../_internals/mod.ts";

import * as E from "../Either/mod.ts";

import * as M from "../Maybe/mod.ts";


export type isNever<T> = [T] extends [never] ? true : false

export type isUnknown<T> = isNever<T> extends false 
    ? unknown extends T
        ? true
        : false
    : false

const AsyncT: unique symbol = Symbol("Async")

type Type = typeof AsyncT;
type Variant = "Async";

type Base<R, E, A> = 
    & S.WithValue<(r: R) => Promise<A>>
    & S.WithVariant<Variant>
    & S.WithType<Type>
    & S.WithEnv<(...args: any) => R>
    & S.WithErrorMap<(e: unknown) => E>
    & S.WithRecovery<((e: E) => AsyncUIO<any>) | undefined>
    & Pipeable

export type Async<R,E,A> = Base<R, E, A>
export type AsyncIO<E,A> = Async<unknown,E,A>
export type AsyncRIO<R,A> = Async<R,unknown,A>
export type AsyncUIO<A> = Async<unknown,never,A>

const build = <R,E,A>(a: (r: R) => Promise<A>) => {
    const base = baseObject({})
    const val = S.setValue(a);
    const typ = S.setType(AsyncT);
    const van = S.setVariant("Async");
    const env = S.setEnvironment((x: any) => x);
    const emp = S.setErrorMap((x: E) => x);
    const rec = S.setRecovery(undefined);
    return base
        ["|>"](val)
        ["|>"](typ)
        ["|>"](van)
        ["|>"](env)
        ["|>"](emp)
        ["|>"](rec) as Async<R,E,A>
}

const copy = <R,E,A>(self: Async<R,E,A>) => {
    const next = build(async x => x);
    const val = S.setValue(S.getValue(self))
    const env = S.setEnvironment(S.getEnvironment(self))
    const emp = S.setErrorMap(S.getErrorMap(self))
    const rec = S.setRecovery(S.getRecovery(self))
    return next
        ["|>"](val)
        ["|>"](env)
        ["|>"](emp)
        ["|>"](rec) as Async<R,E,A>
}

export const succeedWith = <A>(fn: () => A) => build<unknown, never, A>(async () => fn())

export const Succeed = <A>(a: A) => build<unknown, never, A>(async () => a);

export const failWith = <E>(e: () => E) => build<unknown, E, never>(async () => { throw e() });

export const Fail = <E>(e: E) => build<unknown, E, never>(async () => { throw e });

export const of = Succeed

export const from = <R,A>(fn: (r: R) => Promise<A>) => build(fn);

export const fromCondition = <A>(fn: (a: A) => boolean) => (a: A) => from(async () => {
    if( fn(a) ){
        return a
    }
    throw a
}) as AsyncIO<A,A>

export const fromPredicate = <A, B extends A>(pred: (a: A) => a is B) => (a: A) => from(async () => {
    if( pred(a) ){
        return a
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

const _require = <R>(): AsyncRIO<R,R> => build(async (r: R) => r);

export { _require as require }

export const map = <A,B>(fn: (a: A) => B) => <R,E>(self: Async<R,E,A>) => {
    const next = copy(self);
    const composed = async (r: R) => {
        const a = await runWith(r as R)(self);
        return await fn(a as A);
    };
    const val = S.setValue(composed);
    return val(next) as unknown as Async<R,E,B>;
}

export const mapError = <E,E0>(fn: (e: E) => E0) => <R,A>(self: Async<R,E,A>) => {
    const next = copy(self);
    const m = S.setErrorMap((e: unknown) => fn(S.getErrorMap(self)(e)))
    return m(next) as Async<R,E0,A>;
}

export const recover = <E,B>(fn: (e: E) => AsyncUIO<B>) => <R,A>(self: Async<R,E,A>) => {
    const next = copy(self);
    const r = S.setRecovery((e: unknown) => {
        const other = fn(e as E);
        
        const recovered = build(async () => {
            return await run(other);
        })

        return recovered;
    })
    return r(next) as unknown as Async<R, never, A | B>
}

export const chain = <R0,E0,A0,A>(fn: (a: A) => Async<R0, E0, A0>) => <R,E>(self: Async<R,E,A>) => {
    const next = copy(self);
    const composed = async (r: R & R0) => {
        const a = await runWith(r as R)(self);
        return await runWith(r as R0)(fn(a as A));
    };
    const val = S.setValue(composed);
    return val(next) as unknown as Async<R0 & R, E0 | E, A0>;
}

export const recurIf = <A>(pred: (a: A) => AsyncUIO<boolean>) => <R,E>(self: Async<R,E,A>) => {
    const fn = S.getValue(self);
    async function recurring(r: R): Promise<A> {
        const a = await fn(r);
        const should = await S.getValue(pred(a))(undefined);
        if( should ){
            return await recurring(r);
        }
        return a
    }
    const next = build(recurring);
    const r = S.setRecovery(S.getRecovery(self))
    const e = S.setEnvironment(S.getEnvironment(self))
    const m = S.setErrorMap(S.getErrorMap(self))
    return m(r(e(next)))
}

export const recurWhile = <A>(pred: (a: A) => boolean) => <R,E>(self: Async<R,E,A>) => {
    const fn = S.getValue(self);
    async function recurring(r: R): Promise<A> {
        const a = await fn(r);
        if( pred(a) ){
            return await recurring(r);
        }
        return a
    }
    const next = build(recurring);
    const r = S.setRecovery(S.getRecovery(self))
    const e = S.setEnvironment(S.getEnvironment(self))
    const m = S.setErrorMap(S.getErrorMap(self))
    return m(r(e(next)))
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
    const next = copy(self)
    const env = S.setEnvironment(() => r);
    return env(next) as Async<unknown, E, A>;
}

export const access = <A,K extends keyof A>(key: K) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](map(a => a[key]))
}

export const alias = <A, K extends keyof A, K0 extends string>(original: K, aliased: K0) => 
    <R,E>(self: Async<R,E,A>): Async<R, E, A & {[P in K0]: A[K]}> => {
        return self["|>"](map(data => ({ ...data, [aliased]: data[original] } as A & { [P in K0]: A[K] })))
    }

export const rename = <A, K extends keyof A, K0 extends string>(original: K, aliased: K0) => 
    <R,E>(self: Async<R,E,A>): Async<R, E, Omit<A,K> & {[P in K0]: A[K]}> => {
        return self["|>"](map(({ [original]: val, ...other }) => ({
            ...other,
            [aliased]: val
        } as Omit<A,K> & {[P in K0]: A[K]})))
    }

export const tapEffect = <R0,E0,A0,A>(fn: (a: A) => Async<R0,E0,A0>) => <R,E>(self: Async<R,E,A>) => {
    return self["|>"](chain(a => fn(a)["|>"](map(() => a))))
}

export const runWith = <R>(env: R) => async <E,A>(self: Async<R,E,A>): Promise<A> => { 
    const inner = S.getValue(self);
    const provision = S.getEnvironment(self);
    try {
        return await inner(provision(env));
    } catch(e: unknown){
        const recovery = S.getRecovery(self) 
        const mapError = S.getErrorMap(self)
        const err = mapError(e);
        if( recovery ){
            return await run(recovery(err))
        }
        throw err;
    }
}

export const run = async <E,A>(self: AsyncIO<E,A>): Promise<A> => self["|>"](runWith<unknown>(undefined))
