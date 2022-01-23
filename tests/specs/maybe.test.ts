import Maybe from '../../src/Maybe'
import type { Maybe as M } from "../../src/Maybe/types"
import Sum from '../../src/Sum'
import { isEmpty } from '../../src/_internals';
import { Spy } from "../utils/spy";

type AnyMaybe = M<any>
type Maybe<A> = M<A>

describe("Maybe", () => {
    describe("Constructors", () => {
        [
            ["from"       , "false"       , false    , "none" ],
            ["from"       , "undefined"   , undefined, "none" ],
            ["from"       , "0"           , 0        , "none" ],
            ["from"       , "empty string", ""       , "none" ],
            ["from"       , "null"        , null     , "none" ],
            ["fromFalsy"  , "false"       , false    , "none" ],
            ["fromFalsy"  , "undefined"   , undefined, "none" ],
            ["fromFalsy"  , "0"           , 0        , "none" ],
            ["fromFalsy"  , "empty string", ""       , "none" ],
            ["fromFalsy"  , "null"        , null     , "none" ],
            ["fromNullish", "null"        , null     , "none" ],
            ["fromNullish", "undefined"   , undefined, "none" ],
            ["fromArray"  , "empty array" , []       , "none" ],
            ["fromEmpty"  , "empty object", {}       , "none" ],
            ["fromEmpty"  , "empty string", ""       , "none" ],
            ["fromEmpty"  , "empty array" , []       , "none" ],
            ["fromEmpty"  , "empty of a type", Maybe.None(), "none" ],
            ["of"       , "truthy value"   , true  , "just" ],
            ["from"       , "truthy value"   , true  , "just" ],
            ["fromFalsy"  , "truthy value"   , true  , "just" ],
            ["fromArray"  , "non empty array", [ 1 ] , "just" ],
            ["fromNullish", "neither null or undefined", 42 , "just" ],
            ["fromEmpty"  , "non-empty object",{ a: 42 }, "just" ],
            ["fromEmpty"  , "non-empty array", [ 42 ]   , "just" ],
            ["fromEmpty"  , "something else" , 42       , "just" ],
        ].forEach(([cons,label,val,type]: any[]) => {
            it(`${cons} should create a ${type} with ${label}`,() => {
                expect((Maybe as any)[cons](val)).toTypeMatch(type);
            })
        })

        const is42 = (x: any) => x === 42
        const True = () => true;
        const False = () => false;

        it("fromPredicate should create a just with a predicate that returns true", () => {
            expect(Maybe.fromPredicate(is42,42)).toTypeMatch("Just")
            expect(Maybe.fromPredicate(True)).toTypeMatch("Just")
        })

        it("fromPredicate should create a none with a predicate that returns false", () => {
            expect(Maybe.fromPredicate(is42,2)).toTypeMatch("None")
            expect(Maybe.fromPredicate(False)).toTypeMatch("None")
        })
    })

    describe("Type Representatives", () => {
        describe("Eq Rep", () => {
            it("should perform equality check by means of type rep", () => {
                const just42 = Maybe.Just(42)
                const none = Maybe.None()

                expect(Maybe.equals(just42,Maybe.Just(42))).toBeTruthy();
                expect(Maybe.equals(just42,Maybe.Just(43))).toBeFalsy();
                expect(Maybe.equals(just42,just42)).toBeTruthy()
                expect(Maybe.equals(none,Maybe.None())).toBeTruthy()
            })
        })

        describe("Monad Rep", () => {
            it("pure should return Just", () => {
                expect(Maybe.pure(42)).toTypeMatch("Just")
            })
        })
    
        describe("Monoid Rep", () => {
            it("empty should be none", () => {
                expect(Maybe.empty()).toTypeMatch("None")
            })
            it("isEmpty should be true if none", () => {
                expect(Maybe.isEmpty(Maybe.None())).toBeTruthy()
            })
            it("isEmpty should be false if not none", () => {
                expect(Maybe.isEmpty(Maybe.Just(42))).toBeFalsy()
                expect(Maybe.isEmpty(42)).toBeFalsy()
            })
        })
    })

    describe("Typeclass Instances", () => {
        const just42 = Maybe.Just(42)
        const none = Maybe.None()
        const justInc = Maybe.Just((x: number) => x + 1)
        const justArr1 = Maybe.Just([1])
        const justArr2 = Maybe.Just([2])

        describe("Boxed Maybe", () => {
            it("should call fn if type matches the function", () => {
                const spy = Spy(() => Maybe.Just(42));
                expect(just42.ifNone(Maybe.None)).toTypeMatch("Just")
                expect(just42.ifJust(spy).get()).toBe(42);
                expect(spy).toHaveBeenCalled()
                spy.reset()
                expect(none.ifJust(spy)).toTypeMatch("None")
                expect(none.ifNone(spy)).toTypeMatch("Just")
                expect(spy).toHaveBeenCalled()
            })

            it("should return inner value", () => {
                expect(just42.get()).toBe(42)
                expect(none.get()).toBeUndefined();
            })

            it("onNone should return inner value on Just, extract argument otherwise", () => {
                expect(just42.onNone(1)).toBe(42)
                expect(none.onNone(() => 43)).toBe(43)
                expect(none.onNone(43)).toBe(43)
            })

            it("should allow to check if Just or None", () => {
                expect(just42.isJust()).toBeTruthy()
                expect(just42.isNone()).toBeFalsy()
                expect(none.isJust()).toBeFalsy()
                expect(none.isNone()).toBeTruthy()
            })
        })

        describe("Matcher Maybe", () => {
            it("should match", () => {
                expect(just42).toTypeMatch("Just");
                expect(none).toTypeMatch("None");
                expect(Maybe.match(just42,{ Just: () => true, _ : () => false })).toBeTruthy()
                expect(Maybe.match(none,{ None: () => true, _ : () => false })).toBeTruthy()
                expect(Maybe.match(42,({ Just: () => false, None: () => false, _: x => x }))).toBe(42)
            })
        })
    
        describe("Tap Maybe", () => {
            it("should not call tap when none and tap should leave inner value as is", () => {
                const fn = Spy()
                none.tap(fn)
                const val = just42.tap(fn).get();
                expect(val).toBe(42)
                expect(fn.callCount).toBe(1);
            })
        })

        describe("Show Maybe", () => {
            it("show -> should return string representation", () => {
                expect(just42.toString()).toBe("[Maybe => Just 42]")
                expect(none.toString()).toBe("[Maybe => None]")
            })
        })

        describe("Eq Maybe", () => {
            it("should handle equality by inner value", () => {
                expect(just42.equals(Maybe.Just(42))).toBeTruthy();
                expect(just42.equals(Maybe.Just(43))).toBeFalsy();
                expect(just42.equals(just42)).toBeTruthy()
                expect(just42.equals(42)).toBeFalsy()
                expect(none.equals(Maybe.None())).toBeTruthy()
                expect(none.equals(42)).toBeFalsy()
                expect(none.equals(just42)).toBeFalsy()
            })
        })

        describe("Functor Maybe", () => {
            it("should not call map when is none", () => {
                const fn = Spy();
                none.map(fn)
                expect(fn.called).toBeFalsy();
            })

            it("should return new object on map", () => {
                const mapped = just42.map(x => x);
                expect(mapped).not.toBe(just42)
                expect(mapped.equals(just42)).toBeTruthy();
            })
        })

        describe("Applicative Maybe", () => {
            it("should apply inner function", () => {
                expect(just42.apply(justInc).get()).toBe(43)
                expect(justInc.apply(none as AnyMaybe)).toTypeMatch("None")
                expect(none.apply(justInc as AnyMaybe)).toTypeMatch("None")
    
                expect(justInc.applyLeft(just42).get()).toBe(43)
                expect(justInc.applyLeft(none as AnyMaybe)).toTypeMatch("None")
                expect((none as AnyMaybe).applyLeft(justInc)).toTypeMatch("None")
            })
        })

        describe("Monad Maybe", () => {
            it("should chain", () => {
                const fn = Spy(Maybe.Just);
                expect(just42.chain(Maybe.Just)).toHaveValueOf(42);
                expect(none.chain(fn)).toTypeMatch("None");
                expect(fn.called).toBe(false);
            })
        })

        describe("Semigroup Maybe", () => {
            it("should concat inner values", () => {
                expect(justArr1.concat(just42 as any)).toHaveValueOf([1,42])
                expect(justArr1.concat(justArr2)).toHaveValueOf([1,2])
                expect(justArr1.concat(none as any)).toHaveValueOf([1])
                expect(none.concat(just42)).toHaveValueOf(42)
                expect(none.concat(none)).toTypeMatch("None")
            })
        })

        describe("Monoid Maybe", () => {
            it("should append inner values",() => {
                expect(justArr1.append(just42 as any)).toHaveValueOf([1,42])
                expect(justArr1.append(justArr2)).toHaveValueOf([1,2])
                expect(justArr1.append(none as any)).toHaveValueOf([1])
                expect(none.append(just42)).toHaveValueOf(42)
                expect(none.append(none)).toTypeMatch("None")
            })
    
            it("empty (Just x) is Just (empty x). None if isNil(empty x)", () => {
                const emptyJust = Maybe.Just(Sum.from(42)).empty()
                expect(emptyJust).toTypeMatch("Just")
                expect(emptyJust.get()).toTypeMatch("Zero")
                expect(emptyJust.unwrap()).toBe(0)
    
                const emptyPrim = just42.empty()
                expect(emptyPrim).toTypeMatch("None");
                expect(emptyPrim.get()).toBe(undefined);
                
                const emptyArr = Maybe.Just([42]).empty()
                expect(emptyArr).toTypeMatch("Just")
                expect(emptyArr.get()).toStrictEqual([])
                
                const emptyObj = Maybe.Just({}).empty()
                expect(emptyObj).toTypeMatch("Just")
                expect(emptyObj.get()).toStrictEqual({})
    
                const emptyStr = Maybe.Just("Hi").empty()
                expect(emptyStr).toTypeMatch("Just")
                expect(emptyStr.get()).toStrictEqual("")
            })

            it("isEmpty should return true if None and isEmpty (Just x ) === isEmpty x", () => {
                expect(isEmpty(just42)).toBeFalsy()
                expect(isEmpty(Maybe.Just(""))).toBeTruthy()
                expect(isEmpty(none)).toBeTruthy()
                expect(Maybe.isEmpty(just42)).toBeFalsy()
                expect(Maybe.isEmpty(none)).toBeTruthy()
            })
        })

        describe("Filterable Maybe", () => {
            it("should return None on false predicate", () => {
                expect(Maybe.Just(42).filter(x => x !== 42)).toTypeMatch("None")
                const spy = Spy<any, boolean>()
                none.filter(spy)
                expect(spy.called).toBeFalsy()
            })
        })


        describe("Thenable Maybe", () => {
            it("should resolve on Just", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                Maybe.Just(42).toThenable().then(thenSpy,catchSpy)
                expect(thenSpy.calledWith(42)).toBeTruthy()
                expect(catchSpy.called).toBeFalsy()
            })
            it("should reject on None", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                Maybe.None().toThenable().then(thenSpy,catchSpy)
                expect(catchSpy.calledWith(undefined)).toBeTruthy()
                expect(thenSpy.called).toBeFalsy()
            })
        })

        describe("Foldable Maybe", () => {
            it("should call left on None", () => {
                const [left, right] = [Spy(() => 42), Spy()]
                const ret = Maybe.None().fold(left,right)
                expect(ret).toBe(42)
                expect(left).toHaveBeenCalled()
                expect(right).not.toHaveBeenCalled()
            })
            it("should call right on Just", () => {
                const [left, right] = [Spy(), Spy(() => 42)]
                const ret = Maybe.Just(41).fold(left,right)
                expect(ret).toBe(42)
                expect(right).toHaveBeenCalled()
                expect(right).toHaveBeenCalledWith(41)
                expect(left).not.toHaveBeenCalled()
            })
        })
    })
})