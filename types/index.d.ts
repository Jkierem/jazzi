declare module "@juan-utils/ramda-structures" {
    
    type Placeholder = import("ramda").Placeholder;
    type Extractable<A> = A | (() => A)

    type CaseUnion<K> = K | "default" | "_";
    type Cases<K extends string | number | symbol> = {
        [P in CaseUnion<K>]?: Extractable<any>;
    }

    type MaybeCases = Cases<"Just" | "None">
    export interface None {
        match: (a: MaybeCases) => any;
        unwrap: () => any;
        get: () => undefined;
        map: (fn: (a: any) => any) => Maybe<any>;
        fmap: (fn: (a: any) => any) => Maybe<any>;
        effect: (fn: (a: any) => any) => Maybe<any>;
        peak: (fn: (a: any) => any) => Maybe<any>;
        chain: (fn: (a: any) => Maybe<any>) => Maybe<any>;
        bind: (fn: (a: any) => Maybe<any>) => Maybe<any>;
        flatMap: (fn: (a: any) => Maybe<any>) => Maybe<any>;
        pure: <T>(x: T) => Maybe<T>;
        apply: (m: Maybe<any>) => Maybe<any>;
        concat: (m: Maybe<any>) => Maybe<any>;
        mappend: (m: Maybe<any>) => Maybe<any>;
        append: (m: Maybe<any>) => Maybe<any>;
        filter: (fn: (a: any) => boolean) => Maybe<any>;
        equals: (b: any) => boolean;
        onJust: (fn: any) => any;
        onNone: (fn: any) => any;
        isJust: () => boolean;
        isNone: () => boolean;
        empty: () => None;
        show: () => string;
        toString: () => string;
    }
    
    export interface Just<A> {
        match: (a: MaybeCases) => any;
        unwrap: () => any;
        get: () => A;
        map: <B>(fn: (a:A) => B) => Just<B>;
        fmap: <B>(fn: (a:A) => B) => Just<B>;
        effect: (fn: (a: any) => any) => Maybe<A>;
        peak: (fn: (a: any) => any) => Maybe<A>;
        chain: <B>(fn: (a:A) => Maybe<B>) => Maybe<B>;
        bind: <B>(fn: (a:A) => Maybe<B>) => Maybe<B>;
        flatMap: <B>(fn: (a:A) => Maybe<B>) => Maybe<B>;
        pure: <T>(x: T) => Maybe<T>;
        apply: (m: Maybe<any>) => Maybe<any>;
        concat: (m: Maybe<any>) => Maybe<any>;
        mappend: (m: Maybe<any>) => Maybe<any>;
        append: (m: Maybe<any>) => Maybe<any>;
        filter: (fn: (a: A) => boolean) => Maybe<any>;
        equals: (b: any) => boolean;
        onJust: (fn: any) => any;
        onNone: (fn: any) => any;
        isJust: () => boolean;
        isNone: () => boolean;
        empty: () => None;
        show: () => string;
        toString: () => string;
    }

    export type Maybe<T> = Just<T> | None;
    export const Maybe: {
        Just: <T>(val: T) => Just<T>;
        None: () => None;
        pure: <T>(x: T) => Maybe<T>;
        from: <T>(x: T) => Maybe<T>;
        fromFalsy: <T>(x: T) => Maybe<T>;
        fromArray: <T>(x: T[]) => Maybe<T[]>;
        fromNullish: <T>(x: T) => Maybe<T>;
        fromEmpty: <T>(x: T) => Maybe<T>;
        fromPredicate: <A>(pred: (a: A) => boolean, val?: A ) => Maybe<A>;
        fromResult: <T>(r: Result<T,any>) => Maybe<T>;
        isEmpty: <T>(x: Maybe<T>) => boolean;
        match: (...a: readonly any[]) => any;
        equals: {
            <T>(__: Placeholder, b: T): (a: T) => boolean;
            <T>(a: T, b: T): boolean;
            <T>(a: T): (b: T) => boolean;
        }
    };

    type ResultCases = Cases<"Ok"|"Err">;

    export interface Ok<A> {
        match: (cases: ResultCases) => any;
        unwrap: () => any;
        get: () => A;
        map: <B>(fn: (a:A) => B) => Result<B,any>;
        fmap: <B>(fn: (a:A) => B) => Result<B,any>;
        mapError: (fn: (b:any) => any) => Result<any,any>;
        bimap: (fnOk: (a:any) => any,fnErr: (a:any) => any) => Result<any,any>;
        filter: (fn: (a: any) => boolean) => Result<any,any>;
        fold: (fnErr: (a:any) => any,fnOk: (a:any) => any) => Result<any,any>;
        swap: () => Result<any,any>;
        apply: (r: Result<any,any>) => Result<any,any>;
        effect: (fn: (a: any) => any) => Result<A,any>;
        peak: (fn: (a: any) => any) => Result<A,any>;
        chain: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        bind: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        flatMap: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        pure: <B,C>(x: B | C) => Result<B,C>
        equals: (b: any) => boolean;
        onOk: (fn: any) => any;
        onErr: (fn: any) => any;
        isOk: () => boolean;
        isErr: () => boolean;
        show: () => string;
        toString: () => string;
    }

    export interface Err<A> {
        match: (cases: ResultCases) => any;
        unwrap: () => any;
        get: () => A;
        map: <B>(fn: (a:A) => B) => Result<B,any>;
        fmap: <B>(fn: (a:A) => B) => Result<B,any>;
        mapError: (fn: (b:any) => any) => Result<any,any>;
        bimap: (fnOk: (a:any) => any,fnErr: (a:any) => any) => Result<any,any>;
        filter: (fn: (a: any) => boolean) => Result<any,any>;
        fold: (fnErr: (a:any) => any,fnOk: (a:any) => any) => Result<any,any>;
        swap: () => Result<any,any>;
        apply: (r: Result<any,any>) => Result<any,any>;
        effect: (fn: (a: any) => any) => Result<A,any>;
        peak: (fn: (a: any) => any) => Result<A,any>;
        chain: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        bind: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        flatMap: <B,C>(fn: (a:A) => Result<B,C>) => Result<B,C>;
        pure: <B,C>(x: B | C) => Result<B,C>
        equals: (b: any) => boolean;
        onOk: (fn: any) => any;
        onErr: (fn: any) => any;
        isOk: () => boolean;
        isErr: () => boolean;
        show: () => string;
        toString: () => string;
    }

    export type Result<A,B> = Ok<A> | Err<B>;

    export const Result: {
        Ok: <A>(val: A) => Ok<A>;
        Err: <A>(err: A) => Err<A>;
        from: <A>(val: A) => Result<A,Error>;
        fromError: <A>(val: A) => Result<A,Error>;
        fromFalsy: <A>(val: A) => Result<A,A>;
        fromPredicate: <A>(pred: (a: A) => boolean, val?: A ) => Result<A,A>;
        fromMaybe: <A>(val: Maybe<A>,onNothing: any) => Result<A,undefined>;
        attempt: <A>(fn: (a:any) => A) => Result<A,Error>;
        match: <A,B>(cases: ResultCases) => Result<A,B>;
        equals: {
            <T>(__: Placeholder, b: T): (a: T) => boolean;
            <T>(a: T, b: T): boolean;
            <T>(a: T): (b: T) => boolean;
        };
    }

    type MultCases = Cases<"Mult" | "One">
    export interface Mult {
        unwrap: () => number;
        get: () => number;
        match: (patterns: MultCases) => any;
        onMult: (fn: Extractable<any>) => any;
        onOne: (fn: Extractable<any>) => any;
        isMult: () => boolean;
        isOne: () => boolean;
        chain: (fn : (x: number) => Mult) => MultMonoid;
        bind: (fn : (x: number) => Mult) => MultMonoid;
        flatMap: (fn : (x: number) => Mult) => MultMonoid;
        pure: (x: number) => Mult;
        concat: (x: MultMonoid) => MultMonoid;
        mappend: (x: MultMonoid) => MultMonoid;
        append: (x: MultMonoid) => MultMonoid;
        empty: () => One;
        isEmpty: () => boolean;
        equals: (m: MultMonoid) => boolean;
    }

    export interface One {
        unwrap: () => number;
        get: () => number;
        match: (patterns: MultCases) => any;
        onMult: (fn: Extractable<any>) => any;
        onOne: (fn: Extractable<any>) => any;
        isMult: () => boolean;
        isOne: () => boolean;
        chain: (fn : (x: number) => Mult) => MultMonoid;
        bind: (fn : (x: number) => Mult) => MultMonoid;
        flatMap: (fn : (x: number) => Mult) => MultMonoid;
        pure: (x: number) => Mult;
        concat: (x: MultMonoid) => MultMonoid;
        mappend: (x: MultMonoid) => MultMonoid;
        append: (x: MultMonoid) => MultMonoid;
        empty: () => One;
        isEmpty: () => boolean;
        equals: (m: MultMonoid) => boolean;
    }

    export type MultMonoid = Mult | One;
    export const Mult: {
        from: (x: number) => Mult | One;
        Mult: (x: number) => Mult,
        One: () => One,
        pure: (x: number) => Mult,
        empty: () => One,
    }
    
    type SumCases = Cases<"Sum" | "Zero">
    export interface Sum {
        unwrap: () => number;
        get: () => number;
        match: (patterns: SumCases) => any;
        onMult: (fn: Extractable<any>) => any;
        onOne: (fn: Extractable<any>) => any;
        isMult: () => boolean;
        isOne: () => boolean;
        chain: (fn : (x: number) => Sum) => SumMonoid;
        bind: (fn : (x: number) => Sum) => SumMonoid;
        flatMap: (fn : (x: number) => Sum) => SumMonoid;
        pure: (x: number) => Sum;
        concat: (x: SumMonoid) => SumMonoid;
        mappend: (x: SumMonoid) => SumMonoid;
        append: (x: SumMonoid) => SumMonoid;
        empty: () => Zero;
        isEmpty: () => boolean;
        equals: (m: SumMonoid) => boolean;
    }

    export interface Zero {
        unwrap: () => number;
        get: () => number;
        match: (patterns: SumCases) => any;
        onMult: (fn: Extractable<any>) => any;
        onOne: (fn: Extractable<any>) => any;
        isMult: () => boolean;
        isOne: () => boolean;
        chain: (fn : (x: number) => Sum) => SumMonoid;
        bind: (fn : (x: number) => Sum) => SumMonoid;
        flatMap: (fn : (x: number) => Sum) => SumMonoid;
        pure: (x: number) => Sum;
        concat: (x: SumMonoid) => SumMonoid;
        mappend: (x: SumMonoid) => SumMonoid;
        append: (x: SumMonoid) => SumMonoid;
        empty: () => Zero;
        isEmpty: () => boolean;
        equals: (m: SumMonoid) => boolean;
    }

    export type SumMonoid = Sum | Zero;
    export const Sum: {
        from: (x: number) => Sum | Zero;
        Sum: (x: number) => Sum,
        Zero: () => Zero,
        pure: (x: number) => Sum,
        empty: () => Zero,
    }
    
    type ReaderCases = Cases<"Reader">
    export interface Reader<A>{
        unwrap: () => any;
        get: () => A;
        match: (patterns: ReaderCases) => any;
        onReader: <B>(fn: Extractable<B>) => B;
        isReader: () => boolean;
        fmap: <B>(fn: (a: A) => B) => Reader<B>;
        map: <B>(fn: (a: A) => B) => Reader<B>;
        chain: <B>(fn: (a: A) => Reader<B>) => Reader<B>;
        bind: <B>(fn: (a: A) => Reader<B>) => Reader<B>;
        flatMap: <B>(fn: (a: A) => Reader<B>) => Reader<B>;
        pure: <B>(x: B) => Reader<B>;
        ask: <B>(fn: (a: A) => B) => B;
        local: <B>(fn: (a: A) => B) => Reader<B>;
        show: () => string;
        toString: () => string;
    }

    export const Reader: {
        from: <A>(x: A) => Reader<A>,
        Reader: <A>(x: A) => Reader<A>,
        pure: <A>(x: A) => Reader<A>,
        runReader: <A>(fn: Function, reader: Reader<A>) => Reader<A>,
    };
  
    type WriterCases = Cases<"Writer">
    export interface Writer<A> {
        unwrap: () => any;
        get: () => A;
        match: (patterns: WriterCases) => any;
        onWriter: <B>(fn: Extractable<B>) => B;
        isWriter: () => boolean,
        chain: <B>(fn: (a: A) => Writer<B>) => Writer<B>;
        bind: <B>(fn: (a: A) => Writer<B>) => Writer<B>;
        flatMap: <B>(fn: (a: A) => Writer<B>) => Writer<B>;
        pure: <B>(x: B) => Writer<B>;
        mappend: (m: Writer<A>) => Writer<A>;
        append: (m: Writer<A>) => Writer<A>;
        empty: <B>() => Writer<B>;
        isEmpty: () => boolean;
        tell: (x: A) => Writer<A>;
        forward: (x: any) => Writer<A>;
        flush: () => Writer<A>;
        show: () => string;
        toString: () => string;
    }

    export const Writer: {
        Writer: <A>(x: A) => Writer<A>,
        pure: <A>(x: A) => Writer<A>,
        empty: <A>(x: A) => Writer<A>,
        runWriter: <A>(fn: Function, reader: Writer<A>) => Writer<A>,
        runSeq: <A>(fn: Function[], reader: Reader<A>) => Reader<A>,
        from: <A>(x: A) => Writer<A>,
        sumSink: () => Writer<Sum>,
        multSink: () => Writer<Mult>,
        arraySink: () => Writer<any[]>
    }
  
}