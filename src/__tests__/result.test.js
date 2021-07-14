import Maybe from '../Maybe'
import Result from '../Result'
import { Spy } from '../_internals/test-utils';

describe("Result", () => {
    describe("methods", () => {
        const ok42 = Result.Ok(42);
        const err42 = Result.Err(42)
        const okInc = Result.Ok(x => x + 1)

        it("should return inner value", () => {
            expect(ok42.get()).toBe(42)
            expect(err42.get()).toBe(42)
        })

        it("should map to new object if Ok, ignore otherwise", () => {
            const mappedOk = ok42.map(x => x);
            const mappedErr = err42.map(x => x);
            expect(ok42).not.toBe(mappedOk);
            expect(mappedErr).toBe(err42);
        })

        it("should not call effect when Err and effect should leave inner value as is", () => {
            const fn = Spy(() => 0)
            err42.effect(fn)
            const val = ok42.effect(fn).get();
            expect(val).toBe(42)
            expect(fn.callCount).toBe(1);
        })

        it("should call chain with inner value if Ok, nothing otherwise", () => {
            expect(ok42.chain(x => 42)).toBe(42)
            expect(err42.chain(x => x == 42).isErr()).toBeTruthy()
        })

        it("should apply ok applicatives", () => {
            expect(ok42.apply(okInc).get()).toBe(43)
            expect(err42.apply(okInc)).toTypeMatch("Err")
            expect(err42.apply()).toTypeMatch("Err")
        })

        it("should swap context from an ok to Err and vice versa", () => {
            const swappedOk  = ok42.swap();
            const swappedErr = err42.swap();

            expect(swappedOk).toTypeMatch("Err")
            expect(swappedOk.get()).toBe(42)
            expect(swappedErr).toTypeMatch("Ok")
            expect(swappedErr.get()).toBe(42)
        })

        it("should compare by type and inner value", () => {
            expect(err42.equals(Result.Err(42))).toBeTruthy();
            expect(err42.equals(Result.Err(43))).toBeFalsy();
            expect(err42.equals(Result.Ok(42))).toBeFalsy();
            expect(err42.equals(42)).toBeFalsy()

            expect(ok42.equals(Result.Ok(42))).toBeTruthy();
            expect(ok42.equals(Result.Ok(43))).toBeFalsy();
            expect(ok42.equals(Result.Err(42))).toBeFalsy();
            expect(ok42.equals(42)).toBeFalsy()
        })

        it("onErr should return inner value if Ok, extract argument otherwise", () => {
            expect(ok42.onErr()).toBe(42);
            expect(err42.onErr(() => 43)).toBe(43)
            expect(err42.onErr(43)).toBe(43)
        })

        it("should return true/false for appropiate 'is' function", () => {
            expect(ok42.isOk()).toBeTruthy();
            expect(ok42.isErr()).toBeFalsy();
            expect(err42.isErr()).toBeTruthy();
            expect(err42.isOk()).toBeFalsy();
        })

        it("bimap should call f on ok, g on Err", () => {
            const spyF = Spy();
            const spyG = Spy();
            const reset = () => { spyF.reset(); spyG.reset() }

            ok42.bimap(spyF,spyG)
            expect(spyF.called).toBeTruthy()
            expect(spyG.called).toBeFalsy()
            reset();
            err42.bimap(spyF,spyG)
            expect(spyF.called).toBeFalsy()
            expect(spyG.called).toBeTruthy()
        })

        it("fold should call g on ok, f on Err", () => {
            const spyF = Spy();
            const spyG = Spy();
            const reset = () => { 
                spyF.reset(); 
                spyG.reset() 
            }

            ok42.fold(spyF,spyG)
            expect(spyF.called).toBeFalsy()
            expect(spyG.called).toBeTruthy()
            reset();
            err42.fold(spyF,spyG)
            expect(spyF.called).toBeTruthy()
            expect(spyG.called).toBeFalsy()
        })

        it("filter should swap on false predicate if Ok. Nothing otherwise", () => {
            expect(ok42.filter(x => x !== 42)).toTypeMatch("Err")
            expect(ok42.filter(x => x === 42)).toTypeMatch("Ok")
            expect(err42.filter(x => x === 42)).toTypeMatch("Err")
        })

        it("mapError should map on Err. Nothing otherwise", () => {
            const mapSpy = Spy();
            ok42.mapError(mapSpy);
            expect(mapSpy.called).toBeFalsy();
            err42.mapError(mapSpy);
            expect(mapSpy.called).toBeTruthy();
        })

        describe("Thenable", () => {
            it("should resolve on Ok", async () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                await Result.Ok(42).then(thenSpy,catchSpy)
                expect(thenSpy.calledWith(42)).toBeTruthy()
                expect(catchSpy.called).toBeFalsy()
            })
            it("should reject on Err", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                Result.Err(42).then(thenSpy,catchSpy)
                expect(catchSpy.calledWith(42)).toBeTruthy()
                expect(thenSpy.called).toBeFalsy()
            })
        })
    })
    describe("constructors", () => {
        const error = new Error(42);
        const truthy = 42;
        const falsy = 0;
        const just = Maybe.Just(42);
        const none = Maybe.None();
        const fnFails = () => { throw 42 };

        [
            ["of", "Err", "function that throws", fnFails],
            ["of", "Ok", "function that returns", () => truthy],
            ["from", "Err", "function that throws", fnFails],
            ["from", "Ok", "function that returns", () => truthy],
            ["fromError", "Err", "Error object", error],
            ["fromError", "Ok", "Non-Error value", truthy],
            ["fromFalsy", "Err", "falsy value", falsy],
            ["fromFalsy", "Ok", "truthy value", truthy],
            ["fromMaybe", "Err", "None", none],
            ["fromMaybe", "Ok", "Just", just],
            ["attempt", "Err", "function that throws", fnFails],
            ["attempt", "Ok", "function that returns", () => 42]
        ].forEach(([ cons, type, value, arg ]) => {
            it(`should return ${type} when "${cons}" is called with ${value}`, () => {
                expect(Result[cons](arg)).toTypeMatch(type)
            })
        })

        const is42 = x => x === 42
        const True = () => true;
        const False = () => false;

        it("fromPredicate should create an Ok with a predicate that returns true", () => {
            expect(Result.fromPredicate(is42,42)).toTypeMatch("Ok")
            expect(Result.fromPredicate(True)).toTypeMatch("Ok")
        })

        it("fromPredicate should create an Err with a predicate that returns false", () => {
            expect(Result.fromPredicate(is42,2)).toTypeMatch("Err")
            expect(Result.fromPredicate(False)).toTypeMatch("Err")
        })
    })

})