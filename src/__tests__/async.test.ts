import Async from "../Async"

describe("Async", () => {
    it("should work", async () => {
        const fail = Async.Fail(42 as const);
        await expect(fail.run()).rejects.toBe(42)

        const success = Async.Succeed(42 as const)
        await expect(success.run()).resolves.toBe(42)

        const hasReqs = Async.of((x: number) => x + 1)
        await expect(hasReqs.run(41)).resolves.toBe(42)
    })

    it("functor", async () => {
        const sp3 = Async.of(({ x }: { x: number }) => x + 1).fmap(x => x + 2)
        await expect(sp3.run({ x: 39 })).resolves.toBe(42)

        const fails = Async.Fail(42).fmap(() => 39)
        await expect(fails.run()).rejects.toBe(42)
    })

    it("monad", async () => {
        const mkp1 = (x: number) => Async.of(() => x + 1)
        const p41 = Async.of((x: number) => x + 41)
        const p42 = p41.chain(mkp1)

        await expect(p42.run(1)).resolves.toBe(43)

        const failMidway = Async.Succeed(0)
                                .map(x => x + 1)
                                .chain(x => x > 0 ? Async.Fail(42) : Async.Succeed(x))
                                .chain(x => Async.Succeed(x + 1))
    })
})