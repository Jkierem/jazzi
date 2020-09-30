import { empty , isEmpty } from 'ramda'
import Mult from '../Mult';
import { getType } from '../_internals';

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
    describe("constructors", () => {
        it("should return One if 1, Mult otherwise", () => {
            expect(Mult.from(42)).toTypeMatch("Mult") 
            expect(Mult.from(1)).toTypeMatch("One") 
        })
    })
})