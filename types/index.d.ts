declare module "jazzi" {
    
    type Placeholder = import("ramda").Placeholder;
    type Extractable<A> = A | (() => A)
    type Extractable1<A,B> = B | ((a: A) => B)

    type CaseUnion<K> = K | "default" | "_";
    type Cases<K extends string | number | symbol> = {
        [P in CaseUnion<K>]?: Extractable<any>;
    }

    type MaybeCases  = Cases<"Just" | "None">;
    type EitherCases = Cases<"Left" | "Right">;
    type ResultCases = Cases<"Ok" | "Err">;
    type MultCases   = Cases<"Mult" | "One">;
    type SumCases    = Cases<"Sum" | "Zero">;
    type MergeCases  = Cases<"Merge" | "Empty">;
    type SinkCases   = Cases<"Sink">;
    type ReaderCases = Cases<"Reader">;
    type IOCases     = Cases<"IO">;

    /** Type classes */
    /**
     * Boxed value
     */
    interface Boxed<T,Match> {
        /**
         * Breaks the structures and returns the boxed value
         * @returns {T} Inner value
         */
        get(): T;
        /**
         * Type matches using the variant name.
         * Receives an object where the types are the keys and computations are values
         * @param {Match} patterns
         */
        match(patterns: Match): any;
        /**
         * Breaks nested structures (if any) until reaching a value without a get function
         */
        unwrap(): any;
    }

    interface Show {
        /**
         * Returns the string representation
         */
        show(): string;
        /**
         * Returns the string representation
         */
        toString(): string;
    }

    interface Effect<T> {
        /**
         * Runs a function with the inner value of a structure without altering it
         * @param {(x: T) => void} fn function to run
         */
        effect(fn: (x: T) => void): Effect<T>;
        /**
         * Runs a function with the inner value of a structure without altering it
         * @param {(x: T) => void} fn function to run
         */
        peak(fn: (x: T) => void): Effect<T>;
    }

    interface Semigroup<A> {
        /**
         * Semigroup combine method. Takes two semigroups and combines them
         * @param {Semigroup<A>} s Semigroup to be combined
         */
        concat(s: Semigroup<A>): Semigroup<A>
    }

    interface Monoid<A> extends Semigroup<A>{
        /**
         * Returns the empty value of a Monoid
         */
        empty(): Monoid<A>
    }

    interface Functor<A> {
        /**
         * Map a functor over a given function (`fn`)
         * @param fn function used to map inner value
         * @returns mapped functor
         */
        map<B>(fn: (a: A) => B ): Functor<B>;
        /**
         * Map a functor over a given function (`fn`)
         * @param fn function used to map inner value
         * @returns mapped functor
         */
        fmap<B>(fn: (a: A) => B ): Functor<B>;
        /**
         * Attempts to perform a natural transformation by calling `of` method on the argument. *Not actually a proper natural transformation*
         * @param typeRep 
         */
        natural<B>(typeRep: { of: (a: A) => B }): B;
        /**
         * Attempts to perform a natural transformation by calling `of` method on the argument. *Not actually a proper natural transformation*
         * @param typeRep 
         */
        to<B>(typeRep: { of: (a: A) => B }): B;
    }

    interface FunctorError<A> {
        /**
         * Map error case of a functor
         * @param fn function to map over
         */
        mapError<B>(fn: (a: A) => B): FunctorError<B>;
    }

    interface Applicative<A> {
        /**
         * Applies the given applicative (`ap`) with inner value
         * @param ap Applicative to be applied
         * @returns applied Applicative
         */
        apply<B>(ap: Applicative<(a: A) => B>): Applicative<B>;
        /**
         * Applies the value inside the given applicative (`ap`) to the inner value of `this`
         * @param ap Applicative to use for application
         * @returns applied Applicative
         */
        applyLeft<B,C>(this: Applicative<(b: B) => C>,ap: Applicative<B>): Applicative<C>;
    }

    interface Monad<A> extends Functor<A>, Applicative<A> {
        /**
         * Performs monad composition using `fn`
         * @param fn 
         */
        chain   <B>(fn: (a: A) => Monad<B>): Monad<B>;
        /**
         * Performs monad composition using `fn`
         * @param fn 
         */
        bind    <B>(fn: (a: A) => Monad<B>): Monad<B>;
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
        /**
         * For lazy monads, runs the wrapper computation. 
         * For Monads that are eager, returns the monad unchanged
         */
        run(): any;
    }

    interface Filterable<A> {
        /**
         * Receives a predicate and returns the filtered structure
         * @param fn 
         */
        filter(fn: (a: A) => boolean): Filterable<A>;
    }

    interface Eq<A> {
        /**
         * Performs an equality check
         * @param e Eq to be compared with
         */
        equals(e: Eq<A>): boolean;
    }

    interface Swap<L,R> {
        /**
         * Swap the context without altering the inner value.
         */
        swap(): Swap<L,R>
    }

    /** Type Representatives */

    interface MonadRep { 
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
    interface EqRep { 
        /**
         * Performs an equality check
         * @param ea 
         * @param eb 
         */
        equals<A>(ea: Eq<A>, eb: Eq<A>): boolean; 
    }
    interface MonoidRep { 
        /**
         * Returns the empty value of a Monoid
         */
        empty<A>(): Monoid<A>; 
        /**
         * Combines a list of monoids
         * @param monoids list of monoids
         */
        accumulate<A>(monoids: Monoid<A>[]): Monoid<A>;
        /**
         * Maps a list of values into a list of monoids and combines them
         * @param values 
         */
        foldMap<A>(values: A[]): Monoid<A>;
    }
    interface BoxedRep<Match> { 
        /**
         * Type matches using the variant name.
         * Receives an object where the types are the keys and computations are values
         * @param {Match} patterns
         */
        match(patterns: Match): any; 
    }

    /** Data Types */

    /** Maybe */
    export interface Maybe<A> 
    extends Boxed<A,MaybeCases>, Show,
            Effect<A>, Monad<A>, Monoid<A>, 
            Filterable<A>, Eq<Maybe<A>>, Applicative<A>
    {
        /**
         * If Just, returns application of argument or argument. 
         * If None, returns inner value. 
         */
        onJust: <B>(fn: B | ((x: A) => B)) => B;
        /**
         * If None, returns application of argument or argument. 
         * If Just, returns inner value. 
         */
        onNone: <B>(fn: B | (() => B)) => B;
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

        effect(fn: (x: A) => void): Maybe<A>;
        peak(fn: (x: A) => void): Maybe<A>;

        map<B>(fn: (a: A) => B ): Maybe<B>;
        fmap<B>(fn: (a: A) => B ): Maybe<B>;

        apply<B>(a: Maybe<(a: A) => B>): Maybe<B>;
        applyLeft<B,C>(this: Maybe<(b: B) => C>,ap: Maybe<B>): Maybe<C>;

        chain   <B>(fn: (a: A) => Maybe<B>): Maybe<B>;
        bind    <B>(fn: (a: A) => Maybe<B>): Maybe<B>;
        flatMap <B>(fn: (a: A) => Maybe<B>): Maybe<B>;

        concat(s: Maybe<A>): Maybe<A>;

        empty(): Maybe<A>;

        filter(fn: (a: A) => boolean): Maybe<A>;

        equals(e: Maybe<A>): boolean;
    }

    interface MaybeRep
    extends BoxedRep<MaybeCases>, 
            MonadRep, MonoidRep, EqRep
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
         * If Ok returns Just.
         * If Err returns None.
         */
        fromResult<T>(r: Result<T,any>): Maybe<T>;
        /**
         * Returns true if inner value is considered an empty value.
         * @param x inner value
         */
        isEmpty<T>(x: Maybe<T>): boolean;

        pure<A>(x: A): Maybe<A>;

        empty<A>(): Maybe<A>;
        accumulate<A>(monoids: Maybe<A>[]): Maybe<A>;
        foldMap<A>(values: A[]): Maybe<A>;

        equals<A>(ma: Maybe<A>, mb: Maybe<A>): boolean;
        do<A>(fn: any): Maybe<A>;
    }

    export const Maybe: MaybeRep;

    /** Result */

    export interface Result<A,E> 
    extends Boxed<A | E,ResultCases>, Show,
            Monad<A>, Effect<A>, Filterable<A>,
            Eq<Result<A,E>>, Applicative<A>, Swap<A,E>,
            FunctorError<E>
    {
        /**
         * Returns argument or evaluation of argument if Ok. Inner value otherwise
         * @param fn 
         */
        onOk  <B>(fn: B | ((x: A) => B)): B;
        /**
         * Returns argument or evaluation of argument if Err. Inner value otherwise
         * @param fn 
         */
        onErr <B>(fn: B | ((x: E) => B)): B;
        isOk  (): boolean;
        isErr (): boolean;

        mapError <B>(fn: (b: E) => B): Result<A,B>;
        bimap <B,Z>( fnOk:  (a: A) => B,fnErr: (a: E) => Z ): Result<B,Z>;
        fold  <B,Z>( fnErr: (a: E) => Z,fnOk:  (a: A) => B ): Result<B,Z>;
        swap(): Result<A,E>;

        /**
         * Receives a predicate and returns the filtered structure.
         * If Ok and predicate fails, returns an Err. Nothing otherwise
         * @param pred 
         */
        filter(pred: (a: A) => boolean): Result<A,E>;

        apply <B>(ap: Result<(a: A) => B,E>): Result<B,E>;

        effect (fn: (a: A) => void): Result<A,E>;
        peak   (fn: (a: A) => void): Result<A,E>;

        chain   <B>(fn: (a: A) => Result<B,E>): Result<B,E>;
        bind    <B>(fn: (a: A) => Result<B,E>): Result<B,E>;
        flatMap <B>(fn: (a: A) => Result<B,E>): Result<B,E>;

        equals(b: Result<A,E>): boolean;

        map <B>(fn: (a:A) => B): Result<B,E>;
        fmap<B>(fn: (a:A) => B): Result<B,E>;
    }

    interface ResultRep 
    extends BoxedRep<ResultCases>, MonadRep, EqRep
    {
        Ok <A>(val: A): Result<A,any>;
        Err<E>(err: E): Result<any,E>;
        /**
         * Receives a function. Returns Ok if the function evaluates. Err if it throws.
         * @param fn 
         */
        of<A>(fn: A): Result<A,Error>;
        /**
         * Receives a function. Returns Ok if the function evaluates. Err if it throws.
         * @param fn 
         */
        from<A>(fn: A): Result<A,Error>;
        /**
         * Returns Err if it receives an Error. Ok otherwise.
         * @param val 
         */
        fromError<A>(val: A): Result<A,Error>;
        /**
         * Returns Err if it receives a falsy value. Ok otherwise.
         * @param val 
         */
        fromFalsy<A>(val: A): Result<A,A>;
        /**
         * If predicate evaluates to true returns Ok of second argument. Err otherwise
         * @param x inner value
         */
        fromPredicate<A>(pred: (a: A) => boolean, val?: A ): Result<A,A>;
        /**
         * If Just returns Ok.
         * If None returns Err.
         */
        fromMaybe<A,E>(val: Maybe<A>, onNothing: Extractable<E>): Result<A,E>;
        /**
         * Receives a function. Returns Ok if the function evaluates. Err if it throws.
         * @param fn 
         */
        attempt<A>(fn: (a:any) => A): Result<A,Error>;
        
        pure<A>(x: A): Result<A,any>;

        equals<A,E>(ma: Result<A,E>, mb: Result<A,E>): boolean;
        do<A,B>(fn: any): Result<A,B>;
    }
    export const Result: ResultRep

    /**
     * Monoid of numbers under multiplication
     */
    export interface Mult<A> 
    extends Boxed<A,MultCases>, Show,
            Monoid<A>, Functor<A>, EqRep
    {
        onMult <B>(fn: Extractable1<A,B>): B ;
        onOne  <B>(fn: Extractable1<A,B>): B ;
        isMult (): boolean;
        isOne  (): boolean;

        /**
         * Semigroup combine method. Takes two semigroups and combines them.
         * The combination of a Mult type is multiplication
         * @param x 
         */
        concat(x: Mult<A>): Mult<A>;

        empty(): Mult<A>;
        
        equals(m: Mult<A>): boolean;

        map <B>(fn: (a:A) => B): Mult<B>;
        fmap<B>(fn: (a:A) => B): Mult<B>;
    }

    interface MultRep 
    extends BoxedRep<MultCases>, 
            MonoidRep, EqRep
    {
        Mult(x: number): Mult<number>;
        One(): Mult<number>;
        /**
         * If 1, returns One
         * Otherwise, returns Mult
         * @param {number} x inner value
         */
        of(x: number): Mult<number>;
        /**
         * If 1, returns One
         * Otherwise, returns Mult
         * @param {number} x inner value
         */
        from(x: number): Mult<number>;
        empty(): Mult<number>;
        accumulate<A>(monoids: Mult<A>[]): Mult<A>;
        foldMap<A>(values: A[]): Mult<A>;
        equals(ma: Mult<number>, mb: Mult<number>): boolean;
    }

    export const Mult: MultRep;

    /**
     * Monoid of numbers over addition
     */
    export interface Sum<A> 
    extends Boxed<A,SumCases>, Show,
            Monoid<A>, Functor<A>, Eq<A>
    {
        onSum <B>(fn: Extractable1<A,B>): B ;
        onZero<B>(fn: Extractable1<A,B>): B ;
        isSum (): boolean;
        isZero(): boolean;

        /**
         * Semigroup combine method. Takes two semigroups and combines them.
         * The combination of a Sum type is addition
         * @param x 
         */
        concat(x: Sum<A>): Sum<A>;

        empty(): Sum<A>;

        equals(m: Sum<A>): boolean;

        map <B>(fn: (a:A) => B): Sum<B>;
        fmap<B>(fn: (a:A) => B): Sum<B>;
    }

    interface SumRep 
    extends BoxedRep<SumCases>, 
            MonoidRep, EqRep
    {
        Sum(x: number): Sum<number>;
        Zero(): Sum<number>;
        /**
         * If 0, returns Cero
         * Otherwise, returns Sum
         * @param {number} x inner value
         */
        of(x: number): Sum<number>;
        /**
         * If 0, returns Cero
         * Otherwise, returns Sum
         * @param {number} x inner value
         */
        from(x: number): Sum<number>;
        empty(): Sum<number>;
        accumulate<A>(monoids: Sum<A>[]): Sum<A>;
        foldMap<A>(values: A[]): Sum<A>;
        equals(ma: Sum<number>, mb: Sum<number>): boolean;
    }

    export const Sum: SumRep;

    /**
     * Monoid of objects under the merge operation
     */
    export interface Merge<A> 
    extends Boxed<A,MergeCases>, Show,
            Monoid<A>, Functor<A>, Eq<A>
    {
        onMerge<B>(fn: Extractable1<A,B>): B ;
        onEmpty<B>(fn: Extractable1<A,B>): B ;
        isMerge(): boolean;
        isEmpty(): boolean;

        /**
         * Semigroup combine method. Takes two semigroups and combines them.
         * The combination of a Merge type is the object merge operation
         * @param x 
         */
        concat(x: Merge<A>): Merge<A>;

        empty(): Merge<A>;
        
        equals(m: Merge<A>): boolean;

        map <B>(fn: (a:A) => B): Merge<B>;
        fmap<B>(fn: (a:A) => B): Merge<B>;
    }

    interface MergeRep 
    extends BoxedRep<MergeCases>, 
            MonoidRep, EqRep
    {
        Merge<A>(x: A): Merge<A>;
        Empty<A>(): Merge<A>;
        /**
         * If {}, returns Empty
         * Otherwise, returns Merge
         * @param {number} x inner value
         */
        of<A>(x: A): Merge<A>;
        /**
         * If {}, returns Empty
         * Otherwise, returns Merge
         * @param {number} x inner value
         */
        from<A>(x: A): Merge<A>;
        empty<A>(): Merge<A>;
        accumulate<A>(monoids: Merge<A>[]): Merge<A>;
        foldMap<A>(values: A[]): Merge<A>;
        equals<A>(ma: Merge<A>, mb: Merge<A>): boolean;
    }

    export const Merge: MergeRep;

    export interface Reader<E,A>
    extends Boxed<(a: E) => A,ReaderCases>, Monad<A>, Show
    {
        /**
         * Transforms the received enviroment with `fn`
         * @param fn Function to transform enviroment
         */
        local<B>(fn: (a: E) => B): Reader<B,A>;

        fmap<B>(fn: (a: A) => B): Reader<E,B>;
        map <B>(fn: (a: A) => B): Reader<E,B>;

        apply<B>(m: Reader<E,(a:A) => B>): Reader<E,B>;
        applyLeft<B,C>(this: Reader<E,(b: B) => C>,ap: Reader<E,B>): Reader<E,C>;

        chain   <B>(fn: (a: A) => Reader<E,B>): Reader<E,B>;
        bind    <B>(fn: (a: A) => Reader<E,B>): Reader<E,B>;
        flatMap <B>(fn: (a: A) => Reader<E,B>): Reader<E,B>;
    }

    interface ReaderRep
    extends BoxedRep<ReaderCases>
    {
        /**
         * Constructs a Reader. Expects a function that receives the enviroment
         */
        of:   <E,A>(x: (a: E) => A) => Reader<E,A>;
        /**
         * Constructs a Reader. Expects a function that receives the enviroment
         */
        from:   <E,A>(x: (a: E) => A) => Reader<E,A>;
        Reader: <E,A>(x: (a: E) => A) => Reader<E,A>;
        pure:   <E,A>(x: (a: E) => A) => Reader<E,A>;
        runReader: <E,A>(reader: Reader<E,A>, env: E) => A;
        do<E,A>(fn: any): Reader<E,A>;
        ask<E,A>(): Reader<E,A>
    }
  
    export const Reader: ReaderRep

    export interface Sink<A> 
    extends Boxed<A,SinkCases>, Monad<A>, 
            Monoid<A>, Show
    {
        /**
         * Receives a Monoid to combine later
         */
        tell: (x: A) => Sink<A>;
        /**
         * Receives a value to wrap inside a Monoid to be combined later
         */
        flush: () => Sink<A>;

        apply: <B>(m: Sink<(a: A) => B>) => Sink<B>;
        chain: <B>(fn: (a: A) => Sink<B>) => Sink<B>;
        bind: <B>(fn: (a: A) => Sink<B>) => Sink<B>;
        flatMap: <B>(fn: (a: A) => Sink<B>) => Sink<B>;
        /**
         * Returns Sink of the empty value of the inner Monoid
         */
        empty: <B>() => Sink<B>;
    }

    export interface SinkRep extends
        BoxedRep<SinkCases>, MonadRep
    {
        Sink: <A>(x: A) => Sink<A>,
        pure: <A>(x: A) => Sink<A>,
        empty: <A>(x: A) => Sink<A>,
        /**
         * Runs a sink over a function
         */
        runSink: <A>(fn: Function, sink: Sink<A>) => Sink<A>,
        /**
         * Runs a sink over a list of functions
         */
        runSeq: <A>(fn: Function[], sink: Sink<A>) => Sink<A>,
        /**
         * If Monoid, returns Sink
         * Otherwise, throws an error
         * @param {number} x starting value of the sink
         */
        from: <A>(x: A) => Sink<A>,
        /**
         * If Monoid, returns Sink
         * Otherwise, throws an error
         * @param {number} x starting value of the sink
         */
        of: <A>(x: A) => Sink<A>,
        /**
         * If Monoid, returns Sink
         * Otherwise, throws an error
         * @param {number} x starting value of the sink
         */
        fromMonoid: <A>(x: A) => Sink<A>,
        /**
         * Receives the type representative of a Monoid and returns a sink that, using the empty element as starting value.
         */
        fromType: <A>(t: any) => Sink<A>,
        /**
         * Creates a sink whether the given value is a Monoid or not
         */
        force: <A>(x: A) => Sink<A>,
        sumSink: () => Sink<Sum<number>>,
        multSink: () => Sink<Mult<number>>,
        objectSink: () => Sink<Merge<any>>,
        arraySink: () => Sink<any[]>,
        do<A>(fn: any): Sink<A>;
    }

    export const Sink: SinkRep;
  
    export interface IO<A> 
    extends Boxed<A,IOCases>, Monad<A>
    {
        chain  <B>(fn : (x: A) => IO<B>): IO<B>;
        bind   <B>(fn : (x: A) => IO<B>): IO<B>;
        flatMap<B>(fn : (x: A) => IO<B>): IO<B>;

        apply<B>(ap: IO<(a: A) => B>): IO<B>;
        applyLeft<B,C>(this: IO<(b: B) => C>,ap: IO<B>): IO<C>;

        map <B>(fn: (a:A) => B): IO<B>;
        fmap<B>(fn: (a:A) => B): IO<B>;
    }

    interface IORep 
    extends MonadRep, BoxedRep<IOCases>
    {
        of<A>(fn: Extractable<A>): IO<A>;
        from<A>(fn: Extractable<A>): IO<A>;
        pure<A>(fn: Extractable<A>): IO<A>;
        do<A>(fn: any): IO<A>;
    }

    export const IO: IORep;

    export interface Either<L,R> 
    extends Boxed<L | R, EitherCases>, Monad<R>,
            Swap<L,R>, FunctorError<L>, Show
    {
        onRight: <B>(fn: B | ((x: R) => B)) => B;
        onLeft:  <B>(fn: B | ((x: L) => B)) => B;
        ifRight: <B>(fn: (x: R) => Either<L,B>) => Either<B,R>;
        ifLeft:  <B>(fn: (x: L) => Either<B,R>) => Either<L,B>;
        isRight: () => boolean;
        isLeft: () => boolean;
        /**
         * Swaps context. If `Right a` returns `Left a` and vice versa
         */
        swap: () => Either<L,R>;

        /**
         * If Left, calls the first function with inner value.
         * If Right, calls the second function with inner value.
         */
        fold: <B>(l: (x:L) => B, r:(x: R) => B) => B;

        chain  <B>(fn : (x: R) => Either<L,B>): Either<L,B>;
        bind   <B>(fn : (x: R) => Either<L,B>): Either<L,B>;
        flatMap<B>(fn : (x: R) => Either<L,B>): Either<L,B>;

        apply<B>(ap: Either<any,(a: R) => B>): Either<L,B>;
        applyLeft<B,C>(this: Either<L,(b: B) => C>,ap: Either<L,B>): Either<L,C>;

        map <B>(fn: (a:R) => B): Either<L,B>;
        fmap<B>(fn: (a:R) => B): Either<L,B>;
        /**
         * Alias of `map`
         * @param fn 
         */
        mapRight <B>(fn: (a:R) => B): Either<L,B>;

        mapError<B>(fn: (a: L) => B): Either<B,R>;
        /**
         * Alias of `mapError`
         * @param fn 
         */
        mapLeft<B>(fn: (a: L) => B): Either<B,R>;
    }

    interface EitherRep
    extends BoxedRep<EitherCases>, MonadRep
    {
        Left<L>(l: L): Either<L,any>;
        Right<R>(r: R): Either<any,R>;
        /**
         * Returns Left of `l` if `r` is null or undefined
         * Returns Right of `r` otherwise
         * @param l 
         * @param r 
         */
        of<L,R>(l: L, r: R): Either<L,R>;
        /**
         * Returns Left of `l` if `r` is null or undefined
         * Returns Right of `r` otherwise
         * @param l 
         * @param r 
         */
        from<L,R>(l: L, r: R): Either<L,R>;
        /**
         * Returns Left of `l` if `r` is falsy
         * Returns Right of `r` otherwise
         * @param l 
         * @param r 
         */
        fromFalsy<L,R>(l: L, r: R): Either<L,R>;
        /**
         * Returns Left of `l` if `r` is null or undefined
         * Returns Right of `r` otherwise
         * @param l 
         * @param r 
         */
        fromNullish<L,R>(l: L, r: R): Either<L,R>;
        /**
         * Returns Right of `r` if predicate returns true for `r`
         * Returns Left of `r` otherwise
         * @param l 
         * @param r 
         */
        fromPredicate<R>(pred: (r: R) => boolean , r: R): Either<R,R>;
        /**
         * Right if Just
         * Left if None
         * @param m 
         */
        fromMaybe<A>(m: Maybe<A>): Either<any,A>;
         /**
         * Right if Ok
         * Left if Err
         * @param m 
         */
        fromResult<L,R>(m: Result<R,L>): Either<L,R>;
        /**
         * Curryed version of `Either.of`
         */
        defaultTo<L,R>(l: L): (r: R) => Either<L,R>;
        /**
         * Returns an array with all the Lefts of an array of Eithers
         * @param ls 
         */
        lefts<L,R>(ls: Either<L,R>[]): Either<L,R>;
        /**
         * Returns an array with all the Rights of an array of Eithers
         * @param ls 
         */
        rights<L,R>(rs: Either<L,R>[]): Either<L,R>;
        /**
         * Returns two arrays. The first with all the Lefts and the second with all the Rights
         */
        partition<L,R>(lrs: Either<L,R>[]): [Either<L,R>[],Either<L,R>[]]
        /**
         * Receives an Array of Eithers and returns a Left of the array of values. Only collects values from Lefts.
         * @param lrs Array of Eithers
         */
        collectLefts<L,R>(lrs: Either<L,R>[]): Either<L[],R>;
        /**
         * Receives an Array of Eithers and returns a Right of the array of values. Only collects values from Rights.
         * @param lrs Array of Eithers
         */
        collectRights<L,R>(lrs: Either<L,R>[]): Either<L,R[]>;
        do<A,B>(fn: any): Either<A,B>;
    }

    export const Either: EitherRep;

    /* Standalone utilities */

    /**
     * Type match a value
     * @param {{ match: (cases: any) => any }} value
     * @param {any} cases
     */
    export const match: <A>(value: A, cases: any) => any;
    /**
     * Calls unwrap on the given object
     * @param {{ unwrap: () => any }} x 
     */
    export const unwrap: (x: any) => any;
    /**
     * Returns true if value implements the provided typeclass or typeclass name
     * @param {any} value
     * @param {any} typeclass 
     */
    export const hasInstance: (tc: any | string,val: any) => boolean;
    /**
     * Calls foldMap of the given type
     * @param t Monoid type
     * @param values values to be foldMapped
     */
    export const foldMap: <M extends MonoidRep>(t: M, values: any[]) => any;
    /**
     * Creates a sum type than can be extended using typeclasses provided by this library. For more info lookup API in the docs.
     * @param name Name used for the type
     * @param cases Cases that make up the union. It's an object with functions as values. 
     * @param extensions Typeclasses that modify the prototype of the cases
     */
    export function Union(name: string, cases: any, extensions: Function[]): { constructors: (constructors: any) => any }
    
    export function Applicative(defs: { trivials: string[], identities: string[], overrides?: { apply?: any } }) : (cases: any, globals: any) => void;
    export function Bifunctor(defs: { first: string, second: string, overrides?: { bimap?: any } }) : (cases: any, globals: any) => void;
    export function Effect(defs: { trivials: string[], identities: string[], overrides?: { effect?: any } }) : (cases: any, globals: any) => void;
    export function Eq(defs: { trivials: string[], empties: string[], overrides?: { equals?: any } }) : (cases: any, globals: any) => void;
    export function Filterable(defs: { trivials: string[], identities: string[], overrides?: { filter?: any } }) : (cases: any, globals: any) => void;
    export function Foldable(defs: { overrides: { filter: any } }) : (cases: any) => void;
    export function Functor(defs: { trivials: string[], identities: string[], overrides?: { fmap?: any } }) : (cases: any, globals: any) => void;
    export function FunctorError(defs: { errors: string[], overrides?: { mapError?: any } }) : (cases: any, globals: any) => void;
    export function Monad(defs: { pure: string, trivials: string[], identities: string[], overrides?: { chain?: any } }) : (cases: any, globals: any) => void;
    export function Monoid(defs: { zero: string, trivials: string[], identities: string[], overrides?: { empty?: any, mappend?: any } }) : (cases: any, globals: any) => void;
    export function Semigroup(defs: { trivials: string[], identities: string[], overrides?: { concat?: any } }) : (cases: any, globals: any) => void;
    export function Show(defs: { overrides?: { show?: any } }) : (cases: any, globals: any) => void;
    export function Swap(defs: { left: string, right: string, overrides?: { swap?: any } }) : (cases: any, globals: any) => void;
}