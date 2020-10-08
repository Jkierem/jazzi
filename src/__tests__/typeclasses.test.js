import Sum from '../Sum';
import { Filterable, Monad, Union } from '../Union'
import { extractWith } from '../_internals';
const trivialImpl = (...tcs) => {
    const defs = {
        trivials: ["Trivial"],
        identities: ["Id"]
    }
    return Union("Trivial",{ Trivial: x => x, Id: x => x },tcs.map(t => t(defs))).constructors({});
}

describe("typeclasses", () => {
    describe("Filterable",() => {
        const Type = trivialImpl(Filterable);
        it("trivial -> should filter inner value", () => {
            expect(Type.Trivial([1,2,3,4]).filter(x => x % 2 == 0).get()).toStrictEqual([2,4])
        })
        it("identity -> should do nothing",() => {
            expect(Type.Id(42).filter(x => x > 40).get()).toBe(42)
        })
    })

    describe("Monoid", () => {
        it("should have an accumulate function in the type rep", () => {
            const sum42 = Sum.accumulate([10,12,20].map(Sum.of));
            expect(sum42.get()).toBe(42)
        })
        it("foldMap -> should create monoids and combine them", () => {
            expect(Sum.foldMap([10,12,20]).unwrap()).toBe(42)
        })
    })

    describe("Monad", () => {
        const Lazy = Union("Lazy",{ Lazy: x => x },[
            Monad({ 
            trivials: ["Lazy"] , 
            lazy: true,
            pure: "Lazy",
            overrides: {
                run: {
                    Lazy(){ 
                        return extractWith([])(this.get())
                    }
                }
            }
        })]).constructors({})
        const Eager = Union("Eager",{ Eager: x => x },[
            Monad({ 
                trivials: ["Eager"] , 
                pure: "Eager",
                lazy: false 
            })
        ]).constructors({})

        const meager = Eager.Eager(42);
        it("unsafeRun -> should do nothing unless provided implementation",() => {
            const mlazy = Lazy.Lazy(() => 50)
            expect(mlazy.unsafeRun()).toBe(50);
            expect(meager.unsafeRun()).toBe(meager);
        })

        it("do notation -> should work as if chaining on eager structs", () => {
            const e84 = Eager.do(function*(){
                const a = yield meager
                const b = yield meager
                return Eager.Eager(a + b)
            })
            expect(e84.get()).toBe(84)
        })
        it("do notation -> should work as if chaining on lazy structs", () => {
            const mlazy = Lazy.Lazy(50)
            const l100 = Lazy.do(function*(){
                const a = yield mlazy
                const b = yield mlazy
                return Lazy.Lazy(a + b)
            })
            expect(l100.unsafeRun()).toBe(100)
        })
    })
})