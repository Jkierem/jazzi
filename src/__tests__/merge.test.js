import { empty, isEmpty } from "ramda";
import Merge from "../Merge"

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
            expect(Merge.from({a: 42}).isEmpty()).toBeFalsy();
            expect(Merge.from({}).isEmpty()).toBeTruthy();
        })
    })
    describe("constructors",() => {
        it("should return empty on {}, Merge otherwise",() => {
            expect(Merge.from({})).toTypeMatch("Empty")
            expect(Merge.from({ a: 42 })).toTypeMatch("Merge")
            expect(Merge.from(42)).toTypeMatch("Merge")
        })
    })
})