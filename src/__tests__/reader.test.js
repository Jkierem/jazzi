import Reader from '../Reader'
import { Spy } from '../_internals';

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
            const spy = Spy(x => Reader.of(42))
            const read42 = Reader.of(() => 0).chain(spy);
            expect(spy.called).toBeFalsy();
            expect(read42.run()).toBe(42);
            expect(spy.called).toBeTruthy();
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