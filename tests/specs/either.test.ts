import * as E from "../../src/Either"
import * as F from "../../src/Either/fluent"
import { Spy } from "../utils/spy"

describe("Either", () => {
    describe("Constructors", () => {
        it("of should return Right on non-nullish values", () => {
            const e = E.of(42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("of should return Left on nullish values", () => {
            const e = E.of(null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(null)
        })
        it("from(l,r) should return Right of r if !isNil(r)", () => {
            const e = E.from(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("from(l,r) should return Left of l if isNil(r)", () => {
            const e = E.from(42, null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromNullish(l,r) should return Right of r if !isNil(r)", () => {
            const e = E.fromNullish(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromNullish(l,r) should return Left of l if isNil(r)", () => {
            const e = E.fromNullish(42, null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromFalsy(l,r) should return Right of r if r is truthy", () => {
            const e = E.fromFalsy(0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromFalsy(l,r) should return Left of l if r is falsy", () => {
            const e = E.fromFalsy(42, false)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("fromPredicate(fn, x) should return Right of x if fn(x) == true", () => {
            const e = E.fromPredicate((x): x is number => typeof(x) === "number", 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromPredicate(fn, x) should return Left of x if fn(x) == false", () => {
            const e = E.fromPredicate((x): x is number => typeof(x) === "number", "42" as string | number)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf("42")
        })
        it("fromCondition(fn, x) should return Right of x if fn(x) == true", () => {
            const e = E.fromCondition(x => x % 2 === 0, 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("fromCondition(fn, x) should return Left of x if fn(x) == false", () => {
            const e = E.fromCondition(x => x % 2 !== 0, 42)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("defaultTo(l)(r) should return Right of r if r is truthy", () => {
            const e = E.defaultTo(0)(42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("defaultTo(l)(r) should return Left of l if r is falsy", () => {
            const e = E.defaultTo(42)(null)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("attemptR(fn,...args) should return Right of fn(...args) if it returns", () => {
            const e = E.attemptR((x) => x + 1, 41)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("attemptR(fn,...args) should return Left of error thrown by fn(...args)", () => {
            const e = E.attemptR((x) => { throw x + 1 }, 41)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttemptR(fn,...args) should return Promise<Either<Right<R>>> where R is fn(...args) if it returns", async () => {
            const e = await E.asyncAttemptR(async (x) => x + 1, 41)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttemptR(fn,...args) should return Promise<Either<Left<E>>> where E is the error thrown by fn(...args)", async () => {
            const e = await E.asyncAttemptR((x) => { throw x + 1 }, 41)
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })

        it("attempt(fn) should return Right of fn() if it returns", () => {
            const e = E.attemptR(() => 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("attempt(fn) should return Left of error thrown by fn()", () => {
            const e = E.attempt(() => { throw 42 })
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttempt(fn) should return Promise<Either<Right<R>>> where R is fn() if it returns", async () => {
            const e = await E.asyncAttempt(async () => 42)
            expect(e).toTypeMatch("Right")
            expect(e).toHaveValueOf(42)
        })
        it("asyncAttempt(fn) should return Promise<Either<Left<E>>> where E is the error thrown by fn()", async () => {
            const e = await E.asyncAttempt(() => { throw 42 })
            expect(e).toTypeMatch("Left")
            expect(e).toHaveValueOf(42)
        })
    })
    describe("Operators", () => {
        type Either<L,R> = E.Either<L,R> | F.Either<L,R>
        const sharedTests = (
            buildLeft: <L,R>(l: L) => Either<L,R>,
            buildRight: <L,R>(r: R) => Either<L,R>,
            call: (what: string, ...args: any[]) => <L,R>(self: Either<L,R>) => any
        ) => {
            describe("get", () => {
                const doGet = call("get")
                it("should return inner value", () => {
                    expect(doGet(buildLeft(42))).toBe(42)
                    expect(doGet(buildRight(42))).toBe(42)
                })
            })

            describe("getOr", () => {
                const doGetOr = call("getOr", () => "else")
                it("should return inner value if Right, otherwise return received function result", () => {
                    expect(doGetOr(buildLeft(42))).toBe("else")
                    expect(doGetOr(buildRight(42))).toBe(42)
                })
            })

            describe("getLeftOr", () => {
                const doGetOr = call("getLeftOr", () => "else")
                it("should return inner value if Left, otherwise return received function result", () => {
                    expect(doGetOr(buildRight(42))).toBe("else")
                    expect(doGetOr(buildLeft(42))).toBe(42)
                })
            })

            describe("isLeft", () => {
                it("should return true if Left, false otherwise", () => {
                    const callIsLeft = call("isLeft");
                    expect(callIsLeft(buildLeft(42))).toBeTruthy()
                    expect(callIsLeft(buildRight(42))).toBeFalsy()
                })
            })

            describe("isRight", () => {
                it("should return true if Right, false otherwise", () => {
                    const callIsLeft = call("isRight");
                    expect(callIsLeft(buildLeft(42))).toBeFalsy()
                    expect(callIsLeft(buildRight(42))).toBeTruthy()
                })
            })

            describe("fold", () => {
                const onRightSpy = Spy();
                const onLeftSpy = Spy();
                
                beforeEach(() => {
                    onRightSpy.reset();
                    onLeftSpy.reset();
                })

                const doTest = call("fold", onLeftSpy, onRightSpy)
    
                it("should call the second argument on Right", () => {
                    doTest(buildRight(42))
                    expect(onRightSpy).toHaveBeenCalledWith(42);
                    expect(onLeftSpy).not.toHaveBeenCalled();
                })
                
                it("should call the first argument on Left", () => {
                    doTest(buildLeft(42))
                    expect(onLeftSpy).toHaveBeenCalledWith(42);
                    expect(onRightSpy).not.toHaveBeenCalled();
                })
            })

            describe("match", () => {
                const rightSpy = Spy()
                const leftSpy = Spy()

                const pattern = {
                    Right: rightSpy,
                    Left: leftSpy
                }

                const doTest = call("match", pattern);

                it("should return value based on pattern", () => {
                    expect(doTest(buildRight("right"))).toBe("right")
                    expect(doTest(buildLeft("left"))).toBe("left")
                    expect(rightSpy).toHaveBeenCalledWith("right")
                    expect(leftSpy).toHaveBeenCalledWith("left")
                })
            })

            describe("show", () => {

                const doTest = call("show")

                it("should return a proper string", () => {
                    expect(doTest(buildRight(42))).toBe("[Either => Right => 42]")
                    expect(doTest(buildLeft(42))).toBe("[Either => Left => 42]")
                })
            })

            describe("map", () => {
                const mapSpy = Spy(x => x + 1);
                const doTest = call("map", mapSpy);

                it("should call function with inner value, creating a new Either, if Right", () => {
                    doTest(buildLeft(42))
                    const right = buildRight(42)
                    const result = doTest(right);

                    expect(mapSpy).toHaveBeenCalledOnce()
                    expect(mapSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Right")
                    expect(result).not.toBe(right);
                    expect(result).toHaveValueOf(43);
                })
            })

            describe("mapLeft", () => {
                const mapSpy = Spy(x => x + 1);
                const doTest = call("mapLeft", mapSpy);

                it("should call function with inner value, creating a new Either, if Left", () => {
                    doTest(buildRight(42))
                    const left = buildLeft(42)
                    const result = doTest(left);

                    expect(mapSpy).toHaveBeenCalledOnce()
                    expect(mapSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Left")
                    expect(result).not.toBe(left);
                    expect(result).toHaveValueOf(43);
                })
            })

            describe("chain", () => {
                const chainSpy = Spy(x => buildRight(x + 1));
                const doTest = call("chain", chainSpy);

                it("should call function with inner value, creating a new Either, if Right", () => {
                    doTest(buildLeft(41))
                    const right = buildRight(42)
                    const result = doTest(right);

                    expect(chainSpy).toHaveBeenCalledOnce()
                    expect(chainSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Right")
                    expect(result).not.toBe(right);
                    expect(result).toHaveValueOf(43);
                })
            })

            describe("tap", () => {
                const tapSpy = Spy(x => x + 1);
                const doTest = call("tap", tapSpy);

                it("should call function with inner value, creating a new Either with the same value, if Right", () => {
                    doTest(buildLeft(41))
                    const right = buildRight(42)
                    const result = doTest(right);

                    expect(tapSpy).toHaveBeenCalledOnce()
                    expect(tapSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Right")
                    expect(result).not.toBe(right);
                    expect(result).toHaveValueOf(42);
                })
            })

            describe("mapTo", () => {
                it("should be a shorthand for map(() => a)", () => {
                    const constant = { ref: undefined };
                    const doTest = call("mapTo", constant);

                    expect(doTest(buildRight(42))).toHaveValueOf(constant);
                    const leftR = doTest(buildLeft(41))
                    expect(leftR).toTypeMatch("Left");
                    expect(leftR).toHaveValueOf(41);
                })
            })

            describe("zipWith", () => {
                it("should join two maybes with provided function if both are Right", () => {
                    const right41 = buildRight(41)
                    const right42 = buildRight(42)
                    const fnSpy  = Spy((x, y) => x + y);
                    const doTest = call("zipWith", right42, fnSpy)
                    const result = doTest(right41);
                    
                    expect(result).toTypeMatch("Right")
                    expect(result).toHaveValueOf(83);
                    expect(fnSpy).toHaveBeenCalledOnce();
                    expect(fnSpy).toHaveBeenCalledWith(41, 42);
                })

                it("should return Left if any Either is Left", () => {
                    const right = buildRight(41)
                    const left  = buildLeft(40)
                    const fnSpy = Spy((x, y) => x + y);
                    const doTestLeft  = call("zipWith", right, fnSpy)
                    const doTestRight = call("zipWith", left, fnSpy)
                    const doTestBoth  = call("zipWith", left, fnSpy)
                    const result1 = doTestLeft(left);
                    const result2 = doTestRight(right);
                    const result3 = doTestBoth(left);

                    expect(result1).toTypeMatch("Left")
                    expect(result2).toTypeMatch("Left")
                    expect(result3).toTypeMatch("Left")
                    expect(fnSpy).not.toHaveBeenCalled();
                })
            })

            describe("zip", () => {
                it("should collect both inner values in a tuple", () => {
                    const right41 = buildRight(41)
                    const right42 = buildRight(42)
                    const doTest = call("zip", right42)
                    const result = doTest(right41);
                    
                    expect(result).toTypeMatch("Right")
                    expect(result).toHaveStrictValueOf([41,42]);
                })

                it("should return Left if any Either is Left", () => {
                    const right  = buildRight(41)
                    const left  = buildLeft(40)
                    const doTestLeft  = call("zip", right)
                    const doTestRight = call("zip", left)
                    const doTestBoth  = call("zip", left)
                    const result1 = doTestLeft(left);
                    const result2 = doTestRight(right);
                    const result3 = doTestBoth(left);

                    expect(result1).toTypeMatch("Left")
                    expect(result2).toTypeMatch("Left")
                    expect(result3).toTypeMatch("Left")
                })
            })

            describe("zipLeft", () => {
                it("should return left inner value if both are Right", () => {
                    const right41 = buildRight(41)
                    const right42 = buildRight(42)
                    const doTest = call("zipLeft", right42)
                    // This is read as: right41 zipLeft right42
                    const result = doTest(right41);
                    
                    expect(result).toTypeMatch("Right")
                    expect(result).toHaveValueOf(41);
                })

                it("should return Left if any Either is Left", () => {
                    const right  = buildRight(41)
                    const left  = buildLeft(40)
                    const doTestLeft  = call("zipLeft", right)
                    const doTestRight = call("zipLeft", left)
                    const doTestBoth  = call("zipLeft", left)
                    const result1 = doTestLeft(left);
                    const result2 = doTestRight(right);
                    const result3 = doTestBoth(left);

                    expect(result1).toTypeMatch("Left")
                    expect(result2).toTypeMatch("Left")
                    expect(result3).toTypeMatch("Left")
                })
            })

            describe("zipRight", () => {
                it("should return right inner value if both are Right", () => {
                    const right41 = buildRight(41)
                    const right42 = buildRight(42)
                    const doTest = call("zipRight", right42)
                    // This is read as: right41 zipRight right42
                    const result = doTest(right41);
                    
                    expect(result).toTypeMatch("Right")
                    expect(result).toHaveValueOf(42);
                })

                it("should return Left if any Either is Left", () => {
                    const right  = buildRight(41)
                    const left  = buildLeft(40)
                    const doTestLeft  = call("zipRight", right)
                    const doTestRight = call("zipRight", left)
                    const doTestBoth  = call("zipRight", left)
                    const result1 = doTestLeft(left);
                    const result2 = doTestRight(right);
                    const result3 = doTestBoth(left);

                    expect(result1).toTypeMatch("Left")
                    expect(result2).toTypeMatch("Left")
                    expect(result3).toTypeMatch("Left")
                })
            })

            describe("toThenable", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                const doTest = call("toThenable")

                it("should resolve on Right", () => {
                    return expect(doTest(buildRight(42))).resolves.toBe(42);
                })

                it("should reject on Left", () => {
                    return expect(doTest(buildLeft(40))).rejects.toBe(40);
                })

                it("should call first argument if Right, second if Left", () => {
                    doTest(buildLeft(40)).then(thenSpy, catchSpy)

                    expect(thenSpy).not.toHaveBeenCalled()
                    expect(catchSpy).toHaveBeenCalledWith(40)

                    catchSpy.reset();

                    doTest(buildRight(42)).then(thenSpy, catchSpy)
                    doTest(buildRight(42)).catch(catchSpy)

                    expect(thenSpy).toHaveBeenCalledWith(42);
                    expect(catchSpy).not.toHaveBeenCalled();

                    doTest(buildLeft(41)).catch(catchSpy)

                    expect(catchSpy).toHaveBeenCalledWith(41)
                })
            })

            describe("toPromise", () => {
                const doTest = call("toPromise")

                it("should resolve on Right", () => {
                    return expect(doTest(buildRight(42))).resolves.toBe(42);
                })

                it("should reject on Left", () => {
                    return expect(doTest(buildLeft(40))).rejects.toBe(40);
                })
            })
        }

        describe("Pipeable", () => {
            sharedTests(
                E.Left,
                E.Right,
                (op: string, ...args: any[]) => (self: any) => {
                    if( args.length === 0 ){
                        return self['|>']((E as any)[op]);
                    }
                    if( op === "zipWith" ){
                        const [m, fn] = args
                        return self['|>'](E.zipWith(fn)(m))
                    }
                    return self['|>']((E as any)[op](...args))
                }
            )
        })

        describe("Fluent", () => {})
    })
})