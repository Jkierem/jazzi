import { Functor, Monad, Runnable, Show, Tap, Traversable } from "../Union";
import Union from "../Union/union";
import { identity, isFunction, isPrimitive, makeTuple, pass } from "../_internals";
import { getInnerValue, setInnerValue } from "../_internals/symbols";
import { AnyConstRec, AnyFn } from "../_internals/types";
import { Async, AsyncIO, AsyncPartialRep, AsyncRep, getFailure, getHandler, getSuccess, makeWrapper, setHandler } from "./types";

const AsyncType = () => (cases: AnyConstRec, globals: any) => {
    cases.Success.prototype.zipWith = function<R,R0,A,A0,C>(
        this: Async<R,A>, 
        right: Async<R0,A0>, 
        fn: (a: A, a0: A0) => C
    ){
        return this.chain(a => right.map(b => fn(a,b)))
    }
    cases.Success.prototype.zip = function<R,R0,A,A0>(
        this: Async<R,A>, 
        right: Async<R0,A0>, 
    ){
        return this.zipWith(right, makeTuple)
    }
    cases.Success.prototype.zipLeft = function<R,R0,A,A0>(
        this: Async<R,A>, 
        right: Async<R0,A0>, 
    ){
        return this.zipWith(right, a => a)
    }
    cases.Success.prototype.zipRight = function<R,R0,A,A0>(
        this: Async<R,A>, 
        right: Async<R0,A0>, 
    ){
        return this.zipWith(right, (_,b) => b)
    }
    cases.Success.prototype.provide = function<R,A>(
        this: Async<R,A>,
        p: R
    ){
        return new cases.Success(() => this.run(p as any))
    }
    cases.Success.prototype.providePartial = function<R,A>(
        this: Async<R,A>,
        p: Partial<R>
    ){
        if( isPrimitive(p) ){
            return this.provide(p as any)
        }
        return new cases.Success((env: any) => this.run({...p,...env} as any))
    }
    cases.Success.prototype.provideSlice = function<R,A>(
        this: Async<R,A>,
        p: Partial<R>
    ){
        if( isPrimitive(p) ){
            return this.provide(p as any)
        }
        return new cases.Success((env: any) => this.run({...p,...env} as any))
    }
    cases.Success.prototype.recover = function<R,A,A0>(
        this: Async<R,A>,
        fn: (e: any) => Async<unknown, A0>
    ) {
        const cpy = this.map(x => x)
        setInnerValue(setHandler(fn)(getInnerValue(cpy)))(cpy)
        return cpy;
    }
    cases.Fail.prototype.recover = function<R,A,A0>(
        this: Async<R,A>,
        fn: (e: any) => Async<unknown, A0>
    ) {
        const cpy = new cases.Fail(getFailure(getInnerValue(this)))
        return setInnerValue(setHandler(fn)(getInnerValue(cpy)))(cpy)
    }

    cases.Fail.prototype.zipWith = pass
    cases.Fail.prototype.zip = pass
    cases.Fail.prototype.zipLeft = pass
    cases.Fail.prototype.zipRight = pass
    cases.Fail.prototype.provide = pass
    cases.Fail.prototype.providePartial = pass
    cases.Fail.prototype.provideSlice = pass

    globals.all = function(actions: AsyncIO<any>[]){
        const res: any[] = []
        return actions
            .map(x => x.tap(x => res.push(x)))
            .reduce((acc,next) => acc.chain(() => next))
            .map(() => res)
    }
}

