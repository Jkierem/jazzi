import * as A from "../../src/Async"
import * as F from "../../src/Async/fluent"
import { Spy } from "../utils/spy"

describe("Async", () => {
    describe("constructors", () => {
        it("Succeed<A> should return Promise<A> on run", async () => {
            const a = await A.Succeed(42)["|>"](A.run)
            expect(a).toBe(42);
        })

        it("require should be identity", async () => {
            const a = await A.require<number>()["|>"](A.provide(42))["|>"](A.run);
            expect(a).toBe(42)
        })
    })

    type Async<R,E,A> = A.Async<R,E,A> | F.Async<R,E,A>

    const sharedTests = (
        buildFailure: <R,E,A>(a: () => E) => Async<R,E,A>,
        buildSuccess: <R,E,A>(a: () => A) => Async<R,E,A>,
        environment: <R>() => Async<R,never,R>,
        call: (what: string, ...args: any[]) => (self: Async<any,any,any>) => any
    ) => {
        describe("map", () => {
            const mapSpy = Spy(x => x + 1)
            const callMap = call("map", mapSpy);
            const callRun = call("run");

            beforeEach(() => { 
                mapSpy.reset()
            })

            it("should map on the success channel", async () => {    
                const s41 = buildSuccess(() => 41)
                const s42 = callMap(s41)

                const result = await callRun(s42);

                expect(result).toBe(42)
                expect(mapSpy).toHaveBeenCalledWith(41);
            })
        })

        describe("mapError", () => {
            const mapSpy = Spy(x => x + 1)
            const callMap = call("mapError", mapSpy);
            const callRun = call("run");

            beforeEach(() => { 
                mapSpy.reset()
            })

            it("should map on the failure channel", async () => {    
                const f41 = buildFailure(() => 41)
                const f42 = callMap(f41)

                const result = callRun(f42);

                await expect(result).rejects.toBe(42)
                expect(mapSpy).toHaveBeenCalledWith(41);
            })
        })

        describe("recover", () => {
            it("should recover with given effect", async () => {
                const f41 = buildFailure(() => 41);
                const s42 = call("recover", (x: number) => buildSuccess(() => x + 1))(f41)

                const result = await call("run")(s42);

                expect(result).toBe(42)
            })

            it("should have access to recovered effect", async () => {
                const f41 = buildFailure(() => 41);
                const s42 = call("recover", (x: number) => buildSuccess(() => x + 1))(f41)
                const s43 = call("map", (x: number) => x + 1)(s42);

                const result = await call("run")(s43);

                expect(result).toBe(43)
            })
        })

        describe("chain", () => {
            const chainSpy = Spy(x => buildSuccess(() => x + 1))
            const callChain = call("chain", chainSpy)
            const callRun = call("run");

            beforeEach(() => { chainSpy.reset() });

            it("should call fn if success", async () => {
                const s41 = buildSuccess(() => 41);
                const s42 = callChain(s41);
                const result = await callRun(s42)

                expect(result).toBe(42)
                expect(chainSpy).toHaveBeenCalledWith(41);
                expect(chainSpy).toHaveBeenCalledOnce();
            })

            it("should not call fn if failure", async () => {
                const f41 = buildFailure(() => 41);
                const failToo = callChain(f41);
                const result = callRun(failToo)

                await expect(result).rejects.toBe(41)
                expect(chainSpy).not.toHaveBeenCalled();
            })
        })

        describe("recurIf", () => {
            it("should recur while effect is success of true", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildSuccess(recurSpy);
                const recurEven = call("recurIf", (x: number) => buildSuccess(() => x === 0))
                const recurring = recurEven(weirdEffect);

                const result = await call("run")(recurring);

                expect(result).toBe(1);
                expect(recurSpy).toHaveCallCountOf(3)
            })

            it("should not recur if failure", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildFailure(recurSpy);
                const recurEven = call("recurIf", (x: number) => buildSuccess(() => x === 0))
                const recurring = recurEven(weirdEffect);

                const result = call("run")(recurring);

                await expect(result).rejects.toBe(0);
                expect(recurSpy).toHaveCallCountOf(1)
            })

            it("should not recur if succeeds to false", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildSuccess(recurSpy);
                const recurEven = call("recurIf", (x: number) => buildSuccess(() => x === 0))
                const recurring = recurEven(weirdEffect);

                const result = await call("run")(recurring);

                expect(result).toBe(1);
                expect(recurSpy).toHaveCallCountOf(3)
            })

            it("should propagate recur condition error", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildSuccess(recurSpy);
                const recurEven = call("recurIf", (x: number) => {
                    if( x === 0 ){
                        return buildSuccess(() => x === 0)
                    }
                    return buildFailure(() => 42)
                })
                const recurring = recurEven(weirdEffect);

                const result = call("run")(recurring);

                await expect(result).rejects.toBe(42);
                expect(recurSpy).toHaveCallCountOf(3)
            })
        })

        describe("recurWhile", () => {
            it("should recur while condition holds for result", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildSuccess(recurSpy);
                const recurEven = call("recurWhile", (x: number) => x === 0)
                const recurring = recurEven(weirdEffect);

                const result = await call("run")(recurring);

                expect(result).toBe(1);
                expect(recurSpy).toHaveCallCountOf(3)
            })

            it("should not recur if failure", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i < 3 ? 0 : 1;
                })

                const weirdEffect = buildFailure(recurSpy);
                const recurEven = call("recurWhile", (x: number) => x === 0)
                const recurring = recurEven(weirdEffect);

                const result = call("run")(recurring);

                await expect(result).rejects.toBe(0);
                expect(recurSpy).toHaveCallCountOf(1)
            })
        })

        describe("recurN", () => {
            it("should recur n times", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i
                })

                const weirdEffect = buildSuccess(recurSpy)
                const recur5times = call("recurN", 5)
                const recurring = recur5times(weirdEffect);

                const result = await call("run")(recurring);

                expect(result).toBe(5);
                expect(recurSpy).toHaveCallCountOf(5)
            })

            it("should not recur if failed", async () => {
                let i = 0;
                const recurSpy = Spy(() => {
                    i++;
                    return i
                })

                const failIfEq3 = call(
                    "chain", 
                    (x: number) => x === 3 
                        ? buildFailure(() => x) 
                        : buildSuccess(() => x)
                )
                
                const weirdEffect = failIfEq3(buildSuccess(recurSpy))
                const recur5times = call("recurN", 5)
                const recurring = recur5times(weirdEffect);

                const result = call("run")(recurring);
                
                await expect(result).rejects.toBe(3)
                expect(recurSpy).toHaveCallCountOf(3)
            })
        })

        describe("zipWith", () => {
            it("should sequence both effects, combining the results using fn", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const s41 = buildSuccess(leftSpy);
                const s42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipWith", s42, <A,B>(a: A, b: B) => [a,b] as [A,B]);

                const stuple = zipWithTuple(s41);

                const result = await call("run")(stuple);

                expect(result).toStrictEqual([41,42]);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
                const leftBeforeRight = leftSpy.getNthCall(0).calledBefore(rightSpy.getNthCall(0));
                expect(leftBeforeRight).toBeTruthy();
            })

            it("should fail if left fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildFailure(leftSpy);
                const right42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipWith", right42, <A,B>(a: A, b: B) => [a,b] as [A,B]);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(41);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).not.toHaveBeenCalled()
            })

            it("should fail if right fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildSuccess(leftSpy);
                const right42 = buildFailure(rightSpy);

                const zipWithTuple = call("zipWith", right42, <A,B>(a: A, b: B) => [a,b] as [A,B]);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(42);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
            })
        })

        describe("zip", () => {
            it("should sequence both effects, keeping both results in a tuple", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const s41 = buildSuccess(leftSpy);
                const s42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zip", s42);

                const stuple = zipWithTuple(s41);

                const result = await call("run")(stuple);

                expect(result).toStrictEqual([41,42]);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
                const leftBeforeRight = leftSpy.getNthCall(0).calledBefore(rightSpy.getNthCall(0));
                expect(leftBeforeRight).toBeTruthy();
            })

            it("should fail if left fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildFailure(leftSpy);
                const right42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zip", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(41);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).not.toHaveBeenCalled()
            })

            it("should fail if right fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildSuccess(leftSpy);
                const right42 = buildFailure(rightSpy);

                const zipWithTuple = call("zip", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(42);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
            })
        })

        describe("zipLeft", () => {
            it("should sequence both effects, keeping only the left result", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const s41 = buildSuccess(leftSpy);
                const s42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipLeft", s42);

                const stuple = zipWithTuple(s41);

                const result = await call("run")(stuple);

                expect(result).toStrictEqual(41);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
                const leftBeforeRight = leftSpy.getNthCall(0).calledBefore(rightSpy.getNthCall(0));
                expect(leftBeforeRight).toBeTruthy();
            })

            it("should fail if left fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildFailure(leftSpy);
                const right42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipLeft", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(41);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).not.toHaveBeenCalled()
            })

            it("should fail if right fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildSuccess(leftSpy);
                const right42 = buildFailure(rightSpy);

                const zipWithTuple = call("zipLeft", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(42);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
            })
        })

        describe("zipRight", () => {
            it("should sequence both effects, keeping only the right result", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const s41 = buildSuccess(leftSpy);
                const s42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipRight", s42);

                const stuple = zipWithTuple(s41);

                const result = await call("run")(stuple);

                expect(result).toStrictEqual(42);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
                const leftBeforeRight = leftSpy.getNthCall(0).calledBefore(rightSpy.getNthCall(0));
                expect(leftBeforeRight).toBeTruthy();
            })

            it("should fail if left fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildFailure(leftSpy);
                const right42 = buildSuccess(rightSpy);

                const zipWithTuple = call("zipRight", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(41);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).not.toHaveBeenCalled()
            })

            it("should fail if right fails", async () => {
                const leftSpy = Spy(() => 41)
                const rightSpy = Spy(() => 42)

                const left41 = buildSuccess(leftSpy);
                const right42 = buildFailure(rightSpy);

                const zipWithTuple = call("zipRight", right42);

                const stuple = zipWithTuple(left41);

                const result = call("run")(stuple);

                await expect(result).rejects.toStrictEqual(42);
                expect(leftSpy).toHaveBeenCalledOnce()
                expect(rightSpy).toHaveBeenCalledOnce()
            })
        })

        describe("bind", () => {
            it("should bind effects to keys", async () => {
                const bound = buildSuccess(() => ({}))

                const bind1 = call("bind", "a", () => buildSuccess(() => 1))
                const bind2 = call("bind", "b", () => buildSuccess(() => 2))
                const bind3 = call("bind", "c", ({ a }: { a: number }) => buildSuccess(() => a + 2))

                const result = await call("run")(bind3(bind2(bind1(bound))))

                expect(result).toStrictEqual({ a: 1, b: 2, c: 3 })
            })
        })

        describe("provideTo", () => {
            it("should provide a different effect using this effect", async () => {
                const provisioner = buildSuccess(() => 41)
                const provisioned = environment<number>()

                const effect = call("map", (x: number) => x + 1)(call("provideTo", provisioned)(provisioner))

                const result = await call("run")(effect)

                expect(result).toBe(42)
            })
        })

        describe("swap", () => {
            it("should change success to fail", async () => {
                const s42 = buildSuccess(() => 42)

                const result = call("run")(call("swap")(s42));

                await expect(result).rejects.toBe(42);
            })

            it("should change fail to success", async () => {
                const f42 = buildFailure(() => 42)

                const result = call("run")(call("swap")(f42));

                await expect(result).resolves.toBe(42);
            })
        })

        describe("ignore", () => {
            it("should ignore success", async () => {
                const s42 = buildSuccess(() => 42)

                const result = call("run")(call("ignore")(s42));

                await expect(result).resolves.toBeUndefined();
            })

            it("should ignore failures", async () => {
                const f42 = buildFailure(() => 42)

                const result = call("run")(call("ignore")(f42));

                await expect(result).resolves.toBeUndefined();
            })
        })
    }

    describe("Pipeable", () => {
        sharedTests(
            A.failWith as any,
            A.succeedWith as any,
            <R>() => A.require<R>(),
            (op: string, ...args: any[]) => (self: any) => {
                if( args.length === 0 ){
                    return self['|>']((A as any)[op]);
                }
                if( op === "zipWith" ){
                    const [m, fn] = args
                    return self['|>'](A.zipWith(fn)(m))
                }
                return self['|>']((A as any)[op](...args))
            }
        )
    })

    describe("Fluent", () => {
        sharedTests(
            F.failWith as any,
            F.succeedWith as any,
            <R>() => F.require<R>(),
            (op: string, ...args: any[]) => (self: any) => self[op](...args)
        )
    })
})