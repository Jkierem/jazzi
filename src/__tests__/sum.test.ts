import Sum from "../Sum"
import { isEmpty } from "../_internals"
import { Spy } from "../__test-utils"

describe("Sum", () => {
    describe("Constructors", () => {
        it("should return Sum if not zero", () => {
            const s42 = Sum.of(42)
            expect(s42).toHaveValueOf(42)
            expect(s42).toTypeMatch("Sum")
        })
        it("should return Zero if zero", () => {
            const s0 = Sum.of(0)
            expect(s0).toHaveValueOf(0)
            expect(s0).toTypeMatch("Zero")
        })
    })

    describe("Type Representatives", () => {
        describe("Eq Rep", () => {
            it("should perform equality check by means of type rep", () => {
                const zero = Sum.Zero()
                const s0 = Sum.Sum(0)
                const s1 = Sum.Sum(1)
                const s1cpy = Sum.Sum(1)
                expect(Sum.equals(s1,s1cpy)).toBeTruthy()
                expect(Sum.equals(s1,zero)).toBeFalsy()
                expect(Sum.equals(s0,zero)).toBeTruthy()
            })
        })

        describe("Monoid Rep", () => {
            it("should accumulate Sum values by using addition", () => {
                const sums = [0,1,2,3].map(Sum.of);
                const s6 = Sum.accumulate(sums)
                expect(s6).toHaveValueOf(6)
                expect(s6).toTypeMatch("Sum")
            })

            it("should foldMap correctly with addition", () => {
                const s6 = Sum.foldMap([0,1,2,3])
                expect(s6).toHaveValueOf(6)
                expect(s6).toTypeMatch("Sum")
                
                const sHey = Sum.foldMap(["H","e","y"] as any[])
                expect(sHey).toHaveValueOf("Hey")
                expect(sHey).toTypeMatch("Sum")
            })

            it("should return zero on Sum.empty", () => {
                expect(Sum.empty()).toTypeMatch("Zero")
                expect(Sum.empty().equals(Sum.Zero())).toBeTruthy()
            })
        })
    })

    describe("Typeclass Instances", () => {
        describe("Eq Sum", () => {
            it("should compare by inner value", () => {
                const zero = Sum.Zero()
                const s0 = Sum.Sum(0)
                const s1 = Sum.Sum(1)
                const s1cpy = Sum.Sum(1)
                expect(s1.equals(s1cpy)).toBeTruthy()
                expect(s1.equals(zero)).toBeFalsy()
                expect(s0.equals(zero)).toBeTruthy()
            })
        })
    
        describe("Functor Sum", () => {
            it("should return new object on fmap", () => {
                const s41 = Sum.of(41)
                const s42 = s41.fmap(x => x + 1)
                expect(s41).not.toBe(s42)
                expect(s41).toHaveValueOf(41)
                expect(s42).toHaveValueOf(42)
            })
    
            it("should not call fn if zero", () => {
                const sp = Spy<number[],number>()
                Sum.Zero().fmap(sp)
                expect(sp).not.toHaveBeenCalled()
            })
    
            it("should map to constant", () => {
                const s41 = Sum.of(41)
                const s42 = s41.mapTo(42)
                expect(s41).not.toBe(s42)
                expect(s41).toHaveValueOf(41)
                expect(s42).toHaveValueOf(42)
            })
        })
    
        describe("Semigroup Sum", () => {
            it("should add inner values on concat", () => {
                const s1 = Sum.of(1)
                const s41 = Sum.of(41)
                const s42 = s1.sconcat(s41)
                expect(s42).toHaveValueOf(42)
            })
    
            it("zero should be the identity of concat", () => {
                const zero = Sum.Zero()
                const s42 = Sum.of(42)
                expect(s42.concat(zero)).toBe(s42)
                expect(zero.concat(s42)).toBe(s42)
            })
        })
    
        describe("Monoid Sum", () => {
            it("should add inner values on append", () => {
                const s1 = Sum.of(1)
                const s41 = Sum.of(41)
                const s42 = s1.mappend(s41)
                expect(s42).toHaveValueOf(42)
            })
    
            it("zero should be the identity of append", () => {
                const zero = Sum.Zero()
                const s42 = Sum.of(42)
                expect(s42.append(zero)).toBe(s42)
                expect(zero.append(s42)).toBe(s42)
            })
    
            it("empty should return zero", () => {
                const zero42 = Sum.of(42).empty()
                expect(zero42.equals(Sum.Zero())).toBeTruthy()
                expect(zero42).toTypeMatch("Zero")
                expect(zero42).toHaveValueOf(0)
                expect(isEmpty(zero42)).toBeTruthy()
            })
        })
    
        describe("Thenable Sum", () => {
            it("should reject on zero", async () => {
                await expect(Sum.Zero().toPromise()).rejects.toEqual(0)
            })
    
            it("should resolve on sum with inner value", async () => {
                await expect(Sum.Sum(42).toPromise()).resolves.toEqual(42)
            })
    
            it("then should call first function on sum", () => {
                const res = Spy<[number],number>()
                const rej = Spy<[number],number>()
                Sum.Sum(42).then(res, rej)
                expect(res).toHaveBeenCalled()
                expect(res).toHaveBeenCalledWith(42)
                expect(rej).not.toHaveBeenCalled()
            })
            it("then should call second function on zero", () => {
                const res = Spy<[number],number>()
                const rej = Spy<[number],number>()
                Sum.Zero().then(res, rej)
                expect(rej).toHaveBeenCalled()
                expect(rej).toHaveBeenCalledWith(0)
                expect(res).not.toHaveBeenCalled()
            })
    
            it("catch should work like then on error", () => {
                const rej = Spy<[number],number>()
                Sum.Zero().catch(rej);
                expect(rej).toHaveBeenCalled()
                expect(rej).toHaveBeenCalledWith(0)
                rej.reset()
                Sum.Sum(42).catch(rej)
                expect(rej).not.toHaveBeenCalled()
            })
        })
    
        describe("Show Sum", () => {
            it("should return correct representation", () => {
                expect(Sum.Sum(42).show()).toBe("[Sum => Sum 42]")
                expect(Sum.Zero().show()).toBe("[Sum => Zero 0]")
            })
        })
    })

})