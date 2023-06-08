import { Monad, Runnable, Union } from "../../src/Union";
import { extractWith } from "../../src/_internals";

describe("Monad", () => {
    const Lazy = Union({
        name: "Lazy", 
        cases: { 
            Lazy: (x) => x 
        }, 
        extensions: [
            Monad({
                trivials: ["Lazy"],
                lazy: true,
                pure: "Lazy",
            }),
            Runnable({
                overrides: {
                    run: {
                        Lazy() {
                            return extractWith([])(this.get());
                        },
                    },
                }
            })
        ]
    });
    const Eager = Union({
        name: "Eager", 
        cases: { 
            Eager: (x) => x 
        }, 
        extensions: [
            Monad({
                trivials: ["Eager"],
                pure: "Eager",
                lazy: false,
            }),
            Runnable({})
        ]
    });
    const Lazy2 = Union({
        name: "Lazy", 
        cases: { 
            Lazy: (x) => x 
        }, 
        extensions: [
            Monad({
                trivials: ["Lazy"],
                lazy: true,
                pure: "Lazy",
            }),
            Runnable({})
        ]
    })
  
    const meager = Eager.Eager(42);

    describe("unsafeRun", () => {
        it("should be same as get unless provided implementation", () => {
            const inner = () => 50
            const mlazy = Lazy2.Lazy(inner);
            expect(mlazy.unsafeRun()).toBe(inner);
            expect(meager.unsafeRun()).toBe(42);
        });
    })

    describe("join", () => {
        it("should break structure in eager", () => {
            const meager = Eager.Eager(Eager.Eager(42))
            expect(meager.join()).toTypeMatch("Eager")
            expect(meager.join().get()).toBe(42)
        })
    })

    describe("do notation", () => {
        it("should work as if chaining on eager structs", () => {
            const e84 = Eager.do(function* () {
                const a: number = yield meager;
                const b: number = yield meager;
                return Eager.Eager(a + b);
            });
            expect(e84.get()).toBe(84);
        });
        it("should work as if chaining on lazy structs", () => {
            const mlazy = Lazy.Lazy(50);
            const l100 = Lazy.do(function* () {
                const a: number = yield mlazy;
                const b: number = yield mlazy;
                return Lazy.Lazy(a + b);
            });
            expect(l100.unsafeRun()).toBe(100);
        });
        it("should receive pure of type of eager structs", () => {
            const e84 = Eager.do(function* (pure: any) {
                const a: number = yield meager;
                const b: number = yield meager;
                return pure(a + b);
            });
            expect(e84).toTypeMatch("Eager");
            expect(e84.get()).toBe(84);
        })
        it("should receive pure of type of lazy structs", () => {
            const mlazy = Lazy.Lazy(50);
            const l100 = Lazy.do(function* (pure: any) {
                const a: number = yield mlazy;
                const b: number = yield mlazy;
                return pure(a + b);
            });
            expect(l100).toTypeMatch("Lazy");
            expect(l100.unsafeRun()).toBe(100);
        })
    })

  
})