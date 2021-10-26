import { Union } from "../Union";

const Maybe = Union({
    name: "Maybe",
    cases: {
        Just:  x => x,
        None: () => {}
    }
})

describe("union", () => {
    describe("instanceOf", () => {
        it("should be true", () => {
            const j42 = Maybe.Just(42)
            expect(j42 instanceof (Maybe as any)).toBeTruthy()
            expect(j42 instanceof (Maybe.Just as any)).toBeTruthy()
            expect(j42 instanceof (Maybe.None as any)).toBeFalsy()
        })
    })
})