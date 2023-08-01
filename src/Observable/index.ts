import * as T from "../Async/index"
import { baseObject } from "../_internals"
import * as S from "../_internals/symbols"
import { Pipeable } from "../_internals/types"

export interface EventTarget<Event> {
    addEventListener(eventName: string, handler: (event: Event) => void): void,
    removeEventListener(eventName: string, handler: (event: Event) => void): void,
}

export interface Observer<A> {
    next: (a: A) => void,
    error: (e?: any) => void,
    complete: () => void
}

export interface Unsubscribe {
    (): void,
}

export type Producer<A> = (obs: Observer<A>) => Unsubscribe | void

type StrictProducer<A> = (obs: Observer<A>) => Unsubscribe

export interface Scheduler {
    runTask: (task: () => void) => void
}

const ObservableT: unique symbol = Symbol("Observable")

type Base<A> = {
    [S.Type]     : typeof ObservableT
    [S.Variant]  : "Observable"
    [S.Producer] : StrictProducer<A>
    [S.Scheduler]: Scheduler
} & Pipeable

export interface Observable<A> extends Base<A> {}

const makeScheduler = (runTask: (fn: () => void) => void) => ({ runTask } as Scheduler)

export const Schedulers = {
    sync: makeScheduler((fn) => fn()),
    async: makeScheduler((fn) => setTimeout(() => fn(), 0)),
    asap: makeScheduler((fn) => Promise.resolve().then(fn)),
    micro: makeScheduler((fn) => queueMicrotask(() => fn()))
}

const build = <A>(producer: Producer<A>) => {
    const base = baseObject({})
    const typ = S.setType(ObservableT);
    const van = S.setVariant("Observable");
    const pro = S.setProducer((obs: Observer<A>) => producer(obs) ?? (() => {}));
    const sch = S.setScheduler(Schedulers.sync);
    return base
        ["|>"](typ)
        ["|>"](van)
        ["|>"](pro)
        ["|>"](sch) as Observable<A>;
}

const copy = <A>(self: Observable<A>) => {
    const base = baseObject({});
    const typ = S.setType(ObservableT);
    const van = S.setVariant("Observable");
    const env = S.setProducer(S.getProducer(self));
    const sch = S.setScheduler({ ...S.getScheduler(self) });
    return base
        ["|>"](typ)
        ["|>"](van)
        ["|>"](env)
        ["|>"](sch) as Observable<A>;
}

/** Constructors */

export const from = <A=void>(fn: Producer<A>) => build(fn);

export const once = <A>(a: A) => from<A>((obs) => {
    obs.next(a);
    obs.complete();
})

export const fail = <A>(a: A) => from((obs) => { obs.error(a) })

export const fromArray = <A>(arr: A[]) => fromIterable(arr);

export const fromIterable = <A>(it: Iterable<A>) => {
    return from<A>((obs) => {
        try {
            const a = it[Symbol.iterator]()
            let curr = a.next();
            while( !curr.done ){
                obs.next(curr.value);
                curr = a.next();
            }
            if( curr.value ){
                obs.next(curr.value);
            }
            obs.complete()
        } catch(e){
            obs.error(e)
        }
    })
}

export const fromGenerator = <A>(gen: () => Generator<A>) => {
    return fromIterable(gen());
}

export const fromPromise = <A>(prom: () => Promise<A>) => {
    return from<A>((observer) => {
        prom()
        .then(observer.next, observer.error)
        .then(observer.complete);
    })
}

export const fromAsync = <E,A>(effect: T.Async<unknown, E, A>) => {
    return fromPromise(() => effect["|>"](T.run));
}

export const fromEvent = <Event>(target: EventTarget<Event>, eventName: string) => {
    return from<Event>((observer) => {
        const handler = (e: Event) => observer.next(e);
        target.addEventListener(eventName, handler);
        return () => target.removeEventListener(eventName, handler);
    })
}

export const fromInterval = (milliseconds: number = 0, global = globalThis) => {
    return from((obs) => {
        const id = global.setInterval(() => obs.next(), milliseconds);
        return () => global.clearInterval(id);
    })
}

export const fromTimeout = (milliseconds: number = 0, global = globalThis) => {
    return from((obs) => {
        const id = global.setTimeout(() => obs.next(), milliseconds);
        return () => global.clearTimeout(id);
    }) 
}

/** Operators */

export const map = <A,B>(fn: (a: A) => B) => (self: Observable<A>) => {
    return from<B>((observer) => {
        self["|>"](subscribe({
            next: (a) => observer.next(fn(a)),
            error: (e) => observer.error(e),
            complete: () => observer.complete()
        }))
    })
}

