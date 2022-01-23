import type { Maybe } from "../Maybe/types";
import type { Foldable } from "../Union/foldable";
import type { FunctorError } from "../Union/functor";
import type { Monad, MonadRep } from "../Union/monad";
import type { Show } from "../Union/show";
import type { Swap } from "../Union/swap";
import type { Thenable } from "../Union/thenable";
import type { Boxed, Extractable, Matcher, MatcherRep, Nil, Tuple } from "../_internals/types";
import type { Async } from "../Async/types"
import type { ApplicativeRep } from "../Union/applicative";

type EitherCases = "Left" | "Right";

interface EitherWrapper<L,R> {
    either: Either<L,R>
}

export interface Either<L,R>
extends Monad<R>, Matcher<EitherCases>,
    Swap<L,R>, FunctorError<L>, Show,
    Thenable<R,L>, Foldable, Boxed<R | L, EitherRep, EitherCases>
{
    get(): R | L;
    getRight(): R;
    getRightOr<B>(or: Extractable<B>): R | B;
    getLeft(): L;
    getLeftOr<B>(or: Extractable<B>): L | B;
    getEither(): L | R;

    onRight: <B>(fn: B | ((x: R) => B)) => B;
    onLeft:  <B>(fn: B | ((x: L) => B)) => B;
    ifRight: <B>(fn: (x: R) => Either<L,B>) => Either<B,R>;
    ifLeft:  <B>(fn: (x: L) => Either<B,R>) => Either<L,B>;
    isRight: () => boolean;
    isLeft: () => boolean;

    map<B>(fn: (a: R) => B): Either<L,B>;
    fmap<B>(fn: (a: R) => B): Either<L,B>;
    mapTo<B>(b: B): Either<L,B>;
    mapRight<B>(fn: (a: R) => B): Either<L,B>;

    mapError<B>(fn: (a: L) => B): Either<B,R>;
    mapLeft<B>(fn: (a: L) => B): Either<B,R>;

    swap(): Either<R,L>
    swapIf(fn: (a: R) => boolean): Either<R | L,L | R>;
    swapOn(fn: (a: R) => boolean): Either<R | L,L | R>;
    /**
     * If Left, calls the first function with inner value.
     * If Right, calls the second function with inner value.
     */
    fold<B>(onLeft: (x:L) => B, onRight:(x: R) => B): B;

    chain  <B>(fn : (x: R) => Either<L,B>): Either<L,B>;
    flatMap<B>(fn : (x: R) => Either<L,B>): Either<L,B>;
    join(): R extends Monad<infer B> ? Either<L,B> : R;
    flat(): R extends Monad<infer B> ? Either<L,B> : R;

    apply<B>(ap: Either<any,(a: R) => B>): Either<L,B>;
    applyRight<B>(ap: Either<any,(a: R) => B>): Either<L,B>;
    applyLeft<B,C>(this: Either<L,(b: B) => C>,ap: Either<L,B>): Either<L,C>;

    /**
     * Success on Right
     * Fail on Left
     */
    toAsync(): Async<unknown, R>;
    pipe<A0>(fn: (self: Either<L,R>) => A0): A0;
    /**
     * Terse pipe operator
     * @param fn 
     */
    ['|>']<A0>(fn: (self: Either<L,R>) => A0): A0;
}

export interface EitherRep 
extends MonadRep, MatcherRep<EitherCases>, ApplicativeRep
{
    Left<L>(l: L): Either<L, never>;
    Right<R>(r: R): Either<never, R>;

    of<R>(x: R): Either<Nil, NonNullable<R>>;
    from<L,R>(l: L, r: R): Either<L, NonNullable<R>>;
    fromNullish<L,R>(l: L, r: R): Either<L, NonNullable<R>>;
    fromFalsy<L,R>(l: L, r: R): Either<L,R>;
    fromPredicate<R>(pred: (r: R) => boolean, r: R): Either<R,R>;
    fromMaybe<R>(m: Maybe<R>): Either<undefined, R>;
    defaultTo<L,R>(l: L): (r: R) => Either<L, NonNullable<R>>;
    /**
     * Recieves a function `fn` that returns something of type `R` or may throw something of type `E`, 
     * and tries to run it, wrapping the result or error in an Either<E,R>. For async functions use `asyncAttempt`
     * @param fn 
     * @param args 
     */
    attempt<E=never,R=unknown>(fn: () => R): Either<E, R>;
    attempt<Args,E=never,R=unknown>(fn: (...args: Args[]) => R, ...args: Args[]): Either<E, R>;
    /**
     * Async version of `attempt`. 
     * @param fn 
     * @param args
     */
    asyncAttempt<E=never,R=unknown>(fn: () => R): Promise<Either<E, Awaited<R>>>;
    asyncAttempt<Args,E=never,R=unknown>(fn: (...args: Args[]) => R, ...args: Args[]): Promise<Either<E, Awaited<R>>>;

    /**
     * returns a new array with all the Lefts
     * @param ls 
     */
    lefts<L>(ls: Either<L, unknown>[]): Either<L,never>[];
    /**
     * returns a new array with all the Rights
     * @param rs 
     */
    rights<R>(rs: Either<unknown, R>[]): Either<never, R>[];
    /**
     * returns a tuple with the eithers split in rights and lefts
     * @param rs 
     */
    partition<L,R>(lrs: Either<L,R>[]): Tuple<Either<L,never>[], Either<never, R>[]>;
    /**
     * Merges all lefts by means of calling concat on the inner value of lefts
     * @param xs 
     */
    collectLefts<L,R>(xs: Either<L,R>[]): Either<L[], never>
    /**
     * Merges all rights by means of calling concat on the inner value of rights
     * @param xs 
     */
    collectRights<L,R>(xs: Either<L,R>[]): Either<never, R[]>;

    pure<A>(x: A): Either<any,A>;
    return<A>(x: A): Either<any,A>;
    do<A>(fn: (pure: <T>(a: T) => Either<any,T>) => Generator<any, Either<any,A>, any>): Either<any,A>;
}