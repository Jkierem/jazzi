import type { Eq, EqRep } from "../Union/eq";
import type { Filterable } from "../Union/filterable";
import type { Foldable } from "../Union/foldable";
import type { Monad, MonadRep } from "../Union/monad";
import type { Monoid, MonoidRep } from "../Union/monoid";
import type { Natural, NaturalRep } from "../Union/natural";
import type { Show } from "../Union/show";
import type { Tap } from "../Union/tap";
import type { Thenable } from "../Union/thenable";
import type { Boxed, Matcher, MatcherRep } from "../_internals/types";
import type { Async } from "../Async/types"
import type { TraversableRep } from "../Union/traversable";

type MaybeCases = "Just" | "None";

export interface Maybe<A> extends 
Monad<A>, Filterable<A>, Monoid<A>, Thenable<A,undefined>, Tap<A>,
Natural<A>, Show, Foldable, Eq, Matcher<MaybeCases>, Boxed<A>
{
    /**
     * If Just, returns application of argument or argument. 
     * If None, returns undefined. 
     */
    onJust<B>(fn: B | ((x: A) => B)): B;
    /**
     * If None, returns application of argument or argument. 
     * If Just, returns inner value. 
     */
    onNone<B>(fn: B | (() => B)): A | B;
    /**
     * If Just, maps over argument
     * If None, returns structure unchanged. 
     */
    ifJust: <B>(fn: (x: A) => Maybe<B>) => Maybe<B>;
    /**
     * If None, maps over argument
     * If Just, returns structure unchanged. 
     */
    ifNone: <B>(fn: (x: A) => Maybe<B>) => Maybe<B>;
    /**
     * If Just, returns true
     * If None, returns false
     */
    isJust: () => boolean;
    /**
     * If Just, returns false
     * If None, returns true
     */
    isNone: () => boolean;

    peak(fn: (x: A) => void): Maybe<A>;
    tap(fn: (x: A) => void): Maybe<A>;
    matchEffect(patterns: any): Maybe<A>;
    when(patterns: any): Maybe<A>;

    map<B>(fn: (a: A) => B ): Maybe<B>;
    fmap<B>(fn: (a: A) => B ): Maybe<B>;
    mapTo<B>(b: B): Maybe<B>;

    apply<B>(a: Maybe<(a: A) => B>): Maybe<B>;
    applyRight<B>(a: Maybe<(a: A) => B>): Maybe<B>;
    applyLeft<B,C>(this: Maybe<(b: B) => C>, ap: Maybe<B>): Maybe<C>;

    chain   <B>(fn: (a: A) => Maybe<B>): Maybe<B>;
    flatMap <B>(fn: (a: A) => Maybe<B>): Maybe<B>;
    join(): A extends Monad<infer B> ? Maybe<B> : A;
    flat(): A extends Monad<infer B> ? Maybe<B> : A;

    concat(s: Maybe<A>): Maybe<A>;
    sconcat(s: Maybe<A>): Maybe<A>;

    empty(): Maybe<A>;

    /**
     * If Just and the predicate returns true for the inner value, returns it unchanged.
     * If Just and the predicate returns false for the inner value, returns none.
     * If None, returns None
     * @param fn 
     */
    filter(fn: (a: A) => boolean): Maybe<A>;

    equals<B>(e: Maybe<B> | B): boolean;

    fold<B,C>(onNone: () => B, onJust: (a: A) => C): B | C;

    /**
     * Returns a promise that resolves with inner value if Just or rejects with undefined if None
     */
    toPromise(): Promise<A>;
    /**
     * Call onResolve if Just. Call onReject if None
     * @param onResolve 
     * @param onReject 
     */
    then(onResolve: (value: A) => void, onReject: (err: undefined) => void): void;
    /**
     * Calls onReject if None
     * @param onReject 
     */
    catch(onReject: (err: undefined) => void): void;
    /**
     * Success if Just
     * Fail if None
     */
    toAsync(): Async<unknown, A>
}

export interface MaybeRep 
    extends NaturalRep, EqRep, MonadRep, MonoidRep, MatcherRep<MaybeCases>, TraversableRep
{
    /**
     * Just constructor
     * @param a inner value
     */
    Just<A>(a: A): Maybe<A>;
    /**
     * None constructor
     */
    None<A>(): Maybe<A>;
    /**
     * If truthy returns Just. None otherwise
     * @param x inner value
     */
    of<T>(x: T): Maybe<T>;
    /**
     * If truthy returns Just. None otherwise
     * @param x inner value
     */
    from<T>(x: T): Maybe<T>;
    /**
     * If truthy returns Just. None otherwise
     * @param x inner value
     */
    fromFalsy<T>(x: T): Maybe<T>;
    /**
     * If non-empty array returns Just. None otherwise
     * @param x inner value
     */
    fromArray<T>(x: T[]): Maybe<T[]>;
    /**
     * If null or undefined returns None. Just otherwise
     * @param x inner value
     */
    fromNullish<T>(x: T): Maybe<T>;
    /**
     * If given a value considered empty, returns None. Just otherwise.
     * Empty values are {}, [], "", or the result of calling empty on either the value or its' constructor.
     * @param x inner value
     */
    fromEmpty<T>(x: T): Maybe<T>;
    /**
     * If predicate evaluates to true returns Just of second argument. None otherwise
     * @param x inner value
     */
    fromPredicate<A>(pred: (a: A) => boolean, val?: A ): Maybe<A>;
    /**
     * Returns true if the inner value of the given maybe is considered an empty value. 
     * None is also itself considered as empty
     * @param x inner value
     */
    isEmpty(x: any): boolean;
  
    pure<A>(x: A): Maybe<A>;
    return<A>(x: A): Maybe<A>;
    do<A>(fn: (pure: <T>(a: T) => Maybe<T>) => Generator<any,Maybe<A>,any>): Maybe<A>;
  
    empty<A>(): Maybe<A>;
    accumulate(monoids: Maybe<any>[]): Maybe<any>;
    foldMap<A>(values: A[]): Maybe<A>;
  
    equals<A>(ma: Maybe<A>, mb: Maybe<A>): boolean;
    
    natural<A>(data: A): Maybe<A>;
}