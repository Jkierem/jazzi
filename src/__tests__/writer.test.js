import Writer from '../Writer';
import Sum from '../Sum'
import Mult from '../Mult';
import Merge from '../Merge';

describe("WriterMonad", () => {
    describe("sinks", () => {
        it("should bind the function", () => {
            const writer = Writer.sumSink();
            function fn(){
                this.tell(Sum.from(42))
            }
            const result = Writer.runBoundWriter(fn,writer)
            expect(result.unwrap()).toBe(42)
        })

        it("should accumulate a mult value",() => {
            const writer = Writer.multSink();
            const fn = () => {
                tell(Mult.from(2))
                forward(21)
            }
            const result = Writer.runWriter(fn,writer)
            expect(result.unwrap()).toBe(42)
        })

        it("should accumulate a sum value",() => {
            const writer = Writer.sumSink();
            const fn = () => {
                tell(Sum.from(21))
                forward(21)
            }
            const result = Writer.runWriter(fn,writer)
            expect(result.unwrap()).toBe(42)
        })

        it("should receive writer as argument",() => {
            const writer = Writer.sumSink();
            const fn = (w) => {
                w.tell(Sum.from(21))
                w.forward(21)
            }
            const result = Writer.runWriter(fn,writer)
            expect(result.unwrap()).toBe(42)
        })

        it("should accumulate an array value",() => {
            const writer = Writer.arraySink();
            const fn = () => {
                tell([20])
                forward(21)
            }
            const result = Writer.runWriter(fn,writer)
            expect(result.get()).toStrictEqual([20,21])
        })

        it("should accumulate an object value",() => {
            const writer = Writer.objectSink();
            const fn = () => {
                tell(Merge.from({ a: 42 }))
                forward({ b: 42 })
            }
            const result = Writer.runWriter(fn,writer)
            expect(result.unwrap()).toStrictEqual({ a: 42, b: 42 })
        })

        it("flush should return the writer unchanged", () => {
            const writer = Writer.sumSink();
            const fn = () => forward(7);
            const result = Writer.runSeq([fn,fn,fn,fn,fn,fn],writer)
            expect(result.flush().unwrap()).toBe(0)
        })

        it("should run a sequence of computations", () => {
            const writer = Writer.sumSink();
            const fn = () => forward(7);
            const result = Writer.runSeq([fn,fn,fn,fn,fn,fn],writer)
            expect(result.unwrap()).toBe(42)
        })

        it("should run a sequence of bound computations", () => {
            const writer = Writer.sumSink();
            function fn(){ this.forward(7); }
            const result = Writer.runBoundSeq([fn,fn,fn,fn,fn,fn],writer)
            expect(result.unwrap()).toBe(42)
        })
    })
    describe("constructors", () => {
        it("return a writer on any monoid value", () => {
            expect(Writer.from(Sum.from(42))).toTypeMatch("Writer")
        })
    })
})