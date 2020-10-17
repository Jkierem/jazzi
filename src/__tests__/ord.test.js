import { Ord , Ordering} from '../Union'
import { Union } from '../Union';

describe("Ord", () => {
    const { LT, EQ, GT } = Ordering;
    describe("Ordering", () => {
        it("should be ordered LT -> EQ -> GT", () => {
            expect(LT.lessThan(EQ)).toBeTruthy()
            expect(EQ.lessThan(GT)).toBeTruthy()
        })
        it("should use enum string reps", () => {
            expect(LT.show()).toBe("[Ordering => LT]")
            expect(EQ.show()).toBe("[Ordering => EQ]")
            expect(GT.show()).toBe("[Ordering => GT]")
        })
    })

    describe("Ord impls", () => {
        describe("lessThanOrEqual based", () => {
            const Test = Union("Test",{
                Box: x => x
            },[
                Ord({ overrides: {
                    lessThanOrEqual(o){
                        return this.get() <= o.get()
                    }
                }})
            ]).constructors({});

            const test40 = Test.Box(40)
            const test42 = Test.Box(42)

            it("should have lessThanOrEqual", () => {
                expect(test40.lessThanOrEqual(test42)).toBeTruthy()
                expect(test40.lessThanOrEqual(test40)).toBeTruthy()
                expect(test42.lessThanOrEqual(test40)).toBeFalsy()
            })
            it("should have compare", () => {
                expect(test40.compare(test42)).toTypeMatch("LT")
                expect(test40.compare(test40)).toTypeMatch("EQ")
                expect(test42.compare(test40)).toTypeMatch("GT")
            })
            it("should have greaterThan", () => {
                expect(test40.greaterThan(test42)).toBeFalsy()
                expect(test40.greaterThan(test40)).toBeFalsy()
                expect(test42.greaterThan(test40)).toBeTruthy()
            })
            it("should have greaterThanOrEqual", () => {
                expect(test40.greaterThanOrEqual(test42)).toBeFalsy()
                expect(test40.greaterThanOrEqual(test40)).toBeTruthy()
                expect(test42.greaterThanOrEqual(test40)).toBeTruthy()
            })
        })
        describe("compare based", () => {
            const Test = Union("Test",{
                Box: x => x
            },[
                Ord({ overrides: {
                    compare(o){
                        const getSign = x => x < 0 ? -1 : x > 0 ? 1 : 0
                        return [LT,EQ,GT][getSign(this.get() - o.get()) + 1]
                    }
                }})
            ]).constructors({});

            const test40 = Test.Box(40)
            const test42 = Test.Box(42)

            it("should have lessThanOrEqual", () => {
                expect(test40.lessThanOrEqual(test42)).toBeTruthy()
                expect(test40.lessThanOrEqual(test40)).toBeTruthy()
                expect(test42.lessThanOrEqual(test40)).toBeFalsy()
            })
            it("should have compare", () => {
                expect(test40.compare(test42)).toTypeMatch("LT")
                expect(test40.compare(test40)).toTypeMatch("EQ")
                expect(test42.compare(test40)).toTypeMatch("GT")
            })
            it("should have greaterThan", () => {
                expect(test40.greaterThan(test42)).toBeFalsy()
                expect(test40.greaterThan(test40)).toBeFalsy()
                expect(test42.greaterThan(test40)).toBeTruthy()
            })
            it("should have greaterThanOrEqual", () => {
                expect(test40.greaterThanOrEqual(test42)).toBeFalsy()
                expect(test40.greaterThanOrEqual(test40)).toBeTruthy()
                expect(test42.greaterThanOrEqual(test40)).toBeTruthy()
            })
        })
        describe("order based", () => {
            const Test = Union("Test",{
                Box1: x => x,
                Box2: x => x
            },[
                Ord({ order: ["Box1","Box2"]})
            ]).constructors({});

            const test40 = Test.Box1(40)
            const test42 = Test.Box2(42)

            it("should have lessThanOrEqual", () => {
                expect(test40.lessThanOrEqual(test42)).toBeTruthy()
                expect(test40.lessThanOrEqual(test40)).toBeTruthy()
                expect(test42.lessThanOrEqual(test40)).toBeFalsy()
            })
            it("should have compare", () => {
                expect(test40.compare(test42)).toTypeMatch("LT")
                expect(test40.compare(test40)).toTypeMatch("EQ")
                expect(test42.compare(test40)).toTypeMatch("GT")
            })
            it("should have greaterThan", () => {
                expect(test40.greaterThan(test42)).toBeFalsy()
                expect(test40.greaterThan(test40)).toBeFalsy()
                expect(test42.greaterThan(test40)).toBeTruthy()
            })
            it("should have greaterThanOrEqual", () => {
                expect(test40.greaterThanOrEqual(test42)).toBeFalsy()
                expect(test40.greaterThanOrEqual(test40)).toBeTruthy()
                expect(test42.greaterThanOrEqual(test40)).toBeTruthy()
            })
        })
    })
    describe("impl not met", () => {
        it("should throw if implementation is not met", () => {
            expect(() => {
                Union("Test",{
                    Box: x => x,
                },[
                    Ord({})
                ]).constructors({});
            }).toThrow()
        })
    })
})