import { EnumType, Union } from "../../src/Union";

const Maybe = Union({
    name: "Maybe",
    cases: {
        Just:  x => x,
        None: () => {}
    }
})

const Nats = EnumType("Nats",["One","Two"])

describe("union", () => {
    describe("instanceOf", () => {
        it("should be true", () => {
            const j42 = Maybe.Just(42)
            expect(j42 instanceof (Maybe as any)).toBeTruthy()
            expect(j42 instanceof (Maybe.Just as any)).toBeTruthy()
            expect(j42 instanceof (Maybe.None as any)).toBeFalsy()
            expect(Nats.One instanceof (Nats as any)).toBeTruthy()
        })
    })
})