import Maybe from "../../src/Maybe"
import Either from "../../src/Either"

describe("Type conversions", () => {
    describe("to Async", () => {
        describe("Maybe", () => {
            it("should cast to succeed", async () => {
                const j42 = Maybe.from(42)
                const async42 = j42.toAsync()
                expect(async42).toTypeMatch("Success")
                await expect(async42.run()).resolves.toBe(42)
            })
            it("should cast to fail", async () => {
                const none = Maybe.None()
                const asyncFail = none.toAsync()
                expect(asyncFail).toTypeMatch("Fail")
                await expect(asyncFail.run()).rejects.toBeUndefined()
            })
        })
        describe("Either", () => {
            it("should cast to succeed", async () => {
                const r42 = Either.Right(42)
                const async42 = r42.toAsync()
                expect(async42).toTypeMatch("Success")
                await expect(async42.run()).resolves.toBe(42)
            })
            it("should cast to fail", async () => {
                const l42 = Either.Left(42)
                const async42 = l42.toAsync()
                expect(async42).toTypeMatch("Fail")
                await expect(async42.run()).rejects.toBe(42)
            })
        })
    })
})