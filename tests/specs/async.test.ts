import Async from "../../src/Async"
import Either from "../../src/Either"
import Maybe from "../../src/Maybe"
import { Spy } from "../utils/spy"

type DirectSuccessConst =
    | "pure"
    | "of"
    | "from"
    | "fromPromise"
    | "fromCallback"
    | "unit"

type SuccessConstTest = [DirectSuccessConst, string, any, any]

const successConstTestData: SuccessConstTest[] = [
    ["pure"        , "number"        , 42                       , 42],
    ["pure"        , "function"      , () => 42                 , 42],
    ["of"          , "function"      , () => 42                 , 42],
    ["from"        , "async function", () => Promise.resolve(42), 42],
    ["fromPromise" , "promise"       , Promise.resolve(42)      , 42],
    ["fromCallback", "callback based async function", (res: any) => setTimeout(() => res(42),0), 42],
    ["unit"        , "nothing"       , undefined                , undefined],
]

describe("Async", () => {
    describe("Constructors", () => {
        successConstTestData
        .forEach(([constructor, valueType, value, result]) => {
            it(`${constructor} should return a Success given a ${valueType}`, async () => {
                const asyncValue = (Async[constructor] as any)(value)
                expect(asyncValue).toTypeMatch("Success")
                await expect(asyncValue.run()).resolves.toBe(result)
            })
        })

        it("should return a Success of A from a Just of A", async () => {
            const async = Async.fromMaybe(Maybe.Just(42));
            await expect(async.run()).resolves.toBe(42)
        })

        it("should return a Fail undefined from a None", async () => {
            const async = Async.fromMaybe(Maybe.None());
            await expect(async.run()).rejects.toBeUndefined()
        })

        it("should return a Success of A from a Right of A", async () => {
            const async = Async.fromEither(Either.Right(42));
            await expect(async.run()).resolves.toBe(42)
        })

        it("should return a Fail of A from a Left of A", async () => {
            const async = Async.fromEither(Either.Left(42));
            await expect(async.run()).rejects.toBe(42)
        })

        it("should return Success of A if predicate returns true", async () => {
            const async = Async.fromPredicate((x) => x == 42, 42)
            await expect(async.run()).resolves.toBe(42)
        })

        it("should return Fail of A if predicate returns false", async () => {
            const async = Async.fromPredicate((x) => x < 42, 42)
            await expect(async.run()).rejects.toBe(42)
        })

        it("should return a function that returns Success of A if predicate returns true", async () => {
            const async = Async.fromCondition((x: number) => x == 42)(42)
            await expect(async.run()).resolves.toBe(42)
        })

        it("should return a function that returns Fail of A if predicate returns false", async () => {
            const async = Async.fromCondition((x: number) => x < 42)(42)
            await expect(async.run()).rejects.toBe(42)
        })

        it("should return an unary function that creates an Async from another unary function", async () => {
            const asyncFn = Async.unary((x: number) => x + 1)
            await expect(asyncFn(41).run()).resolves.toBe(42)
        })

        it("should return a n-ary function that creates an Async from another n-ary function", async () => {
            const asyncFn = Async.through((x: number, y: number) => x + y + 1)
            await expect(asyncFn(40,1).run()).resolves.toBe(42)
        })

        it("identity/require should create the identity Async", async () => {
            await expect(Async.require<number>().run(42)).resolves.toBe(42)
            await expect(Async.identity<number>().run(42)).resolves.toBe(42)
        })
    })

    describe("Type Representative", () => {
        describe("Async Rep", () => {
            it("should be able to sequence an array of Async using all", async () => {
                const asyncs = [1,2,3].map(Async.Success)
                const combined = Async.all(asyncs)
                await expect(combined.run()).resolves.toStrictEqual([1,2,3])
            })
        })

        describe("Monad Rep", () => {
            it("should return a success", async () => {
                const s42 = Async.pure(42)
                expect(s42).toTypeMatch("Success")
                await expect(s42.run()).resolves.toBe(42)
            })
        })

        describe("Traversable Rep", () => {
            it("should traverse an array of values using fn", async () => {
                const traversed = Async.traverse([1,[2,3],4], Async.Success)
                expect(traversed).toTypeMatch("Success")
                await expect(traversed.run()).resolves.toStrictEqual([1,[2,3],4])
            })
            it("should traverse an array of values sequencing them", async () => {
                const spy = Spy()
                const traversed = Async.traverse(
                    [1,2,3,4], 
                    (x) => Async.fromPredicate((x: number) => x < 3,x).tap(spy)
                )
                await expect(traversed.run()).rejects.toBe(3)
                expect(spy).toHaveBeenCalledTwice()
                expect(spy).toHaveBeenCalledWith(1)
                expect(spy).toHaveBeenCalledWith(2)
                expect(spy).not.toHaveBeenCalledWith(3)
                expect(spy).not.toHaveBeenCalledWith(4)
            })
        })
    })

    describe("Typeclass Instances", () => {
        describe("Async type", () => {
            it("should be recoverable", async () => {
                const spy = Spy()
                const a42 = Async.Fail(1).recover((err) => {
                    spy(err)
                    return Async.pure(42)
                })
                const a43 = Async
                    .pure(42)
                    .chain(() => Async.Fail(2))
                    .recover(() => Async.pure(43))

                await expect(a42.run()).resolves.toBe(42)
                await expect(a43.run()).resolves.toBe(43)
                expect(spy).toHaveBeenCalledOnce()
                expect(spy).toHaveBeenCalledWith(1)
            })

            it("should ignore ignored asyncs", async () => {
                const spy = Spy()
                const s42 = Async.of(spy).ignore()
                const c42 = s42.chain(() => Async.Fail(42)).ignore()
                const f42 = Async.Fail(42).ignore()
                await expect(s42.run()).resolves.toBeUndefined()
                await expect(c42.run()).resolves.toBeUndefined()
                await expect(f42.run()).resolves.toBeUndefined()
                expect(spy).toHaveBeenCalledTwice()
            })

            it("should reject with unexpected errors", async () => {
                const a42 = Async.of(() => { throw 42 })
                await expect(a42.run()).rejects.toBe(42)
            })

            it("should be able to receive a primitive environment from provide", async () => {
                const reqNum = Async.require<number>().provide(42)
                await expect(reqNum.run()).resolves.toBe(42)
            })
            
            it("should be able to receive a primitive environment from provideSlice", async () => {
                const reqNum = Async.require<number>().provideSlice(42)
                await expect(reqNum.run()).resolves.toBe(42)
            })

            it("should be able to receive a primitive environment from providePartial", async () => {
                const reqNum = Async.require<number>().providePartial(42)
                await expect(reqNum.run()).resolves.toBe(42)
            })

            it("should be able to receive an object environment from provide", async () => {
                interface A { a: number }
                const reqA = Async.require<A>().map(({ a }) => a).provide({ a: 42 })
                await expect(reqA.run()).resolves.toBe(42)
            })

            it("should be able to receive an partial object environment from provideSlice", async () => {
                interface A { a: number }
                interface B { b: number }
                const reqA = Async.require<A>()
                const reqB = Async.require<B>()
                const reqAB = reqA.zip(reqB).map(([{a},{b}]) => [a,b] as const)
                const provided = reqAB.provideSlice({ a: 40 })
                await expect(provided.run({ b: 42 })).resolves.toStrictEqual([40,42])
            })

            it("should be able to receive an partial object environment from providePartial", async () => {
                interface A { a: number }
                interface B { b: number }
                const reqA = Async.require<A>()
                const reqB = Async.require<B>()
                const reqAB = reqA.zip(reqB).map(([{a},{b}]) => [a,b] as const)
                const provided = reqAB.providePartial({ a: 40 })
                await expect(provided.run({ b: 42 })).resolves.toStrictEqual([40,42])
            })

            it("should chain and provide an environment", async () => {
                interface A { a: number }
                interface B { b: number }
                const reqA = Async.require<A>().map(({ a: b }) => ({ b } as B))
                const reqB = Async.require<B>()
                const chained = reqA.provideTo(reqB).map(({ b }) => b)
                await expect(chained.run({ a: 42 })).resolves.toBe(42)
            })

            it("should chain and provide a partial environment from provideSlice", async () => {
                interface A { a: number }
                interface B { b: number }
                interface C { c: number }
                const reqA = Async.require<A>().map(({ a: b }) => ({ b } as B))
                const reqBC = Async.require<B & C>()
                const chained = reqA.provideSliceTo(reqBC).map(({ b, c }) => b + c)
                await expect(chained.run({ a: 40, c: 2 })).resolves.toBe(42)
            })

            it("should chain and provide a partial environment from providePartial", async () => {
                interface A { a: number }
                interface B { b: number }
                interface C { c: number }
                const reqA = Async.require<A>().map(({ a: b }) => ({ b } as B))
                const reqBC = Async.require<B & C>()
                const chained = reqA.providePartialTo(reqBC).map(({ b, c }) => b + c)
                await expect(chained.run({ a: 40, c: 2 })).resolves.toBe(42)
            })

            it("should get a prop from the value using access", async () => {
                interface A { a: number }
                const reqA = Async.require<A>().access("a");
                await expect(reqA.run({ a: 42 })).resolves.toBe(42)
            })

            it("should be able to alias a prop from the value using alias", async () => {
                interface A { a: number }
                const reqA = Async.require<A>().alias("a","b");
                await expect(reqA.run({ a: 42 })).resolves.toStrictEqual({ a: 42, b: 42 })
            })

            it("should be able to rename a prop from the value using rename", async () => {
                interface A { a: number }
                const reqA = Async.require<A>().rename("a","b");
                await expect(reqA.run({ a: 42 })).resolves.toStrictEqual({ b: 42 })
            })

            it("should be able to chain to another async ignoring the success by using tapEffect", async () => {
                const spy = Spy()
                const async = Async.require<number>().tapEffect(a => Async.pure(a + 1).map(spy));
                await expect(async.run(42)).resolves.toBe(42)
                expect(spy).toHaveBeenCalledOnce()
                expect(spy).toHaveBeenCalledWith(43)
            })

            it("should be able to fail on a condition using continueIf", async () => {
                const async = Async.require<number>().continueIf((a) => a === 42)
                await expect(async.run(42)).resolves.toBe(42)
                await expect(async.run(40)).rejects.toBe(40)
            })
        })

        describe("Zippable Async", () => {
            it("should sequence two asyncs merging the results using supplied function", async () => {
                const spy = Spy((x: number, y: number) => x + y)
                const s41 = Async.pure(41);
                const s43 = Async.pure(43);
                const zipped = s41.zipWith(s43,spy)
                await expect(zipped.run()).resolves.toBe(84)
                expect(spy).toHaveBeenCalledWith(41,43)
            })
            it("should sequence two asyncs in a tuple", async () => {
                const s42 = Async.pure(42);
                const zipped = s42.zip(s42)
                expect(zipped.run()).resolves.toStrictEqual([42,42])
            })
            it("should sequence two asyncs ignoring the result of the left", async () => {
                const left = Async.pure("left");
                const right = Async.pure("right");
                const zipped = left.zipRight(right)
                expect(zipped.run()).resolves.toStrictEqual("right")
            })
            it("should sequence two asyncs ignoring the result of the right", async () => {
                const left = Async.pure("left");
                const right = Async.pure("right");
                const zipped = left.zipLeft(right)
                expect(zipped.run()).resolves.toStrictEqual("left")
            })
        })

        describe("Functor Async", () => {
            it("should return a new async", async () => {
                const s42 = Async.Success(42)
                const s42cpy = s42.map(x => x)
                expect(s42).not.toBe(s42cpy)
                const a = await s42.run()
                const b = await s42cpy.run()
                expect(a).toBe(b)
            })

            it("should not call funtion if fail", async () => {
                const spy = Spy()
                const f42 = Async.Fail(42).map(spy)
                await expect(f42.run()).rejects.toBe(42)
                expect(spy).not.toHaveBeenCalled()
            })
        })

        describe("Applicative Async", () => {
            it("should apply", async () => {
                const fn = Async.Success(() => (x: number) => x + 1)
                const arg = Async.Success(41);
                const applied = fn.applyLeft(arg)
                await expect(applied.run()).resolves.toBe(42)
            })
        })

        describe("Monad Async", () => {
            it("should sequence two asyncs using chain/flatMap", async () => {
                const spy = Spy()
                const s1 = Async.pure(1).tap(spy)
                const s2 = Async.pure(2).tap(spy)
                const chained = s1.chain(() => s2)
                expect(spy).not.toHaveBeenCalled()
                await expect(chained.run()).resolves.toBe(2)
                expect(spy).toHaveBeenCalledTwice()
                const c1 = spy.findCall(c => c.args[0] === 1)
                const c2 = spy.findCall(c => c.args[0] === 2)
                expect(c1).calledBefore(c2)
            })
            it("should flatten nested asyncs using join/flat", async () => {
                const spy = Spy()
                const s1 = Async.pure(2).tap(spy)
                const s2 = Async.pure(1).tap(spy).mapTo(s1).join()
                await expect(s2.run()).resolves.toBe(2)
                expect(spy).toHaveBeenCalledTwice()
                const c1 = spy.findCall(c => c.args[0] === 1)
                const c2 = spy.findCall(c => c.args[0] === 2)
                expect(c1).calledBefore(c2)
            })
            it("should have lazy do notation", async () => {
                const spy = Spy()
                const doNotation = Async.do(function*(pure){
                    const a = yield pure(20);
                    spy(a)
                    const b = yield pure(22);
                    spy(b)
                    return pure(a+b)
                })
                expect(spy).not.toHaveBeenCalled()
                await expect(doNotation.run()).resolves.toBe(42)
                expect(spy).toHaveBeenCalledTwice()
                expect(spy).toHaveBeenCalledWith(20)
                expect(spy).toHaveBeenCalledWith(22)
            })
        })

        describe("Tap Async", () => {
            it("should not change result value", async () => {
                const spy = Spy(x => x + 1)
                const s42 = Async.pure(42).tap(spy)
                await expect(s42.run()).resolves.toBe(42)
                expect(spy).toHaveBeenCalledWith(42)
            })
        })

        describe("Show Async", () => {
            it("should return the proper string representation", () => {
                const s = Async.Success(1)
                const f = Async.Fail(2)
                expect(s.show()).toBe("[Async => Success => (R -> _)]")
                expect(f.show()).toBe("[Async => Fail => (R -> _)]")
            })
        })

        describe("Thenable Async", () => {
            it("toPromise should resolve on success", async () => {
                const a42 = Async.of(() => 42)
                await expect(a42.toPromise()).resolves.toBe(42)
            })
            it("toPromise should reject on Fail", async () => {
                const a42 = Async.Fail(42)
                await expect(a42.toPromise()).rejects.toBe(42)
            })
            it("toThenable should resolve on success", async () => {
                const a42 = Async.of(() => 42)
                await expect(a42.toThenable()).resolves.toBe(42)
            })
            it("toThenable should reject on Fail", async () => {
                const a42 = Async.Fail(42)
                await expect(a42.toThenable()).rejects.toBe(42)
            })
            it("toThenable should have catch method", async () => {
                const f42 = Async.Fail(42)
                const promF = new Promise((_,rej) => f42.toThenable().catch(rej))
                await expect(promF).rejects.toBe(42)
            })
            it("toThenable then second argument should be optional", async () => {
                const a42 = Async.Success(42)
                const promS = new Promise((res) => a42.toThenable().then(res))
                await expect(promS).resolves.toBe(42)
            })
        })
    })
})