import { empty, isEmpty } from "ramda"
import First from "../First"
import Last from "../Last"
import Max from "../Max"
import Min from "../Min"
import Mult from "../Mult"
import Merge from "../Merge"
import Sum from "../Sum"
import { Spy } from "../_internals"
import { foldMap } from "../_tools"

const thenTest = (Type,val=42) => {
    const resolveVal = Type.of(val)
    const rejectVal = Type.empty()
    it("should call resolve on non-empty", () => {
        const thenSpy = Spy()
        const catchSpy = Spy()
        resolveVal.then(thenSpy,catchSpy)
        expect(thenSpy.calledWith(resolveVal.get())).toBeTruthy()
        expect(catchSpy.called).toBeFalsy()
    })

    it("should call reject on empty", () => {
        const thenSpy = Spy()
        const catchSpy = Spy()
        rejectVal.then(thenSpy,catchSpy)
        expect(catchSpy.calledWith(rejectVal.get())).toBeTruthy()
        expect(thenSpy.called).toBeFalsy()
    })

    it("should cast to promise that resolves", async () => {
        const t = await resolveVal.toPromise();
        expect(t).toBe(42)
    })
    
    it("should cast to promise that rejects", async () => {
        try {
            await rejectVal.toPromise();
        } catch (t) {
            expect(t).toBe(rejectVal.get())
        }
    })
}

describe("Monoids", () => {

    describe("Sum -> Monoid of number over addition",() => {
        describe("methods", () => {
            it("monoid -> mappend is addition of inner values", () => {
                expect(Sum.from(42).append(Sum.from(1)).get()).toBe(43);
            })
    
            it("monoid -> empty should be Zero", () => {
                expect(empty(Sum)).toTypeMatch("Zero")
                expect(empty(Sum.from(42))).toTypeMatch("Zero")
                expect(Sum.from(42).empty()).toTypeMatch("Zero")
            })
    
            it("monoid -> isEmpty true only if Zero",() => {
                expect(isEmpty(Sum.from(42))).toBeFalsy();
                expect(isEmpty(Sum.from(0))).toBeTruthy();
            })
        })

        describe("Thenable", () => {
            thenTest(Sum)
        })

        describe("constructors", () => {
            it("should return Zero if 0, Sum otherwise", () => {
                expect(Sum.from(42)).toTypeMatch("Sum") 
                expect(Sum.from(0)).toTypeMatch("Zero") 
            })
        })
    })

    describe("Mult -> Monoid of numbers over multiplication",() => {
        describe("methods", () => {
            it("monoid -> mappend is multiplication of inner values", () => {
                expect(Mult.from(21).append(Mult.from(2)).get()).toBe(42);
            })
    
            it("monoid -> empty should be One", () => {
                expect(empty(Mult)).toTypeMatch("One")
                expect(empty(Mult.from(42))).toTypeMatch("One")
                expect(Mult.from(42).empty()).toTypeMatch("One")
            })
    
            it("monoid -> isEmpty true only if One",() => {
                expect(isEmpty(Mult.from(42))).toBeFalsy();
                expect(isEmpty(Mult.from(1))).toBeTruthy();
            })
        })

        describe("Thenable", () => {
            thenTest(Mult)
        })

        describe("constructors", () => {
            it("should return One if 1, Mult otherwise", () => {
                expect(Mult.from(42)).toTypeMatch("Mult") 
                expect(Mult.from(1)).toTypeMatch("One") 
            })
        })
    })

    describe("Merge -> Monoid of object over merge operation", () => {
        describe("methods", () => {
            const mA = Merge.from({ a: 42 });
            const mB = Merge.from({ b: 42 });
    
            it("monoid -> mappend is merge of inner values", () => {
                expect(mA.mappend(mB).get()).toStrictEqual({ a: 42, b: 42 });
            })
    
            it("monoid -> empty should be Empty", () => {
                expect(empty(Merge)).toTypeMatch("Empty")
                expect(empty(Merge.from(42))).toTypeMatch("Empty")
                expect(Merge.from(42).empty()).toTypeMatch("Empty")
            })
    
            it("monoid -> isEmpty true only if Zero",() => {
                expect(isEmpty(Merge.from({a: 42}))).toBeFalsy();
                expect(isEmpty(Merge.from({}))).toBeTruthy();
            })
        })

        describe("Thenable", () => {
            thenTest(Merge)
        })

        describe("constructors",() => {
            it("should return empty on {}, Merge otherwise",() => {
                expect(Merge.from({})).toTypeMatch("Empty")
                expect(Merge.from({ a: 42 })).toTypeMatch("Merge")
                expect(Merge.from(42)).toTypeMatch("Merge")
            })
        })
    })

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

        describe("Thenable", () => {
            thenTest(Max)
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

        describe("Thenable", () => {
            thenTest(Min)
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

        describe("Thenable", () => {
            thenTest(First)
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

        describe("Thenable", () => {
            thenTest(Last)
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