import { defineOverrides, prop, propOr } from "../_internals/mod.ts";

import { setTypeclass } from "../_internals/symbols.ts";

import type { AnyConstRec, AnyFnRec, Boxed } from "../_internals/types.ts";

import type { Applicative, ApplicativeRep } from "./applicative.ts";


type MonadDefs = {
    pure?: string,
    return?: string,
    trivials?: string[],
    identities?: string[],
    lazy?: boolean,
    overrides?: {
        chain?: AnyFnRec
        join?: AnyFnRec
    }
}

export interface Monad<A> extends Applicative<A> {
    /**
     * Flattens a nested monad
     */
    join(): A extends Monad<infer B> ? Monad<B> : A;
    /**
     * Flattens a nested monad
     */
    flat(): A extends Monad<infer B> ? Monad<B> : A;
    /**
     * Performs monad composition using `fn`
     * @param fn 
     */
    chain   <B>(fn: (a: A) => Monad<B>): Monad<B>;
    /**
     * Performs monad composition using `fn`
     * @param fn 
     */
    flatMap <B>(fn: (a: A) => Monad<B>): Monad<B>;
}

export interface MonadRep extends ApplicativeRep { 
    /**
     * Wraps a value of type `a` into a monadic value `M a`
     * @param x value to be wrapped
     */       
    return<A>(x: A): Monad<A>;
    /**
     * Do notation using generator functions
     */
    do<A>(fn: (pure: <T>(a: T) => Monad<T>) => Generator<any, Monad<A>, any>): Monad<A>;
}

/**
 * Adds chain, bind and flatMap method to proto. Adds return and do to global. Requires Applicative
 */
const Monad = (defs: MonadDefs) => setTypeclass("Monad")((cases: AnyConstRec, globals: any) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const lazy = propOr(false,"lazy",defs);
    const pureM = propOr(prop("pure")(defs) as unknown as string, "return", defs)
    trivials.forEach(trivial => {
        function chain<A,B>(this: Boxed<A>, fn: (a: A) => Monad<B>){
            return fn(this.get())
        }
        cases[trivial].prototype.chain   = chain
        cases[trivial].prototype.flatMap = chain

        function join<A>(this: Boxed<Monad<A>>){
            return this.get()
        }
        cases[trivial].prototype.join = join
        cases[trivial].prototype.flat = join
    })
    identities.forEach(empt => {
        function chain<A,B>(this: Monad<A>, _fn: (a: A) => Monad<B>){
            return this as unknown as Monad<B>
        }
        cases[empt].prototype.chain   = chain
        cases[empt].prototype.flatMap = chain
        cases[empt].prototype.flat = chain
        cases[empt].prototype.join = chain
    })
    defineOverrides("chain",["bind","flatMap"],overrides,cases)
    defineOverrides("join",["flat"],overrides,cases)
    globals.return = (...args: any[]) => new cases[pureM](...args);
    globals.do = function(this: MonadRep, fn: (pure: <Any>(a: Any) => Monad<Any>) => Generator<Monad<any>, Monad<any>, any>){
        let gen: ReturnType<typeof fn> = undefined as any;
        const runDo = (prev: Monad<any>): Monad<any> => {
            let monad = gen.next(prev)
            if( monad.done ){
              return monad.value;
            } else {
              return monad.value.flatMap(runDo)
            }
        }
        if( lazy ){
            return this.return((...args: any[]) => {
                gen = fn(this.return)
                return (runDo(undefined as any) as any).unsafeRun(...args)
            })
        }
        gen = fn(this.return);
        return runDo(undefined as any)
    }
})

setTypeclass("Monad")(Monad)

export default Monad;