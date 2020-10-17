import { empty, isEmpty } from "ramda"
import First from "../First"
import Last from "../Last"
import Max from "../Max"
import Min from "../Min"
import { foldMap } from "../_tools"

describe("Monoids", () => {
    describe("Max -> Monoid for the maximum value", () => {
        describe("methods", () => {
            it("empty -> should be (Max -Inf)", () => {
                expect(Max.empty().get()).toBe(-Infinity)
                expect(empty(Max).get()).toBe(-Infinity)
                expect(empty(Max.of(42)).get()).toBe(-Infinity)
            })
            it("mappend -> should be the highest value", () => {
                expect(Max.of(42).append(Max.of(40)).get()).toBe(42)
                expect(Max.of(40).append(Max.of(42)).get()).toBe(42)
            })
            it("isEmpty -> should be true only if (Max -Inf)", () => {
                expect(isEmpty(Max.of(42))).toBeFalsy()
                expect(isEmpty(Max.of(-Infinity))).toBeTruthy()
                expect(isEmpty(Max.empty())).toBeTruthy()
            })
            it("foldMap -> should return the max value", () => {
                expect(foldMap(Max, [1,2,3,2,1]).get()).toBe(3)
            })
        })
        describe("constructors", () => {
            it("should behave like a boxed value",() => {
                expect(Max.of(42)).toTypeMatch("Max")
                expect(Max.from(42)).toTypeMatch("Max")
                expect(Max.empty()).toTypeMatch("Max")
            })
        })
    })
    describe("Min -> Monoid for the minimum value", () => {
        describe("methods", () => {
            it("empty -> should be (Min Inf)", () => {
                expect(Min.empty().get()).toBe(Infinity)
                expect(empty(Min).get()).toBe(Infinity)
                expect(empty(Min.of(42)).get()).toBe(Infinity)
            })
            it("mappend -> should be the lowest value", () => {
                expect(Min.of(42).append(Min.of(40)).get()).toBe(40)
                expect(Min.of(40).append(Min.of(42)).get()).toBe(40)
            })
            it("isEmpty -> should be true only if (Min Inf)", () => {
                expect(isEmpty(Min.of(42))).toBeFalsy()
                expect(isEmpty(Min.of(Infinity))).toBeTruthy()
                expect(isEmpty(Min.empty())).toBeTruthy()
            })
            it("foldMap -> should return the min value", () => {
                expect(foldMap(Min, [5,2,4,2,6]).get()).toBe(2)
            })
        })
        describe("constructors", () => {
            it("should behave like a boxed value",() => {
                expect(Min.of(42)).toTypeMatch("Min")
                expect(Min.from(42)).toTypeMatch("Min")
                expect(Min.empty()).toTypeMatch("Min")
            })
        })
    })
    describe("First -> Monoid for the first element", () => {
        describe("methods", () => {
            it("empty -> should be (First undefined)", () => {
                expect(First.empty().get()).toBe(undefined)
                expect(empty(First).get()).toBe(undefined)
                expect(empty(First.of(42)).get()).toBe(undefined)
            })
            it("mappend -> should be the left value", () => {
                expect(First.of(42).append(First.of(40)).get()).toBe(42)
                expect(First.of(40).append(First.of(42)).get()).toBe(40)
            })
            it("isEmpty -> should be true only if NotFirst", () => {
                expect(isEmpty(First.of(42))).toBeFalsy()
                expect(isEmpty(First.of(42).empty())).toBeTruthy()
                expect(isEmpty(First.empty())).toBeTruthy()
            })
            it("foldMap -> should return the first value", () => {
                expect(foldMap(First,[1,2,3]).get()).toBe(1)
            })
        })
        describe("constructors", () => {
            it("should behave like a boxed value",() => {
                expect(First.of(42)).toTypeMatch("First")
                expect(First.from(42)).toTypeMatch("First")
                expect(First.empty()).toTypeMatch("First")
            })
        })
    })
    describe("Last -> Monoid for the last element", () => {
        describe("methods", () => {
            it("empty -> should be (Last undefined)", () => {
                expect(Last.empty().get()).toBe(undefined)
                expect(empty(Last).get()).toBe(undefined)
                expect(empty(Last.of(42)).get()).toBe(undefined)
            })
            it("mappend -> should be the right value", () => {
                expect(Last.of(42).append(Last.of(40)).get()).toBe(40)
                expect(Last.of(40).append(Last.of(42)).get()).toBe(42)
            })
            it("isEmpty -> should be true only if (Last undefined)", () => {
                expect(isEmpty(Last.of(42))).toBeFalsy()
                expect(isEmpty(Last.of(42).empty())).toBeTruthy()
                expect(isEmpty(Last.empty())).toBeTruthy()
            })
            it("foldMap -> should return the last value", () => {
                expect(foldMap(Last,[1,2,3]).get()).toBe(3)
            })
        })
        describe("constructors", () => {
            it("should behave like a boxed value",() => {
                expect(Last.of(42)).toTypeMatch("Last")
                expect(Last.from(42)).toTypeMatch("Last")
                expect(Last.empty()).toTypeMatch("Last")
            })
        })
    })
})