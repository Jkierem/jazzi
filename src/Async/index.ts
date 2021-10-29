import { Functor, Monad, Runnable, Show } from "../Union";
import Union from "../Union/union";
import { identity, isFunction } from "../_internals";
import { AnyFn } from "../_internals/types";
import { Async, AsyncPartialRep, AsyncRep, getFailure, getHandler, getSuccess, makeWrapper } from "./types";

type AnyAsync = Async<any,any,any>

type Bottom<A> =  A extends never ? [] : [A]

const AsyncDefs: any = {
    trivials: ["Succeed"],
    identities: ["Fail"],
    pure: "Succeed",
    lazy: true,
    overrides: {
      fmap: {
        Succeed<R,E,A,B>(this: Async<R,E,A>, fn: (a: A) => B) {
          const rep = this.get()
          const suc = getSuccess(rep);
          return Async.Succeed((env: R) => suc(env).then(fn))
        },
      },
      chain: {
        Succeed<R,E,A,R0,E0,B>(this: Async<R,E,A>, fn: (a: A) => Async<R0,E0,B>) {
          return Async.Succeed((...env: [R & R0]) => this.run(...env as unknown as Bottom<R>).then(a => fn(a).run(...env as unknown as Bottom<R0>)))
        },
      },
      join: {
        Succeed<R,E,A,R0,E0>(this: Async<R,E, Async<R0,E0, A>>){}
      },
      show: {
        Succeed() {
            return `[Async => Succeed => (R -> _)]`;
        },
        Fail() {
            return `[Async => Fail => (R -> _)]`;
        },
      },
      run: {
        Succeed(this: AnyAsync, env: any) {
            const inner = this.get()
            return getSuccess(inner)(env).catch(getHandler(inner))
        },
        Fail(this: AnyAsync){
            const inner = this.get()
            const handler = getHandler(inner)
            if( handler ){
                return Promise.resolve(handler(getFailure(inner)))
            }
            return Promise.reject(getFailure(inner))
        }
      }
    },
};

const wrapSuccess = <R,A>(x: A | ((r: R) => A)) => (env: R) => Promise.resolve(env).then(isFunction(x) ? x : () => x);

const Async = Union(
    "Async",
    {
        Succeed: x => makeWrapper(wrapSuccess(x), undefined),
        Fail: x => makeWrapper(identity, x),
    },
    [
        Functor(AsyncDefs),
        Monad(AsyncDefs),
        Runnable(AsyncDefs),
        Show(AsyncDefs)
    ]
).constructors({
    of<R=unknown,E=never,A=any>(this: AsyncPartialRep, fn: (env: R) => A): Async<R,E,A> {
        return this.Succeed((r: R) => Promise.resolve().then(() => fn(r))) as unknown as Async<R,E,A>
    },
    from<R=never,E=never,A=any>(this: AsyncPartialRep, fn: (env: R) => Promise<A>): Async<R,E,A> {
        return this.Succeed(fn) as unknown as Async<R,E,A>
    },
    fromPromise<E=never,A=any>(this: AsyncPartialRep, p: Promise<A>): Async<unknown,E,A> {
        return this.Succeed(() => p) as unknown as Async<unknown,E,A>
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