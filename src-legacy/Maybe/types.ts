import type { Eq } from "../Union/eq";
import type { Foldable } from "../Union/foldable";
import type { Monad } from "../Union/monad";
import type { Show } from "../Union/show";

export interface Maybe<A> extends
Monad<A>, Show, Foldable, Eq<A> {
    /**
     * If Just, returns application of argument or argument. 
     * If None, returns inner value. 
     */
    onJust<B>(fn: B | ((x: A) => B)): B;
    /**
     * If None, returns application of argument or argument. 
     * If Just, returns inner value. 
     */
    onNone<B>(fn: B | (() => B)): B;
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

    effect(fn: <B>(x: A) => Maybe<B>): Maybe<A>;
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

    concat(s: Maybe<A>): Maybe<A>;

    empty(): Maybe<A>;

    /**
     * If Just and the predicate returns true for the inner value, returns it unchanged.
     * If Just and the predicate returns false for the inner value, returns none.
     * If None, returns None
     * @param fn 
     */
    filter(fn: (a: A) => boolean): Maybe<A>;

    equals<B>(e: Maybe<B>): boolean;

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
    catch(onReject: (err: undefined) => void): void
}

export interface MaybeRep {
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
     * If `ramda.empty` returns true, None. Just otherwise
     * @param x inner value
     */
    fromEmpty<T>(x: T): Maybe<T>;
    /**
     * If predicate evaluates to true returns Just of second argument. None otherwise
     * @param x inner value
     */
    fromPredicate<A>(pred: (a: A) => boolean, val?: A ): Maybe<A>;
    /**
     * Returns true if inner value is considered an empty value.
     * @param x inner value
     */
    isEmpty<T>(x: Maybe<T>): boolean;
  
    pure<A>(x: A): Maybe<A>;
  
    empty<A>(): Maybe<A>;
    accumulate(monoids: Maybe<any>[]): Maybe<any[]>;
    foldMap<A>(values: A[]): Maybe<A>;
  
    equals<A>(ma: Maybe<A>, mb: Maybe<A>): boolean;
    do<A>(fn: any): Maybe<A>;
    
    natural<A>(data: A): Maybe<A>;
}