import * as O undefined
const ClosedOps = [
    "map", "chain", "sequence", "filter",
    "reduce", "collect", "takeWhile", "bufferEvery",
    "takeFirst", "throttle", "debounce", "withScheduler"
]

const OpenOps = [
    'unwrap', 'subscribe'
]

const Operators = [
    ...ClosedOps,
    ...OpenOps
]
            
export interface Observable<A> {
    map<B>(fn: (a: A) => B): Observable<B>;
    chain<B>(fn: (a: A) => B): Observable<B>;
    sequence<B>(other: Observable<B>): Observable<A | B>;
    filter(fn: (a: A) => boolean): Observable<A>;
    filter<B extends A>(fn: (a: A) => a is B): Observable<B>;
    reduce<B>(init: B, iteratee: (b: B, a: A) => B): Observable<B>;
    collect(): Observable<A[]>;
    takeWhile(predicate: (a: A) => boolean): Observable<A>;
    bufferEvery(n: number): Observable<A[]>;
    takeFirst(n: number): Observable<A[]>;
    throttle(milliseconds: number): Observable<A>;
    debounce(milliseconds: number): Observable<A>;
    withScheduler(scheduler: O.Scheduler): Observable<A>;

    subscribe(sub: O.Subscriber<A>): O.Unsubscribe;
    unwrap(): O.Observable<A>;
}

const fluent = <A>(obs: O.Observable<A>): Observable<A> => {
    const proxy = new Proxy(obs as unknown as Observable<A>, {
        get<P extends keyof Observable<A>>(target: any, p: P){
            if( typeof p === "symbol" ){
                if( p === Symbol.toPrimitive ){
                    return target
                }
                return target[p];
            }
            if( Operators.includes(p) ){
                if( p === "unwrap" ){
                    return () => target;
                }
                if( p === "chain" ){
                    return (fn: (a: any) => Observable<any>) => {
                        return fluent(target['|>'](O.chain(a => fn(a).unwrap())))
                    }
                }
                if( p === "sequence" ){
                    return (other: Observable<any>) => fluent(target['|>'](O.sequence(other.unwrap())))
                }
                if( ClosedOps.includes(p) ){
                    return (...args: any[]) => {
                        return fluent(target['|>']((O as any)[p](...args)))
                    }
                }
                if( OpenOps.includes(p) ){
                    return (...args: any[]) => target['|>']((O as any)[p](...args));
                }
            }
        }
    });

    return proxy;
}

export const wrap = <A>(obs: O.Observable<A>) => fluent(obs);

export const from = <A>(fn: O.Producer<A>) => {
    return fluent(O.from(fn));
}

export const once = <A>(a: A): Observable<A> => {
    return fluent(O.once(a));
}

export const fail = <A>(a: A): Observable<void> => {
    return fluent(O.fail(a));
}

export const fromArray = <A>(arr: A[]): Observable<A> => {
    return fluent(O.fromArray(arr));
}

export const fromIterable = <A>(it: Iterable<A>): Observable<A> => {
    return fluent(O.fromIterable(it));
}

export const fromGenerator = <A>(gen: () => Generator<A>) => {
    return fluent(O.fromGenerator(gen));
}

export const fromPromise = <A>(lazy: () => Promise<A>) => {
    return fluent(O.fromPromise(lazy));
}

export const fromEvent = <Event>(target: O.EventTarget<Event>, eventName: string) => {
    return fluent(O.fromEvent(target, eventName));
}

export const fromInterval = (milliseconds: number = 0, global = globalThis) => {
    return fluent(O.fromInterval(milliseconds, global));
}

export const fromTimeout = (milliseconds: number = 0, global = globalThis) => {
    return fluent(O.fromTimeout(milliseconds, global));
}
