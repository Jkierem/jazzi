import type { Runnable } from "../Union/runnable";
import type { Monad, MonadRep } from "../Union/monad";
import type { LazyShow } from "../Union/show";
import type { Tap } from "../Union/tap";
import type { Thenable } from "../Union/thenable";
import type { Boxed } from "../_internals/types";

export interface IO<A> 
extends Monad<A>, Thenable<A, any>, Tap<A>, LazyShow<"IO", "()">, Runnable<[],A>, Boxed<A,IORep,"IO">
{
    map<B>(fn: (a: A) => B ): IO<B>;
    fmap<B>(fn: (a: A) => B ): IO<B>;
    mapTo<B>(b: B): IO<B>;
    apply<B>(ap: IO<(a: A) => B>): IO<B>;
    applyRight<B>(ap: IO<(a: A) => B>): IO<B>;
    applyLeft<B,C>(this: IO<(b: B) => C>,ap: IO<B>): IO<C>;
    join(): A extends Monad<infer B> ? IO<B> : A;
    flat(): A extends Monad<infer B> ? IO<B> : A;
    chain   <B>(fn: (a: A) => IO<B>): IO<B>;
    flatMap <B>(fn: (a: A) => IO<B>): IO<B>;
    peak(fn: (x: A) => void): IO<A>;
    tap(fn: (x: A) => void): IO<A>;
    matchEffect(patterns: any): IO<A>;
    when(patterns: any): IO<A>;
}

export interface IORep 
extends MonadRep 
{
    IO<A>(fn: () => A): IO<A>;
    of<A>(fn: () => A): IO<A>;
    from<A>(fn: () => A): IO<A>;
    forward<Args extends any[], Return>(fn: (...args: Args) => Return): (...args: Args) => IO<Return>;
    through<Args extends any[], Return>(fn: (...args: Args) => Return): (...args: Args) => IO<Return>;
    unary<Arg, Return>(fn: (a: Arg) => Return): (args: Arg) => IO<Return>;
    pure<A>(x: A): IO<A>;
    return<A>(x: A): IO<A>;
    do<A>(fn: (pure: <T>(a: T) => IO<T>) => Generator<any, IO<A>, any>): IO<A>;
}