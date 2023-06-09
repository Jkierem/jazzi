import * as M from "../../src/Maybe/index"
import * as Fluent from "../../src/Maybe/fluent"

import { Spy } from "../utils/spy";

describe("Maybe", () => {
    describe("Constructors", () => {
        [
            ["from"       , "false"       , false    , "None" ],
            ["from"       , "undefined"   , undefined, "None" ],
            ["from"       , "0"           , 0        , "None" ],
            ["from"       , "empty string", ""       , "None" ],
            ["from"       , "null"        , null     , "None" ],
            ["fromFalsy"  , "false"       , false    , "None" ],
            ["fromFalsy"  , "undefined"   , undefined, "None" ],
            ["fromFalsy"  , "0"           , 0        , "None" ],
            ["fromFalsy"  , "empty string", ""       , "None" ],
            ["fromFalsy"  , "null"        , null     , "None" ],
            ["fromNullish", "null"        , null     , "None" ],
            ["fromNullish", "undefined"   , undefined, "None" ],
            ["fromEmpty"  , "empty object", {}       , "None" ],
            ["fromEmpty"  , "empty string", ""       , "None" ],
            ["fromEmpty"  , "empty array" , []       , "None" ],
            ["of"         , "truthy value"   , true  , "Just" ],
            ["from"       , "truthy value"   , true  , "Just" ],
            ["fromFalsy"  , "truthy value"   , true  , "Just" ],
            ["fromNullish", "not null or undefined", 42 , "Just" ],
            ["fromEmpty"  , "non-empty object",{ a: 42 }, "Just" ],
            ["fromEmpty"  , "non-empty array", [ 42 ]   , "Just" ],
            ["fromEmpty"  , "something else" , 42       , "Just" ],
        ].forEach(([cons,label,val,type]: any[]) => {
            it(`${cons} should create a ${type} with ${label}`,() => {
                expect((M as any)[cons](val)).toTypeMatch(type);
                expect((Fluent as any)[cons](val)).toTypeMatch(type);
            })
        })

        const is42 = (x: any) => x === 42
        const True = () => true;
        const False = () => false;

        it("fromCondition should create a just with a predicate that returns true", () => {
            expect(Fluent.fromCondition(is42)(42)).toTypeMatch("Just")
            expect(M.fromCondition(is42)(42)).toTypeMatch("Just")
            expect(Fluent.fromCondition(True)(2)).toTypeMatch("Just")
            expect(M.fromCondition(True)(2)).toTypeMatch("Just")
        })

        it("fromCondition should create a none with a predicate that returns false", () => {
            expect(Fluent.fromCondition(is42)(2)).toTypeMatch("None")
            expect(M.fromCondition(is42)(2)).toTypeMatch("None")
            expect(Fluent.fromCondition(False)(2)).toTypeMatch("None")
            expect(M.fromCondition(False)(2)).toTypeMatch("None")
        })
    })

    describe("Operators", () => {
        const sharedTests = (
            buildJust: <A>(data: A) => M.Maybe<A> | Fluent.Maybe<A>,
            buildNone: <A>() => M.Maybe<A> | Fluent.Maybe<A>,
            call: (what: string, ...args: any[]) => (self: M.Maybe<any> | Fluent.Maybe<any>) => any
        ) => {

            describe("get", () => {
                it("should return inner value", () => {
                    expect(call("get")(buildJust(42))).toBe(42);
                    expect(call("get")(buildNone(  ))).toBeUndefined;
                })
            })

            describe("isJust", () => {
                const doTest = call("isJust");
                it("should return true on Just", () => {
                    expect(doTest(buildJust(42))).toBeTruthy();
                    expect(doTest(buildNone(  ))).toBeFalsy();
                })
            })

            describe("isNone", () => {
                const doTest = call("isNone");
                it("should return true on None", () => {
                    expect(doTest(buildJust(42))).toBeFalsy();
                    expect(doTest(buildNone(  ))).toBeTruthy();
                })
            })

            describe("fold", () => {
                const onJustSpy = Spy();
                const onNoneSpy = Spy();
                
                beforeEach(() => {
                    onJustSpy.reset();
                    onNoneSpy.reset();
                })

                const doTest = call("fold", onNoneSpy, onJustSpy)
    
                it("should call the first argument on Just", () => {
                    doTest(buildJust(42))
                    expect(onJustSpy).toHaveBeenCalledWith(42);
                    expect(onNoneSpy).not.toHaveBeenCalled();
                })
                
                it("should call the second argument on None", () => {
                    doTest(buildNone())
                    expect(onNoneSpy).toHaveBeenCalled();
                    expect(onJustSpy).not.toHaveBeenCalled();
                })
            })
    
            describe("match", () => {
                const pattern = {
                    Just: () => "just",
                    None: () => "none"
                }

                const doTest = call("match", pattern);

                it("should return value based on pattern", () => {
                    expect(doTest(buildJust(42))).toBe("just")
                    expect(doTest(buildNone())).toBe("none")
                })
            })
    
            describe("show", () => {

                const doTest = call("show")

                it("should return a proper string", () => {
                    expect(doTest(buildJust(42))).toBe("[Maybe => Just => 42]")
                    expect(doTest(buildNone(  ))).toBe("[Maybe => None]")
                })
            })

            describe("map", () => {
                const mapSpy = Spy(x => x + 1);
                const doTest = call("map", mapSpy);

                it("should call function with inner value, creating a new Maybe, if Just", () => {
                    doTest(buildNone())
                    const just = buildJust(42)
                    const result = doTest(just);

                    expect(mapSpy).toHaveBeenCalledOnce()
                    expect(mapSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Just")
                    expect(result).not.toBe(just);
                    expect(result).toHaveValueOf(43);
                })
            })

            describe("chain", () => {
                const chainSpy = Spy(x => buildJust(x + 1));
                const doTest = call("chain", chainSpy);

                it("should call function with inner value, creating a new Maybe, if Just", () => {
                    doTest(buildNone())
                    const just = buildJust(42)
                    const result = doTest(just);

                    expect(chainSpy).toHaveBeenCalledOnce()
                    expect(chainSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Just")
                    expect(result).not.toBe(just);
                    expect(result).toHaveValueOf(43);
                })
            })

            describe("tap", () => {
                const tapSpy = Spy(x => x + 1);
                const doTest = call("tap", tapSpy);

                it("should call function with inner value, creating a new Maybe with the same value, if Just", () => {
                    doTest(buildNone())
                    const just = buildJust(42)
                    const result = doTest(just);

                    expect(tapSpy).toHaveBeenCalledOnce()
                    expect(tapSpy).toHaveBeenCalledWith(42)
                    expect(result).toTypeMatch("Just")
                    expect(result).not.toBe(just);
                    expect(result).toHaveValueOf(42);
                })
            })

            describe("mapTo", () => {
                it("should be a shorthand for map(() => a)", () => {
                    const contant = { ref: undefined };
                    const doTest = call("mapTo", contant);

                    expect(doTest(buildJust(42))).toHaveValueOf(contant);
                    expect(doTest(buildNone(  ))).toTypeMatch("None");
                })
            })

            describe("zipWith", () => {
                it("should join two maybes with provided function if both are Just", () => {
                    const just41 = buildJust(41)
                    const just42 = buildJust(42)
                    const fnSpy  = Spy((x, y) => x + y);
                    const doTest = call("zipWith", just42, fnSpy)
                    const result = doTest(just41);
                    
                    expect(result).toTypeMatch("Just")
                    expect(result).toHaveValueOf(83);
                    expect(fnSpy).toHaveBeenCalledOnce();
                    expect(fnSpy).toHaveBeenCalledWith(41, 42);
                })

                it("should return None if any Maybe is None", () => {
                    const just  = buildJust(41)
                    const none  = buildNone(  )
                    const fnSpy = Spy((x, y) => x + y);
                    const doTestLeft  = call("zipWith", just, fnSpy)
                    const doTestRight = call("zipWith", none, fnSpy)
                    const doTestBoth  = call("zipWith", none, fnSpy)
                    const result1 = doTestLeft(none);
                    const result2 = doTestRight(just);
                    const result3 = doTestBoth(none);

                    expect(result1).toTypeMatch("None")
                    expect(result2).toTypeMatch("None")
                    expect(result3).toTypeMatch("None")
                    expect(fnSpy).not.toHaveBeenCalled();
                })
            })

            describe("zip", () => {
                it("should collect both inner values in a tuple", () => {
                    const just41 = buildJust(41)
                    const just42 = buildJust(42)
                    const doTest = call("zip", just42)
                    const result = doTest(just41);
                    
                    expect(result).toTypeMatch("Just")
                    expect(result).toHaveStrictValueOf([41,42]);
                })

                it("should return None if any Maybe is None", () => {
                    const just  = buildJust(41)
                    const none  = buildNone(  )
                    const doTestLeft  = call("zip", just)
                    const doTestRight = call("zip", none)
                    const doTestBoth  = call("zip", none)
                    const result1 = doTestLeft(none);
                    const result2 = doTestRight(just);
                    const result3 = doTestBoth(none);

                    expect(result1).toTypeMatch("None")
                    expect(result2).toTypeMatch("None")
                    expect(result3).toTypeMatch("None")
                })
            })

            describe("zipLeft", () => {
                it("should return left inner value if both are Just", () => {
                    const just41 = buildJust(41)
                    const just42 = buildJust(42)
                    const doTest = call("zipLeft", just42)
                    // This is read as: just41 zipLeft just42
                    const result = doTest(just41);
                    
                    expect(result).toTypeMatch("Just")
                    expect(result).toHaveValueOf(41);
                })

                it("should return None if any Maybe is None", () => {
                    const just  = buildJust(41)
                    const none  = buildNone(  )
                    const doTestLeft  = call("zipLeft", just)
                    const doTestRight = call("zipLeft", none)
                    const doTestBoth  = call("zipLeft", none)
                    const result1 = doTestLeft(none);
                    const result2 = doTestRight(just);
                    const result3 = doTestBoth(none);

                    expect(result1).toTypeMatch("None")
                    expect(result2).toTypeMatch("None")
                    expect(result3).toTypeMatch("None")
                })
            })

            describe("zipRight", () => {
                it("should return right inner value if both are Just", () => {
                    const just41 = buildJust(41)
                    const just42 = buildJust(42)
                    const doTest = call("zipRight", just42)
                    // This is read as: just41 zipRight just42
                    const result = doTest(just41);
                    
                    expect(result).toTypeMatch("Just")
                    expect(result).toHaveValueOf(42);
                })

                it("should return None if any Maybe is None", () => {
                    const just  = buildJust(41)
                    const none  = buildNone(  )
                    const doTestLeft  = call("zipRight", just)
                    const doTestRight = call("zipRight", none)
                    const doTestBoth  = call("zipRight", none)
                    const result1 = doTestLeft(none);
                    const result2 = doTestRight(just);
                    const result3 = doTestBoth(none);

                    expect(result1).toTypeMatch("None")
                    expect(result2).toTypeMatch("None")
                    expect(result3).toTypeMatch("None")
                })
            })

            describe("toThenable", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                const doTest = call("toThenable")

                it("should resolve on Just", () => {
                    return expect(doTest(buildJust(42))).resolves.toBe(42);
                })

                it("should reject on None", () => {
                    return expect(doTest(buildNone(  ))).rejects.toBeUndefined();
                })

                it("should call first argument if Just, second if None", () => {
                    doTest(buildNone()).then(thenSpy, catchSpy)

                    expect(thenSpy).not.toHaveBeenCalled()
                    expect(catchSpy).toHaveBeenCalled()

                    catchSpy.reset();

                    doTest(buildJust(42)).then(thenSpy, catchSpy)
                    doTest(buildJust(42)).catch(catchSpy)

                    expect(thenSpy).toHaveBeenCalledWith(42);
                    expect(catchSpy).not.toHaveBeenCalled();

                    doTest(buildNone()).catch(catchSpy)

                    expect(catchSpy).toHaveBeenCalled()
                })
            })

            describe("toPromise", () => {
                const doTest = call("toPromise")

                it("should resolve on Just", () => {
                    return expect(doTest(buildJust(42))).resolves.toBe(42);
                })

                it("should reject on None", () => {
                    return expect(doTest(buildNone(  ))).rejects.toBeUndefined();
                })
            })

            describe("toEither", () => {
                const cast = call("toEither");

                it("should return Right<A> if Just<A>", () => {
                    const e = cast(buildJust(42))
                    expect(e).toTypeMatch("Right")
                    expect(e).toHaveValueOf(42)
                })

                it("should return Left<undefined> if None", () => {
                    const e = cast(buildNone())
                    expect(e).toTypeMatch("Left")
                    expect(e).toHaveValueOf(undefined)
                })
            })
        }

        describe("Pipeable", () => {
            sharedTests(
                M.Just, M.None, 
                (op: string, ...args: any[]) => (self: any) => {
                    if( args.length === 0 ){
                        return self['|>']((M as any)[op]);
                    }
                    if( op === "zipWith" ){
                        const [m, fn] = args
                        return self['|>'](M.zipWith(fn)(m))
                    }
                    return self['|>']((M as any)[op](...args))
                }
            )
        })

        describe("Fluent", () => {
            sharedTests(
                Fluent.Just, Fluent.None, 
                (op: string, ...args: any[]) => (self: any) => self[op](...args)
            );
        })


        describe.skip("toAsync", () => {
            it("not implemented", () => {
                expect(true).toBe(false);
            })
        })
    })
})