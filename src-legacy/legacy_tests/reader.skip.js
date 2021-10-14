import Reader from '../Reader'
import { Spy } from "../__test-utils";

describe("Reader Monad",() => {
    describe("methods",() => {
        it("functor -> map is lazy",() => {
            const spy = Spy()
            const read42 = Reader.of(() => 42).map(spy);
            expect(spy.called).toBeFalsy();
            expect(read42.run()).toBe(42);
            expect(spy.called).toBeTruthy();
        })
        it("monad -> chain is lazy", () => {
            const spy = Spy(x => Reader.of(x + 40))
            const read42 = Reader.of(val => val).chain(spy);
            expect(spy.called).toBeFalsy();
            expect(read42.run(2)).toBe(42);
            expect(spy.called).toBeTruthy();
        })
        it("monad -> chain readers", () => {
            const log = something => Reader.of(logger => logger.log(something))
            const logSomething = () => log("something").chain(() => log("else"));
            const spy = { log: Spy() };
            logSomething().run(spy)
            expect(spy.log.calledWith("something")).toBeTruthy()
            expect(spy.log.calledWith("else")).toBeTruthy()
        })
        it("monad -> join", () => {
            const readerReader = Reader.of(e1 => Reader.of(_ => e1.call(42)))
            const env = { call: Spy() }
            readerReader.join().run(env)
            expect(env.call.calledOnce).toBeTruthy()
            expect(env.call.calledWith(42)).toBeTruthy()
        })
        it("applicative -> apply is lazy",() => {
            const spy = Spy(x => x + 1)
            const add1 = Reader.of(spy)
            const read42 = Reader.of(() => 41).apply(add1);
            expect(spy.called).toBeFalsy();
            expect(read42.run()).toBe(42);
            expect(spy.called).toBeTruthy();
        })
        it("show -> should not compute value", () => {
            const spy = Spy(() => 42);
            const read42 = Reader.of(spy);
            const str = read42.show();
            expect(spy.called).toBeFalsy();
            expect(str).toBe("[Reader => E => _]")
        })
        it("runReader -> should pass enviroment through arguments",() => {
            let res = null;
            const read = Reader.from(x => res = x);
            Reader.runReader(read,42);
            expect(res).toBe(42)
        })
        it("local -> maps received enviroment", () => {
            const fn = Spy()
            const read = Reader.from(fn).local(x => x + 1);
            Reader.runReader(read,42);
            expect(fn.calledWith(43)).toBeTruthy()
        })
        it("should pass enviroment (dependency injection)", () => {
            const spy = Spy()
            const Inc = (value) => Reader.of(inc => inc.do(value));
            const comp = () => Inc(41).map(spy)
            expect(spy.called).toBeFalsy()
            const res = comp().run({ do: x => x + 1 })
            expect(spy.called).toBeTruthy()
            expect(spy.calledWith(42)).toBeTruthy()
            expect(res).toBe(42)
        })

        describe("Reader Thenable", () => {
            it("should resolve", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                Reader.of(42).then(thenSpy,catchSpy)
                expect(thenSpy.calledWith(42)).toBeTruthy()
                expect(catchSpy.called).toBeFalsy()
            })

            it("should cast to promise that resolves", async () => {
                const t = await Reader.of(42).toPromise()
                expect(t).toBe(42)
            })
        })
    })
    describe("constructors",() => {
        it("should return Reader of anything", () => {
            expect(Reader.from(() => 42)).toTypeMatch("Reader");
        })
        it("should return Reader of identity", () => {
            expect(Reader.runReader(Reader.ask(),42)).toBe(42)
        })
    })
})