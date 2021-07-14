import Sum from "../Sum";
import First from "../First"
import {
  Enum,
  Eq,
  Effect,
  Filterable,
  Functor,
  FunctorError,
  Monad,
  NewType,
  Thenable,
  Union,
} from "../Union";
import { extractWith } from "../_internals";
import { Spy } from "../__test-utils";
import { fromEnum } from "../_tools";

const trivialImpl = (...tcs) => {
  const defs = {
    trivials: ["Trivial"],
    identities: ["Id"],
  };
  return Union({
    name: "Trivial",
    cases: { Trivial: (x) => x, Id: (x) => x },
    extensions: tcs.map((t) => t(defs)),
    constructors: {}
  });
};

describe("typeclasses", () => {

  describe("minimal union", () => {
    it("should allow creation of minimal union (Box)", () => {
      const Minimal = Union({
        name: "Minimal",
        cases: { Minimal: x => x }
      })
      expect(Minimal.Minimal(42).get()).toBe(42)
    })
  })

  describe("Filterable", () => {
    const Type = trivialImpl(Filterable);
    it("trivial -> should filter inner value", () => {
      expect(
        Type.Trivial([1, 2, 3, 4])
          .filter((x) => x % 2 == 0)
          .get()
      ).toStrictEqual([2, 4]);
    });
    it("identity -> should do nothing", () => {
      expect(
        Type.Id(42)
          .filter((x) => x > 40)
          .get()
      ).toBe(42);
    });
  });

  describe("Monoid", () => {
    it("should have an accumulate function in the type rep", () => {
      const sum42 = Sum.accumulate([10, 12, 20].map(Sum.of));
      expect(sum42.get()).toBe(42);
    });
    it("foldMap -> should create monoids and combine them", () => {
      expect(Sum.foldMap([10, 12, 20]).unwrap()).toBe(42);
    });
  });

  describe("Monad", () => {
    const Lazy = Union({name: "Lazy", cases: { Lazy: (x) => x }, extensions: [
      Monad({
        trivials: ["Lazy"],
        lazy: true,
        pure: "Lazy",
        overrides: {
          run: {
            Lazy() {
              return extractWith([])(this.get());
            },
          },
        },
      }),
    ]});
    const Eager = Union({name: "Eager", cases: { Eager: (x) => x }, extensions: [
      Monad({
        trivials: ["Eager"],
        pure: "Eager",
        lazy: false,
      }),
    ]});
    const Lazy2 = Union({name: "Lazy", cases: { Lazy: (x) => x }, extensions: [
      Monad({
        trivials: ["Lazy"],
        lazy: true,
        pure: "Lazy",
      }),
    ]})

    const meager = Eager.Eager(42);
    it("unsafeRun -> should do nothing unless provided implementation", () => {
      const mlazy = Lazy2.Lazy(() => 50);
      expect(mlazy.unsafeRun()).toBe(mlazy);
      expect(meager.unsafeRun()).toBe(meager);
    });

    it("join -> should break structure in eager", () => {
      const meager = Eager.Eager(Eager.Eager(42))
      expect(meager.join()).toTypeMatch("Eager")
      expect(meager.join().get()).toBe(42)
    })

    it("do notation -> should work as if chaining on eager structs", () => {
      const e84 = Eager.do(function* () {
        const a = yield meager;
        const b = yield meager;
        return Eager.Eager(a + b);
      });
      expect(e84.get()).toBe(84);
    });
    it("do notation -> should work as if chaining on lazy structs", () => {
      const mlazy = Lazy.Lazy(50);
      const l100 = Lazy.do(function* () {
        const a = yield mlazy;
        const b = yield mlazy;
        return Lazy.Lazy(a + b);
      });
      expect(l100.unsafeRun()).toBe(100);
    });
    it("do notation -> should receive pure of type of eager structs", () => {
      const e84 = Eager.do(function* (pure) {
        const a = yield meager;
        const b = yield meager;
        return pure(a + b);
      });
      expect(e84).toTypeMatch("Eager");
      expect(e84.get()).toBe(84);
    })
    it("do notation -> should receive pure of type of lazy structs", () => {
      const mlazy = Lazy.Lazy(50);
      const l100 = Lazy.do(function* (pure) {
        const a = yield mlazy;
        const b = yield mlazy;
        return pure(a + b);
      });
      expect(l100).toTypeMatch("Lazy");
      expect(l100.unsafeRun()).toBe(100);
    })
  });

  describe("Functor", () => {
    describe("natural transformation", () => {
      const Trivial = NewType("Trivial", [Functor({ trivials: ["Trivial"] })]);
      const Trivial2 = NewType("Trivial2", [
        Functor({ trivials: ["Trivial2"] }),
      ]);
      it("should change structure and leave value unchanged", () => {
        const t42 = Trivial.of(42).natural(Trivial2);
        expect(t42).toTypeMatch("Trivial2");
        expect(t42.get()).toBe(42);
      });
      it("should throw if not a functor", () => {
        expect(() => {
          const t42 = Trivial.of(42).to({});
        }).toThrow();
      });
    });
  });

  describe("FunctorError", () => {
    describe("mapError override", () => {
      const mapSpy = Spy((x) => x);
      const ErrorMap = Union({name: "Box", cases: { Box: (x) => x }, extensions: [
        FunctorError({
          errors: ["Box"],
          overrides: {
            mapError: {
              Box: mapSpy,
            },
          },
        }),
      ]})
      it("should call override method", () => {
        ErrorMap.Box(42).mapError((x) => x + 1);
        expect(mapSpy.callCount).toBe(1);
      });
    });
  });

  describe("Enum", () => {
    const createEnum = (impl) =>
      Union({
        name: "Nat",
        cases: {
          Zero: () => {},
          One: () => {},
          Two: () => {},
        },
        extensions: [Eq({ empties: ["Zero", "One", "Two"] }), impl]
      })
    describe("order impl", () => {
      const E = createEnum(
        Enum({
          order: ["Zero", "One", "Two"],
        })
      );
      it("succ should return succesor", () => {
        expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
        expect(E.succ(E.Two())).toBeUndefined();
      });
      it("pred should return predecesor", () => {
        expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
        expect(E.pred(E.Zero())).toBeUndefined();
      });
      it("range should return range [from,to]", () => {
        expect(E.range(E.Zero(), E.Two()).map(fromEnum)).toStrictEqual([
          0,
          1,
          2,
        ]);
        expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0, 1, 2]);
      });
    });
    describe("fromEnum & toEnum impl", () => {
      const E = createEnum(
        Enum({
          overrides: {
            fromEnum(e) {
              return e.isZero() ? 0 : e.isOne() ? 1 : e.isTwo() ? 2 : undefined;
            },
            toEnum(i) {
              return [E.Zero(), E.One(), E.Two()][i];
            },
          },
        })
      );
      it("succ should return succesor", () => {
        expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
        expect(E.succ(E.Two())).toBeUndefined();
      });
      it("pred should return predecesor", () => {
        expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
        expect(E.pred(E.Zero())).toBeUndefined();
      });
      it("range should return range [from,to]", () => {
        expect(E.range(E.Zero(), E.Two()).map(fromEnum)).toStrictEqual([
          0,
          1,
          2,
        ]);
        expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0, 1, 2]);
      });
    });
    describe("trivial impl", () => {
      const E = createEnum(Enum({}));
      it("succ should return succesor", () => {
        expect(E.succ(E.One()).equals(E.Two())).toBeTruthy();
        expect(E.succ(E.Two())).toBeUndefined();
      });
      it("pred should return predecesor", () => {
        expect(E.pred(E.Two()).equals(E.One())).toBeTruthy();
        expect(E.pred(E.Zero())).toBeUndefined();
      });
      it("range should return range [from,to]", () => {
        expect(E.range(E.Zero(), E.Two()).map(fromEnum)).toStrictEqual([
          0,
          1,
          2,
        ]);
        expect(E.range(E.Zero()).map(fromEnum)).toStrictEqual([0, 1, 2]);
      });
    });
  });

  describe("Effect", () => {
    const T = Union({
      name: "T",
      cases: {
        Trivial: x => x,
        Id: x => x
      },
      extensions: [
        Functor({ trivials: ["Trivial"], identities: ["Id"]}),
        Effect({ trivials: ["Trivial"], identities: ["Id"]})
      ],
      constructors: {}
    })
    describe("matchEffect",() => {
      it("should call proper effect without changing structure", () => {
        const tSpy = Spy();
        const idSpy = Spy();
        const pattern = {
          Trivial: tSpy,
          Id: idSpy
        }

        T.Trivial(42).matchEffect(pattern);
        T.Id(43).matchEffect(pattern);

        expect(tSpy.callCount).toBe(1)
        expect(tSpy.calledWith(42)).toBeTruthy()
        expect(idSpy.callCount).toBe(1)
        expect(idSpy.calledWith(43)).toBeTruthy()
      })
    })
  })

  describe("Thenable", () => {
    const Trivial = Union({
      name: "Trivial",
      cases: { 
        Resolve: x => x ,
        Reject: x => x,
      },
      extensions: [
        Thenable({ 
          resolve: ["Resolve"],
          reject: ["Reject"]
        })
      ]
    })
    it("should be able to use with await", async () => {
      const t = await Trivial.Resolve(42);
      expect(t).toBe(42)
    })

    it("should provide a catch utility", () => {
      const catchSpy = Spy()
      Trivial.Reject(42).catch(catchSpy);
      expect(catchSpy.calledWith(42)).toBeTruthy()
    })

    it("should cast to promise that resolves",async () => {
      const t = await Trivial.Resolve(42).toPromise()
      expect(t).toBe(42)
    })

    it("should cast to promise that rejects",async () => {
      try {
        await Trivial.Reject(42).toPromise()
      } catch(t) {
        expect(t).toBe(42)
      }
    })

    it("arguments are optional on all methods", () => {
      const spy = Spy()
      try {
        First.of(42).then()
        Trivial.Resolve(42).then()
        Trivial.Reject(42).then()
        Trivial.Reject(42).catch()
      } catch(e) {
        spy()
      }
      expect(spy.called).toBeFalsy()
    })
  })
});
