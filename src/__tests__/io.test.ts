import IO from '../IO'
import { Spy } from '../__test-utils/index'

describe("IO", () => {
    it("should work", () => {
        const sp = Spy()
        const fp = IO.do(function*(pure){
            sp()
            const a = yield IO.of(() => 21)
            const b = yield IO.of(() => 21)
            return pure(a + b)
        })
        expect(sp).not.toHaveBeenCalled()
        fp.unsafeRun()
        expect(sp).toHaveBeenCalled()
        fp.unsafeRun()
        expect(sp.callCount).toBe(2)
        expect(fp.unsafeRun()).toBe(42)
    })
})