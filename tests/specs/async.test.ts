import Async from "../../src/Async"
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
            it("should traverse an array of values defaulting to Fail", async () => {
                const traversed = Async.traverse(
                    [1,2,3,4], 
                    Async.fromCondition((x: number) => x < 3)
                )
                expect(traversed).toTypeMatch("Fail")
                await expect(traversed.run()).rejects.toBe(3)
            })
        })
    })

    describe("Typeclass Instances", () => {
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
            it("should chain two Asyncs", async () => {
                const spy = Spy()
                const s1 = Async.pure(1).tap(spy)
                const s2 = Async.pure(2).tap(spy)
                const chained = s1.chain(() => s2)
                expect(spy).not.toHaveBeenCalled()
                await expect(chained.run()).resolves.toBe(2)
                expect(spy).toHaveBeenCalledTwice()
                const [c1,c2] = spy.calls;
                expect(c1).calledBefore(c2)
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
    })
})