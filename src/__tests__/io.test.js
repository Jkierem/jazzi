import IO from "../IO"
import { Spy } from "../_internals"

describe("IO",() => {
    describe("methods",() => {
        it("IO Functor", () => {
            const always42 = Spy(() => 42);
            const io42 = IO.of(false).map(always42);
            expect(always42.called).toBeFalsy()
            expect(io42.unsafeRun()).toBe(42)
            expect(always42.called).toBeTruthy()
        })
        it("IO Applicative", () => {
            const add20 = Spy(x => x + 20);
            const ioAdd20 = IO.of(add20);
            const io22 = IO.of(22);
            const io42 = io22.apply(ioAdd20);
            expect(add20.called).toBeFalsy()
            expect(io42.unsafeRun()).toBe(42)
            expect(add20.called).toBeTruthy()
        })
        it("IO Monad", () => {
            const io42 = IO.of(21).chain(x => IO.of(x * 2));
            expect(io42.unsafeRun()).toBe(42)
        })
        it("IO Show", () => {
            const id = Spy()
            const ioId = IO.of(id)
            expect(ioId.show()).toBe("[IO => () => _]")
            expect(id.called).toBeFalsy();
        })
        it("IO Effect", () => {
            const plusOne = Spy(x => x + 1);
            const io42 = IO.of(42).peak(plusOne)
            expect(plusOne.called).toBeFalsy()
            const res = io42.unsafeRun()
            expect(plusOne.called).toBeTruthy()
            expect(plusOne.returned(43)).toBeTruthy()
            expect(res).toBe(42);
        })

        describe("IO Thenable", () => {
            it("should resolve", async () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                await IO.of(42).then(thenSpy,catchSpy)
                expect(thenSpy.calledWith(42)).toBeTruthy()
                expect(catchSpy.called).toBeFalsy()
            })

            it("should cast to promise that resolves", async () => {
                const t = await IO.of(42).toPromise()
                expect(t).toBe(42)
            })
        })
    })

    describe("constructors",() => {
        it("should return evaluation of the given function", () => {
            const times2 = Spy(x => x * 2)
            const io42 = IO.of(21).map(times2)
            expect(times2.called).toBeFalsy();
            expect(io42.unsafeRun()).toBe(42)
            expect(times2.called).toBeTruthy();
        })

        it("should wrap a value in a function", () => {
            expect(IO.of(42).unsafeRun()).toBe(42)
        })

        it('should return a function that returns IO, forwarding arguments to said function',() => {
            const ioSpy = Spy()
            const ioConst = IO.forward(ioSpy);
            expect(ioConst(41,42)).toTypeMatch("IO");
            expect(ioSpy.called).toBeFalsy();
            ioConst(41,42).run()
            expect(ioSpy.calledWith(41,42)).toBeTruthy()
        })
        it('should return an unary function that returns IO, forwarding arguments to said function', () => {
            const ioSpy = Spy()
            const ioConst = IO.unary(ioSpy);
            expect(ioConst(42)).toTypeMatch("IO");
            expect(ioSpy.called).toBeFalsy();
            ioConst(42).run()
            expect(ioSpy.calledWith(42)).toBeTruthy()
        })
    })
})