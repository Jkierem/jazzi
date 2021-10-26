import BoxedEnumType from '../Union/boxedEnumType'

describe("Boxed Enum", () => {
    const juan = BoxedEnumType("Juan",["One","Two"])

    it("should preserve inner value on next", () => {
        const val = juan.One(42).next()
        expect(val).toTypeMatch("Two")
        expect(val.get()).toBe(42)
    })

    it("should preserve inner value on previous", () => {
        const val = juan.Two(42).previous()
        expect(val).toTypeMatch("One")
        expect(val.get()).toBe(42)
    })

    it("should return undefined if no next is available", () => {
        const val = juan.Two(42).next()
        expect(val).toBeUndefined()
    })

    it("should return undefined if no previous is available", () => {
        const val = juan.One(42).previous()
        expect(val).toBeUndefined()
    })

    it("should preserve inner value on global next", () => {
        const val = juan.next(juan.One(42))
        expect(val).toTypeMatch("Two")
        expect(val.get()).toBe(42)
    })

    it("should preserve inner value on global previous", () => {
        const val = juan.previous(juan.Two(42))
        expect(val).toTypeMatch("One")
        expect(val.get()).toBe(42)
    })
})