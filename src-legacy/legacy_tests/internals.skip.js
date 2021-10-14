import { expandCases, getCaseSensitive, getCase } from "../_internals"

describe("Internals", () => {
    describe("getCaseSensitive", () => {
        it("should match the first (case sensitive)", () => {
            const matched = getCaseSensitive("juan", {
                Juan: "Juan",
                juan: "juan",
                _: "_",
                default: "default"
            })

            expect(matched).toBe("juan")
        })
    })
    describe("expandCases", () => {
        it("should expand cases when pipe operator is used", () => {
          const base = {
            "a | b": 42
          }
          const expanded = expandCases(base);
          expect(expanded.a).toBe(42)
          expect(expanded.b).toBe(42)
        })
    
        it("should remove empty expanded cases", () => {
          const base = {
            "a |   || b | | c": 42
          }
          const expanded = expandCases(base);
          expect(expanded.a).toBe(42)
          expect(expanded.b).toBe(42)
          expect(expanded.c).toBe(42)
        })
    })
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
})