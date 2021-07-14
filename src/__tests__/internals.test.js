import { getCaseSensitive } from "../_internals"

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
})