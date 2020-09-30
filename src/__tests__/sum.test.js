import { empty , isEmpty } from 'ramda'
import Sum from '../Sum';

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
    describe("constructors", () => {
        it("should return Zero if 0, Sum otherwise", () => {
            expect(Sum.from(42)).toTypeMatch("Sum") 
            expect(Sum.from(0)).toTypeMatch("Zero") 
        })
    })
})