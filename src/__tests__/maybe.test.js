import Maybe from '../Maybe'
import Result from '../Result'
import { isEmpty } from 'ramda'
import Sum from '../Sum'

describe("Maybe", () => {
    describe("object methods", () => {
        const just42 = Maybe.Just(42)
        const none = Maybe.None()
        const justInc = Maybe.Just(x => x + 1)
        const justArr1 = Maybe.Just([1])
        const justArr2 = Maybe.Just([2])
    
        it("should match", () => {
            expect(just42).toTypeMatch("Just");
            expect(none).toTypeMatch("None");
            expect(Maybe.match(just42,{ Just: () => true, _ : () => false })).toBeTruthy()
            expect(Maybe.match(none,{ None: () => true, _ : () => false })).toBeTruthy()
            expect(Maybe.match(42,({ Just: () => false, None: () => false, _: x => x }))).toBe(42)
        })

        it("should return inner value", () => {
            expect(just42.get()).toBe(42)
            expect(none.get()).toBeUndefined();
        })

        it("should chain", () => {
            const expectValue = v => x => {
                expect(x).toBe(v)
                return x
            }
            let called = false
            const fn = () => called = true;
            expect(just42.chain(expectValue(42))).toBe(42);
            expect(none.chain(fn)).toTypeMatch("None");
            expect(called).toBe(false);
        })

        it("isEmpty should return true if None and isEmpty (Just x ) === isEmpty x", () => {
            expect(isEmpty(just42)).toBeFalsy()
            expect(isEmpty(Maybe.Just(""))).toBeTruthy()
            expect(isEmpty(none)).toBeTruthy()
            expect(just42.isEmpty()).toBeFalsy()
            expect(Maybe.Just("").isEmpty()).toBeTruthy()
            expect(none.isEmpty()).toBeTruthy()
            expect(Maybe.isEmpty(just42)).toBeFalsy()
            expect(Maybe.isEmpty(none)).toBeTruthy()
        })

        it("onNone should return inner value on Just, extract argument otherwise", () => {
            expect(just42.onNone()).toBe(42)
            expect(none.onNone(() => 43)).toBe(43)
            expect(none.onNone(43)).toBe(43)
        })

        it("should allow to check if Just or None", () => {
            expect(just42.isJust()).toBeTruthy()
            expect(just42.isNone()).toBeFalsy()
            expect(none.isJust()).toBeFalsy()
            expect(none.isNone()).toBeTruthy()
        })
    
        it("should not call map when is none", () => {
            let called = false;
            const fn = () => called = true;
            none.map(fn)
            expect(called).toBeFalsy();
        })

        it("should not call effect when none and effect should leave inner value as is", () => {
            let calls = 0;
            const fn = (x) => {
                calls++;
                return 0;
            }
            none.effect(fn)
            const val = just42.effect(fn).get();
            expect(val).toBe(42)
            expect(calls).toBe(1);
        })

        it("should return new object on map", () => {
            const mapped = just42.map(x => x);
            expect(mapped).not.toBe(just42)
            expect(mapped.equals(just42)).toBeTruthy();
        })
    
        it("should handle equality by inner value", () => {
            expect(just42.equals(Maybe.Just(42))).toBeTruthy();
            expect(just42.equals(Maybe.Just(43))).toBeFalsy();
            expect(just42.equals(just42)).toBeTruthy()
            expect(just42.equals(42)).toBeFalsy()
            expect(none.equals(Maybe.None())).toBeTruthy()
            expect(none.equals(42)).toBeFalsy()
            expect(none.equals(just42)).toBeFalsy()
            
            expect(Maybe.equals(just42,Maybe.Just(42))).toBeTruthy();
            expect(Maybe.equals(just42,Maybe.Just(43))).toBeFalsy();
            expect(Maybe.equals(just42,just42)).toBeTruthy()
            expect(Maybe.equals(just42,42)).toBeFalsy()
            expect(Maybe.equals(none,Maybe.None())).toBeTruthy()
        })

        it("applicative -> should apply inner function", () => {
            expect(justInc.apply(just42).get()).toBe(43)
            expect(justInc.apply(none)).toTypeMatch("None")
            expect(none.apply(just42)).toTypeMatch("None")
        })

        it("semigroup -> should concat inner values", () => {
            expect(justArr1.concat(just42).get()).toStrictEqual([1,42])
            expect(justArr1.concat(justArr2).get()).toStrictEqual([1,2])
            expect(justArr1.concat(none).get()).toStrictEqual([1])
            expect(none.concat(just42).get()).toBe(42)
            expect(none.concat(none)).toTypeMatch("None")
        })

        it("show -> should return string representation", () => {
            expect(just42.toString()).toBe("[Maybe => Just 42]")
            expect(none.toString()).toBe("[Maybe => None]")
        })

        it("monoid -> should append inner values",() => {
            expect(justArr1.append(just42).get()).toStrictEqual([1,42])
            expect(justArr1.append(justArr2).get()).toStrictEqual([1,2])
            expect(justArr1.append(none).get()).toStrictEqual([1])
            expect(none.append(just42).get()).toBe(42)
            expect(none.append(none)).toTypeMatch("None")
        })

        it("monoid -> empty (Just x) is Just (empty x). None if isNil(empty x)", () => {
            const emptyJust = Maybe.Just(Sum.from(42)).empty()
            expect(emptyJust.get()).toTypeMatch("Zero")
            expect(emptyJust.unwrap()).toBe(0)
            expect(just42.empty().get()).toBe(undefined);
            expect(justArr1.empty().get()).toStrictEqual([])
            expect(Maybe.Just({}).empty().get()).toStrictEqual({})
            expect(Maybe.Just("Hi").empty().get()).toStrictEqual("")
        })

        it("filterable -> should filter inner value", () => {
            expect(Maybe.Just([1,2,3,4]).filter(x => x % 2 === 0).get()).toStrictEqual([2,4])
            const called = false;
            const spy = () => { called = true }
            none.filter(spy)
            expect(called).toBeFalsy()
        })
    })

    describe("constructors", () => {
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
            ["from"       , "truthy value"   , true  , "just" ],
            ["fromFalsy"  , "truthy value"   , true  , "just" ],
            ["fromArray"  , "non empty array", [ 1 ] , "just" ],
            ["fromNullish", "neither null or undefined", 42 , "just" ],
            ["fromEmpty"  , "non-empty object",{ a: 42 }, "just" ],
            ["fromEmpty"  , "non-empty array", [ 42 ]   , "just" ],
            ["fromEmpty"  , "something else" , null     , "just" ],
            ["fromResult" , "Result.Ok"      , Result.Ok(42), "just"],
            ["fromResult" , "Result.Err"     , Result.Err(42), "none"]
        ].forEach(([cons,label,val,type]) => {
            it(`${cons} should create a ${type} with ${label}`,() => {
                expect(Maybe[cons](val)).toTypeMatch(type);
            })
        })

        const is42 = x => x === 42
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

        it("monad -> pure should return Just", () => {
            expect(Maybe.pure(42)).toTypeMatch("Just")
        })

        it("monoid -> empty should be none", () => {
            expect(Maybe.empty()).toTypeMatch("None")
        })
    })
})