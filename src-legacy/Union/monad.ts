import { defineOverrides, prop, propOr } from "../_internals";
import { setTypeclass } from "../_internals/symbols"
import type { AnyConstRec, AnyFnRec } from "../_internals/types";
import type { Applicative } from "./applicative";

type MonadDefs = {
    pure: string,
    trivials?: string[],
    identities?: string[],
    lazy?: boolean,
    overrides?: {
        chain?: AnyFnRec
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
    /**
     * For lazy monads, runs the wrapper computation. 
     * For Monads that are eager, returns the monad unchanged
     */
    unsafeRun(): any;
    unsafeRun(...args: any[]): any;
    /**
     * For lazy monads, runs the wrapper computation. 
     * For Monads that are eager, returns the monad unchanged
     */
    run(): any;
    run(...args: any[]): any;
}

export interface MonadRep { 
    /**
     * Wraps a value of type `a` into a monadic value `M a`
     * @param x value to be wrapped
     */       
    pure<A>(x: A): Monad<A>;
    /**
     * Do notation using generator functions
     */
    do<A>(fn: any): Monad<A>;
}

/**
 * Adds run, unsafeRun, pure, chain, bind and flatMap method to proto. Adds pure and do to global.
 * The lazy flag enables lazy do implementation
 */
const Monad = (defs: MonadDefs) => setTypeclass("Monad")((cases: AnyConstRec, globals: any) => {
    const trivials = propOr([],"trivials",defs);
    const identities = propOr([],"identities",defs);
    const overrides = propOr({},"overrides",defs);
    const lazy = propOr(false,"lazy",defs);
    const pure = prop("pure")(defs);
    trivials.forEach(trivial => {
        function chain<A,B>(this: Monad<A>, fn: (a: A) => Monad<B>){
            return fn(this.get())
        }
        cases[trivial].prototype.chain   = chain
        cases[trivial].prototype.flatMap = chain

        function join<A>(this: Monad<Monad<A>>){
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
    Object.keys(cases).forEach(key => {
        function run<A>(this: Monad<A>){ return this.get() }
        cases[key].prototype.run       = run;
        cases[key].prototype.unsafeRun = run;
    })
    defineOverrides("chain",["bind","flatMap"],overrides,cases)
    defineOverrides("run",["unsafeRun"],overrides,cases)
    defineOverrides("join",["flat"],overrides,cases)
    globals.pure = (...args: any[]) => new cases[pure](...args)
    globals.do = function<A>(fn: (pure: <Any>(a: Any) => Monad<Any>) => Generator<Monad<any>, Monad<any>, any>){
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
            return new cases[pure]((...args: any[]) => {
                gen = fn(this.pure)
                return runDo(undefined as any).unsafeRun(...args)
            })
        } else {
            gen = fn(this.pure);
            return runDo(undefined as any)
        }
    }
})

setTypeclass("Monad")(Monad)

export default Monad;