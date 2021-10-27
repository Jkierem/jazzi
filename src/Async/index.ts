import Union from "../Union/union";
import { isFunction } from "../_internals";
import { AnyFn } from "../_internals/types";
import { Async, AsyncPartialRep, AsyncRep } from "./types";

type AnyAsync = Async<any,any,any>
type EmptyAsync = Async<unknown,never,any>

const AsyncDefs: any = {
    trivials: ["Succeed"],
    identities: ["Fail"],
    pure: "Succeed",
    lazy: true,
    overrides: {
      fmap: {
        Succeed(this: AnyAsync, fn: AnyFn) {
            return Async.Succeed((r: unknown) => this.run(r).then(fn));
        },
      },
      mapError: {
        Fail(this: AnyAsync, fn: AnyFn){
            return Async
        }
      },
      chain: {
        Succeed(this: AnyAsync, fn: AnyFn) {
            return Async.Succeed((env: unknown) => this.run(env).then(x => fn(x).run(env)))
        },
      },
      join: {
        Succeed(this: AnyAsync){
            return Async.Succeed((r: unknown) => this.unsafeRun(r).then(x => x.unsafeRun(r)))
        }
      },
      apply: {
        Succeed(this: AnyAsync, asyncWithFn: AnyAsync) {
            return this.chain(args => asyncWithFn.map(fn => fn(args)))
        },
      },
      show: {
        Succeed() {
            return `[Async => R => _]`;
        },
      },
      run: {
        Succeed(this: AnyAsync) {
            return this.get()();
        },
      },
      then: {
        Succeed(this: EmptyAsync, res: AnyFn){
            this.run(undefined).then(res)
        }
      },
      toPromise: {
        Succeed(this: EmptyAsync) {
            return this.run(undefined)
        }
      }
    },
  };
const Async = Union(
    "Async",
    {
        Succeed: x => (env: any) => ({
            s: () => Promise.resolve(env).then(isFunction(x) ? x : () => x),
            e: (x: any) => x,
        }),
        Fail: x => (env: any) => ({
            s: x => x,
            e: Promise.reject(env).then(isFunction(x) ? x : () => x)
        }),
    },
    [

    ]
).constructors({
    of<R=unknown,E=never,A=any>(this: AsyncPartialRep, fn: (env: R) => A): Async<R,E,A> {
        return this.Succeed((r: R) => Promise.resolve().then(() => fn(r)))
    },
    from<R=unknown,E=never,A=any>(this: AsyncPartialRep, fn: (env: R) => Promise<A>): Async<R,E,A> {
        return this.Succeed(fn)
    },
    fromPromise<E=never,A=any>(this: AsyncPartialRep, p: Promise<A>): Async<unknown,E,A> {
        return this.Succeed(() => p)
    },
    unary<A,B>(this: AsyncPartialRep ,fn: (a: A) => B): (a: A) => Async<unknown,never,B> {
        return (a: A) => this.Succeed(() => Promise.resolve(fn(a)))
    },
    through<A,B>(this: AsyncPartialRep, fn: (...a: A[]) => B): (...a: A[]) => Async<unknown,never,B> {
        return (...a: A[]) => this.Succeed(() => Promise.resolve(fn(...a)))
    },
    require<Env>(this: AsyncPartialRep): Async<Env,never,Env> {
        return this.Succeed((env: Env) => Promise.resolve(env))
    },
    unit(this: AsyncPartialRep): Async<unknown,never,undefined> {
        return this.Succeed(() => Promise.resolve(undefined))
    }
}) as unknown as AsyncRep

export default Async;