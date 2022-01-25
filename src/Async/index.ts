import { Applicative, Functor, Monad, Runnable, Show, Tap, Thenable, Traversable } from "../Union";
import Union from "../Union/union";
import { identity, isFunction, isPrimitive, makeTuple, pass } from "../_internals/functions";
import { getInnerValue, setInnerValue } from "../_internals/symbols";
import { AnyConstRec } from "../_internals/types";
import { 
    Async,
    AsyncIO, 
    AsyncPartialRep, 
    AsyncRep,
    getCritical,
    getFailure,
    getIgnore,
    getSuccess, 
    makeWrapper,
    setCritical,
    setIgnore
} from "./types";

const thenableOf = (thenImpl: (res: any, rej: any) => void) => ({
    then: thenImpl,
    catch(rej: any){
        this.then(undefined, rej)
    }
})

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
    cases.Success.prototype.recover = function(this: Async<any,any>, fn: any){
        const cpy = this.map(identity)
        return setInnerValue(setCritical(fn)(cpy.get()))(cpy)
    }
    cases.Success.prototype.ignore = function(this: Async<any,any>){
        const a = this.mapTo(undefined);
        return setInnerValue(setIgnore(true)(getInnerValue(a)))(a)
    }
    cases.Success.prototype.provideTo = function<R,A,B>(this: Async<R,A>, other: Async<A,B>){
        return this.chain(a => other.provide(a))
    }
    cases.Success.prototype.provideSliceTo = function<R,A,A0,B>(this: Async<R,A>, other: Async<A0,B>){
        return this.chain(a => other.provideSlice(a))
    }
    cases.Success.prototype.providePartialTo = function<R,A,A0,B>(this: Async<R,A>, other: Async<A0,B>){
        return this.chain(a => other.providePartial(a))
    }
    cases.Success.prototype.access = function<R,A,K extends keyof A>(this: Async<R,A>, key: K){
        return this.map(({ [key]: attr }) => attr)
    }
    cases.Success.prototype.alias = function<R,A,K extends keyof A,K0 extends string>(this: Async<R,A>, og: K, aliased: K0){
        return this.map((data) => ({ ...data, [aliased]: data[og] }))
    }
    cases.Success.prototype.rename = function<R,A,K extends keyof A,K0 extends string>(this: Async<R,A>, og: K, aliased: K0){
        /* istanbul ignore next */
        return this.map(({ [og]: val, ...rest}) => ({ ...rest, [aliased]: val }))
    }
    cases.Success.prototype.tapEffect = function<R,A,R0,A0>(this: Async<R,A>, fn: (a: A) => Async<R0,A0>){
        return this.chain((a) => fn(a).mapTo(a))
    }
    cases.Success.prototype.continueIf = function<R,A>(this: Async<R,A>, fn: (a: A) => boolean){
        return this.tapEffect((a) => fn(a) ? new cases.Success(undefined) : new cases.Fail(a))
    }


    cases.Fail.prototype.recover = function<R,A,A0>(
        this: Async<R,A>,
        fn: (e: any) => Async<unknown, A0>
    ) {
        return new cases.Success(getFailure(getInnerValue(this))).chain(fn)
    }
    cases.Fail.prototype.ignore = function(){
        return new cases.Success(undefined)
    }

    cases.Fail.prototype.zipWith = pass
    cases.Fail.prototype.zip = pass
    cases.Fail.prototype.zipLeft = pass
    cases.Fail.prototype.zipRight = pass
    cases.Fail.prototype.provide = pass
    cases.Fail.prototype.providePartial = pass
    cases.Fail.prototype.provideSlice = pass
    cases.Fail.prototype.provideTo = pass
    cases.Fail.prototype.providePartialTo = pass
    cases.Fail.prototype.provideSliceTo = pass
    cases.Fail.prototype.access = pass
    cases.Fail.prototype.alias = pass
    cases.Fail.prototype.tapEffect = pass
    cases.Fail.prototype.continueIf = pass

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
            return Async.Success((env: R) => getSuccess(this.get())(env).then(fn))
        },
      },
      apply: {
        Success<A,B>(this: AsyncIO<A>, asyncFn: AsyncIO<(a:A) => B>){
            return this.chain(a => asyncFn.map(fn => fn(a))) 
        }
      },
      chain: {
        Success<R,A,R0,B>(this: Async<R,A>, fn: (a: A) => Async<R0,B>) {
            return Async.Success((env: any) => this.run(env).then(a => fn(a).run(env)))
        },
      },
      join: {
        Success<R,A,R0>(this: Async<R,Async<R0,A>>){
            return this.chain(identity)
        }
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
            const inner = this.get();
            const success = getSuccess(inner)
            const critical = getCritical(inner)
            const ignore = getIgnore(inner)
            try {
                return await success(env)
            } catch(e) {
                if( ignore ) {
                    return undefined
                }
                if( critical ){
                    return critical(e).run()
                }
                return await Promise.reject(e)
            }
        },
        Fail<R,A>(this: Async<R,A>){
            return Promise.reject(getFailure(this.get()))
        }
      },
      traverse(data: any[], fn: (a: any) => AsyncIO<any>){
        const res: any[] = []
        return data
            .map(x => fn(x).tap(x => res.push(x)))
            .reduce((acc,next) => acc.chain(() => next))
            .fmap(() => res)
      },
      toPromise: {
          Success(this: Async<any,any>, ...args: any[]){ return this.run(...args) },
          Fail(this: Async<any,any>, ...args: any[]){ return this.run(...args) },
      },
      toThenable: {
          Success(this: Async<any,any>, ...args: any[]){
            return thenableOf((res, rej=identity) => this.run(...args).then(res,rej))
          },
          Fail(this: Async<any,any>,...args: any[]){
            return thenableOf((res, rej) => this.run(...args).then(res,rej))
          }
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
        Applicative(AsyncDefs),
        Monad(AsyncDefs),
        Tap(AsyncDefs),
        Runnable(AsyncDefs),
        Show(AsyncDefs),
        Traversable(AsyncDefs),
        Thenable(AsyncDefs),
        AsyncType()
    ]
).constructors({
    of<R=unknown,A=any>(this: AsyncPartialRep, fn: (env: R) => A): Async<R,A> {
        return this.Success((r: R) => Promise.resolve().then(() => fn(r)))
    },
    from<R=never,A=any>(this: AsyncPartialRep, fn: (env: R) => Promise<A>): Async<R,A> {
        return this.Success(fn)
    },
    fromPromise<A>(this: AsyncPartialRep, p: Promise<A>): Async<unknown,A> {
        return this.Success(() => p)
    },
    unary<A,B>(this: AsyncPartialRep ,fn: (a: A) => B): (a: A) => Async<unknown,B> {
        return (a: A) => this.Success(() => Promise.resolve(fn(a)))
    },
    identity<A>(this: AsyncPartialRep){
        return this.Success((a: A) => Promise.resolve(a))
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
    fromPredicate<A>(this: AsyncPartialRep, fn: (a?: A) => boolean, a?: A){
        return fn(a) ? this.Success(() => Promise.resolve(a)) : this.Fail(a)
    },
    fromCondition<A>(this: AsyncPartialRep, fn: (a?: A) => boolean, a?: A){
        return fn(a) ? this.Success(() => Promise.resolve(a)) : this.Fail(a)
    },
    fromCallback(this: AsyncRep, fn: (res: <T>(t: T) => void, rej: (t: any) => void) => void){
        return this.Success(() => new Promise(fn))
    }
}) as unknown as AsyncRep

export default Async;