const AsyncDefs: any = {
    trivials: ["Success"],
    identities: ["Fail"],
    pure: "Success",
    lazy: true,
    overrides: {
      fmap: {
        Success<R,A,B>(this: Async<R,A>, fn: (a: A) => B) {
          const rep = this.get()
          const suc = getSuccess(rep);
          return Async.Success((env: R) => suc(env).then(fn))
        },
      },
      chain: {
        Success<R,A,R0,B>(this: Async<R,A>, fn: (a: A) => Async<R0,B>) {
          return Async.Success((env: any) => this.run(env).then(a => fn(a).run(env)))
        },
      },
      join: {
        Success<R,A,R0>(this: Async<R,Async<R0,A>>){}
      },
      show: {
        Success() {
            return `[Async => Success => (R -> _)]`;
        },
        Fail() {
            return `[Async => Fail => (R -> _)]`;
        },
      },
      run: {
        async Success<R,A>(this: Async<R,A>, env: R = {} as R) {
            const inner = this.get()
            const handler = getHandler(inner)
            try {
                return await getSuccess(inner)(env)
            } catch (e) {
                return handler ? handler(e).run() : Promise.reject(e)
            }
        },
        Fail<R,A>(this: Async<R,A>){
            const inner = this.get()
            const handler = getHandler(inner)
            if( handler ){
                return handler(getFailure(inner)).run()
            }
            return Promise.reject(getFailure(inner))
        }
      },
      sequence: {
        Success<A,B>(this: AsyncIO<A>, other: AsyncIO<B>){
            return this.zip(other)
        },
        Fail<A,B>(this: AsyncIO<A>, other: AsyncIO<B>){
            return this.zip(other)
        }
      },
      traverse(data: any[], fn: (a: any) => AsyncIO<any>){
        const res: any[] = []
        return data
            .map(x => fn(x).tap(x => res.push(x)))
            .reduce((acc,next) => acc.chain(() => next))
            .map(() => res)
      }
    },
};

const wrapSuccess = <R,A>(x: A | ((r: R) => A)) => (env: R) => Promise.resolve(env).then(isFunction(x) ? x : () => x);

const Async = Union(
    "Async",
    {
        Success: x => makeWrapper(wrapSuccess(x), undefined),
        Fail: x => makeWrapper(identity, x),
    },
    [
        Functor(AsyncDefs),
        Monad(AsyncDefs),
        Tap(AsyncDefs),
        Runnable(AsyncDefs),
        Show(AsyncDefs),
        Traversable(AsyncDefs),
        AsyncType()
    ]
).constructors({
    of<R=unknown,A=any>(this: AsyncPartialRep, fn: (env: R) => A): Async<R,A> {
        return this.Success((r: R) => Promise.resolve().then(() => fn(r))) as unknown as Async<R,A>
    },
    from<R=never,A=any>(this: AsyncPartialRep, fn: (env: R) => Promise<A>): Async<R,A> {
        return this.Success(fn) as unknown as Async<R,A>
    },
    fromPromise<A>(this: AsyncPartialRep, p: Promise<A>): Async<unknown,A> {
        return this.Success(() => p) as unknown as Async<unknown,A>
    },
    unary<A,B>(this: AsyncPartialRep ,fn: (a: A) => B): (a: A) => Async<unknown,B> {
        return (a: A) => this.Success(() => Promise.resolve(fn(a)))
    },
    through<A,B>(this: AsyncPartialRep, fn: (...a: A[]) => B): (...a: A[]) => Async<unknown,B> {
        return (...a: A[]) => this.Success(() => Promise.resolve(fn(...a)))
    },
    require<Env>(this: AsyncPartialRep): Async<Env,Env> {
        return this.Success((env: Env) => Promise.resolve(env))
    },
    unit(this: AsyncPartialRep): Async<unknown,undefined> {
        return this.Success(() => Promise.resolve(undefined))
    },
    fromMaybe(this: AsyncPartialRep, m: any): Async<any,any> {
        return m.match({
            Just: this.Success,
            None: this.Fail
        })
    },
    fromEither(this: AsyncPartialRep, e: any): Async<any,any> {
        return e.match({
            Right: this.Success,
            Left: this.Fail
        })
    },
    fromCallback(this: AsyncRep, fn: (res: <T>(t: T) => void, rej: (t: any) => void) => void){
        return this.Success(() => new Promise(fn))
    }
}) as unknown as AsyncRep

export default Async;