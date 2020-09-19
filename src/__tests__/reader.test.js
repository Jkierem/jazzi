import Reader from '../Reader'

describe("Reader Monad",() => {
    describe("methods",() => {
        it("runReader -> should pass ask through global object",() => {
            const read42 = Reader.from(42);
            let res = null;
            const fn = () => {
                res = ask(x => x)
            }
            Reader.runReader(fn,read42);
            expect(res).toBe(42)
        })
        it("runReader -> should pass as argument",() => {
            const read42 = Reader.from(42);
            let res = null;
            const fn = (reader) => {
                res = reader.ask(x => x)
            }
            Reader.runReader(fn,read42);
            expect(res).toBe(42)
        })
        it("runBoundReader -> should bind function",() => {
            const read42 = Reader.from(42);
            let res = null;
            function fn (){
                res = this.ask(x => x)
            }
            Reader.runBoundReader(fn,read42);
            expect(res).toBe(42)
        })
        it("runReader -> should restore ask to previous state", () => {
            const read42 = Reader.from(42);
            const read43 = Reader.from(43);
            let res = null;
            const fn = () => {
                res = ask(x => x)
            }
            Reader.runReader(() => {
                Reader.runReader(fn,read43)
                fn()
            },read42)
            expect(res).toBe(42)
        })
        it("local -> maps the reader", () => {
            const read43 = Reader.from(42).local(x => x + 1);
            let res = null;
            const fn = () => {
                res = ask(x => x)
            }
            Reader.runReader(fn,read43);
            expect(res).toBe(43)
        })
    })
    describe("constructors",() => {
        it("should return Reader of anything", () => {
            expect(Reader.from(42)).toTypeMatch("Reader");
        })
    })
})