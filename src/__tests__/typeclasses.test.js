import Sum from '../Sum';
import { Enum, Eq, Filterable, Functor, FunctorError, Monad, NewType, Union } from '../Union'
import { extractWith, Spy } from '../_internals';
import { fromEnum } from '../_tools';
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
        const Lazy2 = Union("Lazy",{ Lazy: x => x },[
            Monad({ 
            trivials: ["Lazy"] , 
            lazy: true,
            pure: "Lazy"
        })]).constructors({})

        const meager = Eager.Eager(42);
        it("unsafeRun -> should do nothing unless provided implementation",() => {
            const mlazy = Lazy2.Lazy(() => 50)
            expect(mlazy.unsafeRun()).toBe(mlazy);
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

    describe("Functor", () => {
        describe("natural transformation", () => {
            const Trivial = NewType("Trivial",[ Functor({ trivials: ["Trivial"] })])
            const Trivial2 = NewType("Trivial2",[ Functor({ trivials: ["Trivial2"] })])
            it("should change structure and leave value unchanged", () => {
                const t42 = Trivial.of(42).natural(Trivial2)
                expect(t42).toTypeMatch("Trivial2")
                expect(t42.get()).toBe(42)
            })
            it("should throw if not a functor", () => {
                expect(() => {
                    const t42 = Trivial.of(42).to({})
                }).toThrow()
            })
        })
    })

    describe("FunctorError", () => {
        describe("mapError override", () => {
            const mapSpy = Spy(x => x)
            const ErrorMap = Union("Box",{ Box: x => x },[
                FunctorError({ errors: ["Box"] , overrides: {
                    mapError: {
                        Box: mapSpy 
                    }
                }})
            ]).constructors({})
            it("should call override method", () => {
                ErrorMap.Box(42).mapError(x => x + 1)
                expect(mapSpy.callCount).toBe(1)
            })
        })
    })

    describe("Enum", () => {
        const createEnum = impl => Union("Nat",{
            Zero: () => {},
            One: () => {},
            Two: () => {},
        },[ 
            Eq({ empties: ["Zero","One","Two"]}),
            impl 
        ]).constructors({})
        describe("order impl",() => {
            const E = createEnum(Enum({
                order: ["Zero","One","Two"]
            }))
            it("succ should return succesor", () => {
                expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
                expect(E.succ(E.Two())).toBeUndefined();
            })
            it("pred should return predecesor", () => {
                expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
                expect(E.pred(E.Zero())).toBeUndefined();
            })
            it("range should return range [from,to]", () => {
                expect(E.range(E.Zero(),E.Two()).map(fromEnum)).toStrictEqual([0,1,2])
                expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0,1,2])
            })
        })
        describe("fromEnum & toEnum impl",() => {
            const E = createEnum(Enum({
                overrides: {
                    fromEnum(e){
                        return e.isZero() ? 0 :
                               e.isOne()  ? 1 :
                               e.isTwo()  ? 2 : undefined
                    },
                    toEnum(i){
                        return [E.Zero(),E.One(),E.Two()][i]
                    }
                }
            }))
            it("succ should return succesor", () => {
                expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
                expect(E.succ(E.Two())).toBeUndefined();
            })
            it("pred should return predecesor", () => {
                expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
                expect(E.pred(E.Zero())).toBeUndefined();
            })
            it("range should return range [from,to]", () => {
                expect(E.range(E.Zero(),E.Two()).map(fromEnum)).toStrictEqual([0,1,2])
                expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0,1,2])
            })
        })
        describe("trivial impl",() => {
            const E = createEnum(Enum({}))
            it("succ should return succesor", () => {
                expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
                expect(E.succ(E.Two())).toBeUndefined();
            })
            it("pred should return predecesor", () => {
                expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
                expect(E.pred(E.Zero())).toBeUndefined();
            })
            it("range should return range [from,to]", () => {
                expect(E.range(E.Zero(),E.Two()).map(fromEnum)).toStrictEqual([0,1,2])
                expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0,1,2])
            })
        })
    })
})