import __ from "ramda/src/__";
import Sum from "../Sum";
import {
  Union,
  NewType,
  Monad,
  Functor,
  EnumType,
  Show,
} from "../Union";
import { getCase } from "../_internals";
import {
  foldMap,
  fromEnum,
  getTag,
  hasInstance,
  pred,
  show,
  succ,
  toEnum,
  unwrap,
} from "../_tools";

describe("Utils", () => {
  // Box is the simplest definition of an union
  const Boxed = Union({
    name: "Box", 
    cases: { Box: (x) => x }, 
    extensions: [
      Show({ trivials: ["Box"] }),
    ],
    constructors:{
      of(a) {
        return this.Box(a);
      },
    }
  });
  const TooMuch = Boxed.of(Boxed.of(Boxed.of(42)));
  const P = EnumType("Nat", ["Zero", "One", "Two", "Three"]);
  describe("Union types", () => {
    it("should have a way to break nested unions", () => {
      expect(TooMuch.unwrap()).toBe(42);
    });

    it("should unbox using unwrap", () => {
      expect(unwrap(TooMuch)).toBe(42);
      expect(unwrap(42)).toBe(42);
      expect(unwrap(undefined)).toBeUndefined();
    });
  });

  describe("foldMap", () => {
    it("should call foldMap on a Monoid type", () => {
      expect(foldMap(Sum, [10, 12, 20]).unwrap()).toBe(42);
    });
  });

  describe("hasInstance", () => {
    const Box = NewType("Box", [
      Functor({ trivials: ["Box"], identities: [] }),
    ]);
    const Boxed42 = Box.from(42);
    it("should return true for implementors, false otherwise", () => {
      expect(hasInstance(Functor, Boxed42)).toBeTruthy();
      expect(hasInstance("Functor", Boxed42)).toBeTruthy();
      expect(hasInstance(Functor, Box)).toBeTruthy();
      expect(hasInstance(Monad, Boxed42)).toBeFalsy();
      expect(hasInstance("Monad", Boxed42)).toBeFalsy();
      expect(hasInstance(Monad, Box)).toBeFalsy();
      expect(hasInstance(Monad, 42)).toBeFalsy();
      expect(hasInstance(Monad, 42)).toBeFalsy();
    });
  });

  describe("show", () => {
    it("returns string rep", () => {
      expect(show(Boxed.of(42))).toBe("[Box => Box 42]");
    });
  });

  describe("getTag", () => {
    it("returns variant name", () => {
      expect(getTag(Boxed.of(42))).toBe("Box");
    });
  });

  describe("EnumType", () => {
    it("should have a different string rep", () => {
      expect(P.Zero.show()).toBe("[Nat => Zero]");
    });
    describe("fromEnum", () => {
      it("returns Int value of Enum value", () => {
        expect(fromEnum(P.One)).toBe(1);
      });
    });
    describe("toEnum", () => {
      it("return Enum value from Int", () => {
        expect(toEnum(P, 2).equals(P.Two)).toBeTruthy();
      });
      it("return undefined from invalid Int", () => {
        expect(toEnum(P, 6)).toBe(undefined);
        expect(toEnum(P, -1)).toBe(undefined);
      });
    });
    describe("succ", () => {
      it("should return succesor of enum value", () => {
        expect(succ(P.One).equals(P.Two)).toBeTruthy();
      });
    });
    describe("pred", () => {
      it("should return predecesor od enum value", () => {
        expect(pred(P.One).equals(P.Zero)).toBeTruthy();
      });
    });
  });

  describe("newType", () => {
    const Box = NewType("Box");
    const Boxed42 = Box.from(42);
    const Boxed41 = Box.of(41);
    it("should create a trivial boxed type", () => {
      expect(Boxed42).toTypeMatch("Box");
      expect(Boxed42.toString()).toEqual("[Box => Box 42]");
      expect(Boxed42.get()).toEqual(42);
      expect(Boxed41.get()).toEqual(41);
    });
  });
  describe("getCase", () => {
    it("should be case insensitive", () => {
      const cases = {
        hey: 5,
      };
      expect(getCase("HeY", cases)).toBe(getCase("hey", cases));
    });

    it("should fallback to default, then _", () => {
      const cases1 = {
        value: "what",
        default: "default",
        _: "_",
      };
      const cases2 = {
        value: "what",
        _: "_",
      };
      const notMatch = "anything";

      expect(getCase(notMatch, cases1)).toBe("default");
      expect(getCase(notMatch, cases2)).toBe("_");
    });
  });
});
