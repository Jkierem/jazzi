import * as O from "../../src/Observable"
import { Succeed, Fail } from "../../src/Async"
import { Spy } from "../utils/spy"

const createMockObservable = <T>(creator: () => O.Observable<T>) => { 
    const nextSpy = Spy()
    const completeSpy = Spy()
    const errorSpy = Spy()
    const observable = creator()
  
    return {
      observable,
      run: () => observable["|>"](O.subscribe({
        next: nextSpy,
        complete: completeSpy,
        error: errorSpy,
      })),
      runWait: () => {
        return new Promise((res) => {
            observable["|>"](O.subscribe({
                next: nextSpy,
                complete() {
                    completeSpy()
                    res(undefined)
                },
                error(e) {
                    errorSpy(e)
                    res(undefined)
                },
            }))
        })
      },
      spies: {
        nextSpy,
        completeSpy,
        errorSpy
      }
    }
}

describe("Observable", () => {
    describe("contract", () => {
        it("should work", () => {
            const obs = O.fromIterable([1,2,3])
            const r = [] as number[]
            const nextSpy = Spy();
            const completeSpy = Spy();
            const errorSpy = Spy();
    
            obs
            ["|>"](O.map(x => x + 1))
            ["|>"](O.chain(x => {
                return O.fromIterable([x,x+1])
            }))
            ["|>"](O.subscribe({
                next: x => {
                    nextSpy(x)
                    r.push(x)
                },
                complete: completeSpy,
                error: errorSpy
            }))
            expect(r).toStrictEqual([1,2,3].map(x => x + 1).flatMap(x => [x, x + 1]))
            expect(errorSpy).not.toHaveBeenCalled()
            expect(completeSpy).toHaveBeenCalledOnce();
            expect(
                nextSpy.findCall(c => c.args[0] === 4)?.calledBefore(completeSpy.calls[0])
            ).toBeTruthy()
        })

        it("should not call next or error if complete is called before", () => {
            const {
              run,
              spies: { nextSpy, errorSpy }
            } = createMockObservable(() => O.from(sub => {
              sub.complete();
              sub.next();
              sub.error();
            }))
      
            run();
      
            expect(nextSpy.called).toBeFalsy();
            expect(errorSpy.called).toBeFalsy();
        })
      
        it("should not call next or complete if error is called before", () => {
            const {
              run,
              spies: { nextSpy, completeSpy }
            } = createMockObservable(() => O.from(sub => {
              sub.error();
              sub.next();
              sub.complete();
            }))
      
            run();
      
            expect(nextSpy.called).toBeFalsy();
            expect(completeSpy.called).toBeFalsy();
        })
      
        it("should not call next if unsubscribe is called before",() => {
            const { run, spies: { nextSpy } } = createMockObservable(() => {
                return O.from(sub => { Promise.resolve().then(sub.next) })
            })
            const unsub = run()
            unsub()
            expect(nextSpy.called).toBeFalsy()
        })
      
        it("should not call error if unsubscribe is called before",() => {
            const { run, spies: { errorSpy } } = createMockObservable(() => {
                return O.from(sub => { Promise.resolve().then(sub.error) })
            })
            const unsub = run()
            unsub()
            expect(errorSpy.called).toBeFalsy()
        })
      
        it("should not call complete if unsubscribe is called before",() => {
            const { run, spies: { completeSpy } } = createMockObservable(() => {
                return O.from(sub => { Promise.resolve().then(sub.complete) })
            })
            const unsub = run()
            unsub()
            expect(completeSpy.called).toBeFalsy()
        })
    })

    describe("constructors", () => {
        describe("once", () => {
            it("should trigger once and complete immediatly", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.once(42));
    
                run();
    
                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveBeenCalledOnce();
            })
        })

        describe("fail", () => {
            it("should trigger error once", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fail(42));
    
                run();
    
                expect(completeSpy).not.toHaveBeenCalled();
                expect(errorSpy).toHaveBeenCalled();
                expect(nextSpy).not.toHaveBeenCalledOnce();
            })
        })

        describe("fromArray", () => {
            it("should trigger once for every element in the array", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromArray([1,2,3,4]));
    
                run();
    
                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveCallCountOf(4);
            })
        })

        describe("fromGenerator", () => {
            it("should trigger for every yield", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromGenerator(function*(){
                    yield 1
                    yield 2
                    yield 3
                }));
    
                run();
    
                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveCallCountOf(3);
            })

            it("should trigger and complete on return", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromGenerator(function* (){
                    return 42
                }));
    
                run();
    
                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveBeenCalledOnce();
                expect(nextSpy).toHaveBeenCalledWith(42);
            })

            it("should trigger error on throw", () => {
                const {
                    run, spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromGenerator(function*(){
                    throw 42
                }));
    
                run();
    
                expect(completeSpy).not.toHaveBeenCalled();
                expect(errorSpy).toHaveBeenCalledOnce();
                expect(errorSpy).toHaveBeenCalledWith(42);
                expect(nextSpy).not.toHaveBeenCalledOnce();
            })
        })

        describe("fromPromise", () => {
            it("should emit and complete on resolve", async () => {
                const {
                    runWait,
                    spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromPromise(() => Promise.resolve(42)));

                await runWait();

                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveBeenCalledOnce();
                expect(nextSpy).toHaveBeenCalledWith(42);
            })

            it("should emit an error on reject", async () => {
                const {
                    runWait,
                    spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromPromise(() => Promise.reject(42)));

                await runWait();

                expect(completeSpy).not.toHaveBeenCalled();
                expect(nextSpy).not.toHaveBeenCalled();
                expect(errorSpy).toHaveBeenCalledOnce();
                expect(errorSpy).toHaveBeenCalledWith(42);
            })
        })

        describe("fromAsync", () => {
            it("should emit and complete on Success", async () => {
                const {
                    runWait,
                    spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromAsync(Succeed(42)));

                await runWait();

                expect(completeSpy).toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();
                expect(nextSpy).toHaveBeenCalledOnce();
                expect(nextSpy).toHaveBeenCalledWith(42);
            })

            it("should emit error on Failure", async () => {
                const {
                    runWait,
                    spies: { completeSpy, errorSpy, nextSpy }
                } = createMockObservable(() => O.fromAsync(Fail(42)));

                await runWait();

                expect(completeSpy).not.toHaveBeenCalled();
                expect(nextSpy).not.toHaveBeenCalled();
                expect(errorSpy).toHaveBeenCalledOnce();
                expect(errorSpy).toHaveBeenCalledWith(42);
            })
        })
    })

    const runOperatorTests = (
        build: (ctor: string, ...args: any[]) => O.Observable<any>,
        call: <A>(obs: O.Observable<A>, str: string, ...args: any[]) => any,
    ) => {
        describe("operators", () => {
            describe("map", () => {
                it("should transform emitted values", () => {
                    const mapSpy = Spy(x => x + 1);
                    const witness = createMockObservable(() => {
                        const observable = build("fromArray", [1,2,3]);
                        return call(observable, "map", mapSpy);
                    })

                    witness.run();

                    const { nextSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(3)
                    expect(mapSpy).toHaveCallCountOf(3);
                    expect(mapSpy.calls.map(x => x.result).every(x => nextSpy.calledWith(x))).toBeTruthy();
                })
            })

            describe("chain", () => {
                it("should flatten a observable of observables", () => {
                    const witness = createMockObservable(() => {
                        const observable = build("fromArray", [1,2,3]);
                        const chainFn = (x: number) => build("fromArray", [x, x+1]);
                        return call(observable, "chain", chainFn);
                    })

                    witness.run();

                    const { nextSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(6);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([1,2,2,3,3,4]);
                })
            })
            
            describe("sequence", () => {
                it("should return a new observable that is the concatenation of emitted values", () => {
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", [1,2,3]);
                        const o2 = build("fromArray", [4,5,6]);
                        return call(o1, "sequence", o2);
                    })

                    witness.run();

                    const { nextSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(6);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([1,2,3,4,5,6]);
                })
            })

            describe("filter", () => {
                it("should only emit on values that return true", () => {
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", [1,2,3,4,5,6]);
                        return call(o1, "filter", (x: number) => x % 2 === 0);
                    })

                    witness.run();

                    const { nextSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(3);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([2,4,6]);
                })
            })

            describe("refine", () => {
                it("should only emit on values that return true", () => {
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", [1,2,3,4,5,6]);
                        return call(o1, "refine", (x: number) => x % 2 === 0);
                    })

                    witness.run();

                    const { nextSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(3);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([2,4,6]);
                })
            })

            describe("reduce", () => {
                it("should collect values with the given function", () => {
                    const data = [1,2,3,4,5,6]
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", data);
                        const o2 = call(o1, "reduce", 0, (a: number, b: number) => a + b);
                        return o2;
                    })

                    witness.run();

                    const { nextSpy, completeSpy } = witness.spies

                    expect(nextSpy).toHaveBeenCalledOnce();
                    expect(nextSpy).toHaveBeenCalledWith(data.reduce((a,b) => a + b, 0))
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })

            describe("collect", () => {
                it("should store all emitted values in an array and emit them", () => {
                    const data = [1,2,3,4,5,6]
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", data);
                        return call(o1, "collect");
                    })

                    witness.run();

                    const { nextSpy, completeSpy } = witness.spies

                    expect(nextSpy).toHaveBeenCalledOnce();
                    expect(nextSpy).toHaveBeenCalledWith(data)
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })

            describe("takeWhile", () => {
                it("should emit values until a value doesn't pass the predicate", () => {
                    const data = [1,2,2,3,4,1,2,3]
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", data);
                        return call(o1, "takeWhile", (x: number) => x !== 4 );
                    })

                    witness.run();

                    const { nextSpy, completeSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(4);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([1,2,2,3])
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })

            describe("takeEvery", () => {
                it("should buffer emitted values in groups on N", () => {
                    const data = [1,2,3,4,5,6,7,8]
                    const witness = createMockObservable(() => {
                        const o1 = build("fromArray", data);
                        return call(o1, "takeEvery", 3);
                    })

                    witness.run();

                    const { nextSpy, completeSpy } = witness.spies

                    expect(nextSpy).toHaveCallCountOf(3);
                    expect(nextSpy.calls.flatMap(c => c.args)).toStrictEqual([[1,2,3], [4,5,6], [7,8]]);
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })

            describe("throttle", () => {
                it("should emit values only if certain time has passed from the previous emitted value", async () => {
                    jest.useFakeTimers();
                    const creator = (observer: O.Observer<any>) => {
                        (async () => {
                            observer.next(1);
                            await jest.advanceTimersByTimeAsync(100);
                            observer.next(2);
                            await jest.advanceTimersByTimeAsync(1000);
                            observer.next(3);
                            observer.complete();
                        })()
                    }

                    const witness = createMockObservable(() => {
                        const o1 = build('from', creator);
                        return call(o1, 'throttle', 1000);
                    })

                    await witness.runWait()

                    const { nextSpy, completeSpy } = witness.spies;
                    console.log(nextSpy.calls)
                    expect(nextSpy).toHaveCallCountOf(2)
                    expect(nextSpy).toHaveBeenCalledWith(1)
                    expect(nextSpy).not.toHaveBeenCalledWith(2)
                    expect(nextSpy).toHaveBeenCalledWith(3)
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })

            describe("debounce", () => {
                it("should only take the last emition in a designated time window", async () => {
                    jest.useFakeTimers();
                    const creator = (observer: O.Observer<any>) => {
                        (async () => {
                            observer.next(1);
                            await jest.advanceTimersByTimeAsync(100);
                            observer.next(2);
                            await jest.advanceTimersByTimeAsync(1000);
                            observer.next(3);
                            observer.next(4);
                            await jest.advanceTimersToNextTimerAsync();
                            observer.complete();
                        })()
                    }

                    const witness = createMockObservable(() => {
                        const o1 = build('from', creator);
                        return call(o1, 'debounce', 1000);
                    })

                    await witness.runWait()

                    const { nextSpy, completeSpy } = witness.spies;
                    console.log(nextSpy.calls)
                    expect(nextSpy).toHaveCallCountOf(2)
                    expect(nextSpy).not.toHaveBeenCalledWith(1)
                    expect(nextSpy).toHaveBeenCalledWith(2)
                    expect(nextSpy).not.toHaveBeenCalledWith(3)
                    expect(nextSpy).toHaveBeenCalledWith(4)
                    expect(completeSpy).toHaveBeenCalledOnce();
                })
            })
        })
    }

    describe("Pipeable", () => {
        runOperatorTests(
            (ctor: string, ...args) => (O as any)[ctor](...args),
            (obs, op, ...args) => obs["|>"]((O as any)[op](...args))
        )
    })


})