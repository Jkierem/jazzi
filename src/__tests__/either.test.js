import { Either, Maybe } from "../";
import { Spy } from "../__test-utils";

describe("Either", () => {
  describe("methods", () => {
    const right42 = Either.Right(42);
    const left42 = Either.Left(42);
    it("if functions -> should return call if matched type. Do nothing otherwise", () => {
      const spy = Spy((x) => x + 1);
      expect(right42.ifLeft(spy).get()).toBe(42);
      expect(left42.ifRight(spy).get()).toBe(42);
      expect(spy.called).toBeFalsy();
      expect(right42.ifRight(spy).get()).toBe(43);
      expect(left42.ifLeft(spy).get()).toBe(43);
      expect(spy.callCount).toBe(2);
    });
    it("map aliases -> should map if matches type. Do nothing otherwise", () => {
      const spy = Spy((x) => x + 1);
      expect(right42.mapLeft(spy).get()).toBe(42);
      expect(left42.mapRight(spy).get()).toBe(42);
      expect(spy.called).toBeFalsy();
      expect(right42.mapRight(spy).get()).toBe(43);
      expect(left42.mapLeft(spy).get()).toBe(43);
      expect(spy.callCount).toBe(2);
    });
    const eithers = [1, 2, undefined, 0, 3, 4, null].map((x) =>
      Either.fromFalsy(x, x)
    );
    it("filters -> rights returns all Rights", () => {
      expect(Either.rights(eithers).every((r) => r.isRight())).toBeTruthy();
    });
    it("filters -> lefts returns all Lefts", () => {
      const ls = Either.lefts(eithers);
      expect(ls.every((l) => l.isLeft())).toBeTruthy();
      expect(ls.length).toBe(3);
    });
    it("filters -> paritions returns [lefts, rights]", () => {
      const [ls, rs] = Either.partition(eithers);
      expect(ls.every((l) => l.isLeft())).toBeTruthy();
      expect(rs.every((r) => r.isRight())).toBeTruthy();
    });

    it("swap -> should swap if predicate returns true", () => {
      expect(Either.Right(42).swapIf((x) => x < 50)).toTypeMatch("Left");
      expect(Either.Right(42).swapIf((x) => x > 50)).toTypeMatch("Right");
      expect(Either.Left(42).swapOn((x) => x < 50)).toTypeMatch("Right");
      expect(Either.Left(42).swapOn((x) => x > 50)).toTypeMatch("Left");
    });

    describe("catamorphisms", () => {
      it("fold -> calls left function on Left, right function on Right", () => {
        const spyl = Spy(() => "left");
        const spyr = Spy(() => "right");
        expect(right42.fold(spyl, spyr)).toBe("right");
        expect(spyl.called).toBeFalsy();
        expect(spyr.called).toBeTruthy();
        expect(spyr.calledWith(42)).toBeTruthy();
        spyl.reset();
        spyr.reset();
        left42.fold(spyl, spyr);
        expect(left42.fold(spyl, spyr)).toBe("left");
        expect(spyr.called).toBeFalsy();
        expect(spyl.called).toBeTruthy();
        expect(spyl.calledWith(42)).toBeTruthy();
      });
      it("fromRight -> returns inner value if Right, fallback value otherwise", () => {
        expect(Either.fromRight(40, right42)).toBe(42);
        expect(Either.fromRight(40, left42)).toBe(40);
      });
      it("fromLeft -> returns inner value if Left, fallback value otherwise", () => {
        expect(Either.fromLeft(40, right42)).toBe(40);
        expect(Either.fromLeft(40, left42)).toBe(42);
      });
      const { Left, Right } = Either;
      const collects = [
        Left(1),
        Right(1),
        Left(2),
        Left(3),
        Right(2),
        Right(3),
      ];
      it("collectRights -> [Right a] => Right [a]", () => {
        expect(Either.collectRights(collects).get()).toStrictEqual([1, 2, 3]);
      });
      it("collectLefts -> [Left a] => Left [a]", () => {
        expect(Either.collectLefts(collects).get()).toStrictEqual([1, 2, 3]);
      });
    });

    describe("Thenable", () => {
      it("should resolve on Right", async () => {
        const thenSpy = Spy()
        const catchSpy = Spy()
        await Either.Right(42).then(thenSpy,catchSpy);
        expect(thenSpy.callCount).toBe(1);
        expect(thenSpy.calledWith(42)).toBeTruthy();
        expect(catchSpy.called).toBeFalsy();
      })
      it("should reject on Left",  async () => {
        const thenSpy = Spy()
        const catchSpy = Spy()
        try {
          await Either.Left(42).then(thenSpy,catchSpy);
        } catch(e) {
          expect(catchSpy.callCount).toBe(1);
          expect(catchSpy.calledWith(42)).toBeTruthy();
          expect(thenSpy.called).toBeFalsy();
        }
      })
    })
  });

  describe("constructors", () => {
    [
      ["of", "truthy", "Right", 42],
      ["of", "not nullish", "Right", false],
      ["of", "undefined", "Left", undefined],
      ["of", "null", "Left", null],
      ["fromFalsy", "truthy", "Right", "left", 42],
      ["fromFalsy", "falsy", "Left", "left", false],
      ["fromPredicate", "truthy return", "Right", (x) => x == 42, 42],
      ["fromPredicate", "falsy return", "Left", (x) => x == 42, 43],
      ["fromMaybe", "Just", "Right", Maybe.Just(42)],
      ["fromMaybe", "None", "Left", Maybe.None()],
      ["attempt", "function that doesn't throw", "Right", () => 42],
      ["attempt", "function that throws", "Left", () => { throw 42 }],
    ].forEach(([cons, desc, type, ...args]) => {
      it(`${cons} called with a ${desc} value should return ${type}`, () => {
        expect(Either[cons](...args)).toTypeMatch(type);
      });
    });

    it("defaultTo should be just curried fromFalsy", () => {
      const defaultTo42 = Either.defaultTo(42);
      expect(defaultTo42(false).get()).toBe(42);
      expect(defaultTo42(43).get()).toBe(43);
    });

    it("attempt should return Right Value", () => {
      const right42 = Either.attempt((a,b) => a+b, 40, 2)
      expect(right42.get()).toBe(42)
      expect(right42).toTypeMatch("Right")
    })
    it("attempt should return Left Error", () => {
      const left42 = Either.attempt(() => { throw 42 })
      expect(left42.get()).toBe(42)
      expect(left42).toTypeMatch("Left")
    })
  });
});
