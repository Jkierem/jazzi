import Either from "../../src/Either"

describe("Either", () => {
    describe("Constructors", () => {
        it("of should return Right on non-nullish values", () => {
            const e = Either.of(42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("of should return Left on nullish values", () => {
            const e = Either.of(null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(null)
        })
        it("from(l,r) should return Right of r if !isNil(r)", () => {
            const e = Either.from(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("from(l,r) should return Left of l if isNil(r)", () => {
            const e = Either.from(42, null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromNullish(l,r) should return Right of r if !isNil(r)", () => {
            const e = Either.fromNullish(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromNullish(l,r) should return Left of l if isNil(r)", () => {
            const e = Either.fromNullish(42, null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromFalsy(l,r) should return Right of r if r is truthy", () => {
            const e = Either.fromFalsy(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromFalsy(l,r) should return Left of l if r is falsy", () => {
            const e = Either.fromFalsy(42, false)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromPredicate(fn, x) should return Right of x if fn(x) == true", () => {
            const e = Either.fromPredicate(x => x % 2 === 0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromPredicate(fn, x) should return Left of x if fn(x) == false", () => {
            const e = Either.fromPredicate(x => x % 2 !== 0, 42)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("defaultTo(l)(r) should return Right of r if r is truthy", () => {
            const e = Either.defaultTo(0)(42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("defaultTo(l)(r) should return Left of l if r is falsy", () => {
            const e = Either.defaultTo(42)(false)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("attempt(fn,...args) should return Right of fn(...args) if it returns", () => {
            const e = Either.attempt((x) => x + 1, 41)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("attempt(fn,...args) should return Left of error thrown by fn(...args)", () => {
            const e = Either.attempt((x) => { throw x + 1 }, 41)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttempt(fn,...args) should return Promise<Either<Right<R>>> where R is fn(...args) if it returns", async () => {
            const e = await Either.asyncAttempt((x) => x + 1, 41)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttempt(fn,...args) should return Promise<Eithter<Left<E>>> where E is the error thrown by fn(...args)", async () => {
            const e = await Either.asyncAttempt((x) => { throw x + 1 }, 41)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
    })
    describe("Type Representative", () => {})
    describe("Typeclass Instances", () => {})
})