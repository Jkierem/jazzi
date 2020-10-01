import Sum from '../Sum';
import { Filterable, Union } from '../Union'
const trivialImpl = (...tcs) => {
    const defs = {
        trivials: ["Trivial"],
        identities: ["Id"]
    }
    return Union("Trivial",{ Trivial: x => x, Id: x => x },tcs.map(t => t(defs))).constructors({});
}

describe("typeclasses", () => {
    describe("filterable",() => {
        const Type = trivialImpl(Filterable);
        it("trivial -> should filter inner value", () => {
            expect(Type.Trivial([1,2,3,4]).filter(x => x % 2 == 0).get()).toStrictEqual([2,4])
        })
        it("identity -> should do nothing",() => {
            expect(Type.Id(42).filter(x => x > 40).get()).toBe(42)
        })
    })

    describe("monoid", () => {
        it("should have an accumulate function in the type rep", () => {
            const sum42 = Sum.accumulate([10,12,20].map(Sum.of));
            expect(sum42.get()).toBe(42)
        })
        it("foldMap -> should create monoids and combine them", () => {
            expect(Sum.foldMap([10,12,20]).unwrap()).toBe(42)
        })
    })
})