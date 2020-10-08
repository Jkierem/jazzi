import { Either, Maybe, Result } from '../'
import { Spy } from '../_internals'

describe("Either", () => {
    describe("methods", () => {
        const right42 = Either.Right(42)
        const left42 = Either.Left(42)
        it("if functions -> should return call if matched type. Do nothing otherwise",() => {
            const spy = Spy(x => x + 1);
            expect(right42.ifLeft(spy).get()).toBe(42);
            expect(left42.ifRight(spy).get()).toBe(42);
            expect(spy.called).toBeFalsy();
            expect(right42.ifRight(spy).get()).toBe(43);
            expect(left42.ifLeft(spy).get()).toBe(43);
            expect(spy.callCount).toBe(2);
        })
        it("map aliases -> should map if matches type. Do nothing otherwise",() => {
            const spy = Spy(x => x + 1);
            expect(right42.mapLeft(spy).get()).toBe(42);
            expect(left42.mapRight(spy).get()).toBe(42);
            expect(spy.called).toBeFalsy();
            expect(right42.mapRight(spy).get()).toBe(43);
            expect(left42.mapLeft(spy).get()).toBe(43);
            expect(spy.callCount).toBe(2);
        })
        const eithers = [1,2,undefined,0,3,4,null].map(x => Either.fromFalsy(x,x));
        it("filters -> rights returns all Rights", () => {
            expect(Either.rights(eithers).every(r => r.isRight())).toBeTruthy()
        })
        it("filters -> lefts returns all Lefts", () => {
            const ls = Either.lefts(eithers)
            expect(ls.every(l => l.isLeft())).toBeTruthy()
            expect(ls.length).toBe(3)
        })
        it("filters -> paritions returns [lefts, rights]", () => {
            const [ ls, rs ] = Either.partition(eithers);
            expect(ls.every(l => l.isLeft())).toBeTruthy()
            expect(rs.every(r => r.isRight())).toBeTruthy()
        })
        describe("catamorphisms", () => {
            it("fold -> calls left function on Left, right function on Right", () => {
                const spyl = Spy(() => "left")
                const spyr = Spy(() => "right")
                expect(right42.fold(spyl,spyr)).toBe("right")
                expect(spyl.called).toBeFalsy()
                expect(spyr.called).toBeTruthy()
                expect(spyr.calledWith(42)).toBeTruthy()
                spyl.reset()
                spyr.reset()
                left42.fold(spyl,spyr);
                expect(left42.fold(spyl,spyr)).toBe("left")
                expect(spyr.called).toBeFalsy()
                expect(spyl.called).toBeTruthy()
                expect(spyl.calledWith(42)).toBeTruthy()
            })
            it("fromRight -> returns inner value if Right, fallback value otherwise", () => {
                expect(Either.fromRight(40,right42)).toBe(42)
                expect(Either.fromRight(40,left42)).toBe(40)
            })
            it("fromLeft -> returns inner value if Left, fallback value otherwise", () => {
                expect(Either.fromLeft(40,right42)).toBe(40)
                expect(Either.fromLeft(40,left42)).toBe(42)
            })
            const { Left, Right } = Either
            const collects = [ Left([1]), Right([1]), Left([2]), Left([3]), Right([2]), Right([3])];
            it("collectRights -> [Right (Monoid a)] => Right (Monoid a)", () => {
                expect(Either.collectRights(collects).get()).toStrictEqual([1,2,3])
            })
            it("collectLefts -> [Left (Monoid a)] => Left (Monoid a)", () => {
                expect(Either.collectLefts(collects).get()).toStrictEqual([1,2,3])
            })
        })
    })

    describe("constructors", () => {
        [
            ["of","truthy","Right","left value",42],
            ["of","not nullish","Right","left",false],
            ["of","undefined","Left","left",undefined],
            ["of","null","Left","left",null],
            ["fromFalsy","truthy","Right","left",42],
            ["fromFalsy","falsy","Left","left",false],
            ["fromPredicate","truthy return","Right",x => x == 42 , 42],
            ["fromPredicate","falsy return","Left"  ,x => x == 42 , 43],
            ["fromMaybe","Just","Right",Maybe.Just(42)],
            ["fromMaybe","None","Left",Maybe.None()],
            ["fromResult","Ok","Right",Result.Ok(42)],
            ["fromResult","Err","Left",Result.Err(42)],
        ].forEach( ([ cons, desc, type, ...args]) => {
            it(`${cons} called with a ${desc} value should return ${type}`, () => {
                expect(Either[cons](...args)).toTypeMatch(type)
            })
        })

        it("defaultTo should be just curried fromFalsy",() => {
            const defaultTo42 = Either.defaultTo(42);
            expect(defaultTo42(false).get()).toBe(42)
            expect(defaultTo42(43).get()).toBe(43)
        })
    })
})