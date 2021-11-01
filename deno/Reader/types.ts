import type { Monad, MonadRep } from "../Union/monad.ts";
import type { Runnable } from "../Union/runnable.ts";
import type { LazyShow } from "../Union/show.ts";
import type { Thenable } from "../Union/thenable.ts";

export interface Reader<R,A> 
extends Monad<A>, Thenable<A, any>, LazyShow<"Reader", "R">, Runnable<[R],A>
{
    map<B>(fn: (a: A) => B ): Reader<R,B>;
    fmap<B>(fn: (a: A) => B ): Reader<R,B>;
    mapTo<B>(b: B): Reader<R,B>;
    apply<B>(ap: Reader<R,(a: A) => B>): Reader<R,B>;
    applyRight<B>(ap: Reader<R,(a: A) => B>): Reader<R,B>;
    applyLeft<B,C>(this: Reader<R,(b: B) => C>,ap: Reader<R,B>): Reader<R,C>;
    join(): A extends Monad<infer B> ? Reader<R,B> : A;
    flat(): A extends Monad<infer B> ? Reader<R,B> : A;
    chain   <B>(fn: (a: A) => Reader<R,B>): Reader<R,B>;
    flatMap <B>(fn: (a: A) => Reader<R,B>): Reader<R,B>;
}

export interface ReaderRep 
extends MonadRep
{
    /**
     * Constructs a Reader. Expects a function that receives the enviroment
     */
     of:<R,A>(x: A | ((a: R) => A)) => Reader<R,A>;
     /**
      * Constructs a Reader. Expects a function that receives the enviroment
      */
     from:   <R,A>(x: A | ((a: R) => A)) => Reader<R,A>;
     Reader: <R,A>(x: A | ((a: R) => A)) => Reader<R,A>;
     pure:   <R,A>(x: A | ((a: R) => A)) => Reader<R,A>;
     runReader: <R,A>(reader: Reader<R,A>, env: R) => A;
     do<R,A>(fn: any): Reader<R,A>;
     ask<R,A>(): Reader<R,A>
}