export const chain = <A,B>(fn: (a: A) => Observable<B>) => (self: Observable<A>) => {
    return from<B>((observer) => {
        let subscriptions: Unsubscribe[] = [];
        const outer = self["|>"](subscribe({
            next: (a) => {
                const unsub = fn(a)["|>"](subscribe({ next: observer.next }));
                if( unsub ){
                    subscriptions.push(unsub)
                }
            },
            error: (e) => observer.error(e),
            complete: () => observer.complete()
        }))
        subscriptions.push(outer)
        return () => subscriptions.forEach(fn => fn());
    }) 
}

export const sequence = <B>(other: Observable<B>) => <A>(self: Observable<A>) => {
    return from<A | B>((observer) => {
        let unsub2 = () => {}
        const unsub1 = self["|>"](subscribe({
            ...observer,
            complete: () => {
                unsub2 = other["|>"](subscribe(observer))
            }
        }))
        return () => {
            unsub1()
            unsub2()
        }
    })
}

export const filter = <A>(predicate: (a: A) => boolean) => (self: Observable<A>) => {
    return from<A>((observer) => {
        return self["|>"](subscribe({
            ...observer,
            next: a => predicate(a) && observer.next(a)
        }))
    })
}

export const refine = <A, B extends A>(predicate: (a: A) => a is B) => (self: Observable<A>) => {
    return self["|>"](filter(predicate)) as Observable<B>
}

export const reduce = <A,B>(init: A, iteratee: (a: A, b: B) => A) => (self: Observable<B>) => {
    return from<A>((observer) => {
        let accumulator = init;
        return self["|>"](subscribe({
            next(a) {
                accumulator = iteratee(accumulator, a);
            },
            complete() {
                observer.next(accumulator)
                observer.complete()
            },
            error: observer.error
        }))
    })
}

export const collect = () => <A>(self: Observable<A>) => {
    return self["|>"](reduce([] as A[], (acc, next) => [...acc, next]))
}

export const takeWhile = <A>(pred: (a: A) => boolean) => (self: Observable<A>) => {
    return from<A>((obs) => {
        let condition = true;
        const unsub = self["|>"](subscribe({
            ...obs,
            next(a) {
                condition = condition && pred(a);
                if( condition ){
                    obs.next(a)
                } else {
                    obs.complete()
                    unsub()
                }
            },
        }))
        return unsub;
    })
}

export const takeEvery = (n: number) => <A>(self: Observable<A>) => {
    return from<A[]>((observer) => {
        let buffer: A[] = [];
        return self["|>"](subscribe({
            ...observer,
            next(a) {
                buffer.push(a);
                if( buffer.length === n ){
                    observer.next(buffer)
                    buffer = []
                }
            },
            complete(){
                if( buffer.length ){
                    observer.next(buffer)
                }
                observer.complete()
            }
        }))
    })
}

export const throttle = (milliseconds: number, global=globalThis) => <A>(self: Observable<A>) => {
    return from<A>((obs) => {
        let blocked = false
        let timeoutId = -1
        const clear = () => timeoutId !== -1 && global.clearTimeout(timeoutId as any)
        const unsub = self["|>"](subscribe({
            ...obs,
            complete(){
                clear()
                obs.complete();
            },
            next(a) {
                if( !blocked ){
                    obs.next(a)
                    blocked = true;
                    timeoutId = global.setTimeout(
                        () => { blocked = false }, 
                        milliseconds
                    ) as unknown as number
                }
            },
        }))
        return () => {
            clear()
            unsub()
        }
    })
}

export const debounce = (milliseconds: number, global=globalThis) => <A>(self: Observable<A>) => {
    return from<A>((observer) => {
        let timeoutId = -1;
        const clear = () => timeoutId !== -1 && global.clearTimeout(timeoutId as any)
        const unsub = self["|>"](subscribe({
            ...observer,
            complete(){
                clear()
                observer.complete();
            },
            next(a) {
                clear();
                timeoutId = global.setTimeout(
                    () => observer.next(a), 
                    milliseconds
                ) as unknown as number;
            },
        }))
        return () => {
            clear();
            unsub();
        }
    })
}

export const withScheduler = (sch: Scheduler) => <A>(self: Observable<A>) => {
    return copy(self)["|>"](S.setScheduler(sch))
}

type Subscriber<A> = {
    next: (a: A) => void,
    error?: (e: unknown) => void,
    complete?: () => void
}

export const subscribe = <A>(obs: Subscriber<A>) => (self: Observable<A>) => {
    const baseProducer = S.getProducer(self);
    const scheduler = S.getScheduler(self);
    let running = true
    const observer = {
        next: (a: A) => {
            if( running ){
                scheduler.runTask(() => obs.next(a))
            }
        },
        error: (e: unknown) => {
            if( running ){
                scheduler.runTask(() => {
                    running = false;
                    obs.error?.(e)
                })
            }
        },
        complete: () => {
            if( running ){
                scheduler.runTask(() => {
                    running = false;
                    obs.complete?.()
                })
            }
        }
    };

    const cleanup = baseProducer(observer)
    const unsubscribe = () => {
        running = false;
        cleanup()
    };
    return unsubscribe;
}