import Sink from '../Sink';
import Sum from '../Sum'
import Mult from '../Mult';
import Merge from '../Merge';
import { is } from 'ramda';
import { Spy } from '../_internals';

describe("Sink", () => {
    describe("methods", () => {
        it("should accumulate a mult value",() => {
            const sink = Sink.multSink();
            const fn = (w) => {
                w.tell(Mult.from(2))
                w.forward(21)
            }
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toBe(42)
        })

        it("should receive sink as argument",() => {
            const sink = Sink.sumSink();
            const fn = (w) => {
                w.tell(Sum.from(21))
                w.forward(21)
            }
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toBe(42)
        })

        it("should accumulate an array value",() => {
            const sink = Sink.arraySink();
            const fn = (w) => {
                w.tell([20])
                w.forward(21)
            }
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toStrictEqual([20,21])
        })

        it("should accumulate an object value",() => {
            const sink = Sink.objectSink();
            const fn = (w) => {
                w.tell(Merge.from({ a: 42 }))
                w.forward({ b: 42 })
            }
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toStrictEqual({ a: 42, b: 42 })
        })

        it("flush should return the sink unchanged", () => {
            const sink = Sink.sumSink();
            const fn = (w) => w.forward(7);
            const result = Sink.runSeq([fn,fn,fn,fn,fn,fn],sink)
            expect(result.flush().unwrap()).toBe(0)
        })

        it("should run a sequence of computations", () => {
            const sink = Sink.sumSink();
            const fn = (w) => w.forward(7);
            const result = Sink.runSeq([fn,fn,fn,fn,fn,fn],sink)
            expect(result.unwrap()).toBe(42)
        })

        it("should do nothing if inner value doesn't meet monoid interface",() => {
            const sink = Sink.force(42)
            const fn = w => w.forward(1);
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toBe(42)
        })

        describe("Thenable", () => {
            it("should resolve", () => {
                const thenSpy = Spy()
                const catchSpy = Spy()
                const sink = Sink.multSink();
                const fn = (w) => {
                    w.tell(Mult.from(2))
                    w.tell(Mult.from(21))
                }
                const result = Sink.runSink(fn,sink)
                result.then(thenSpy,catchSpy)
                expect(thenSpy.calledWith(Mult.of(42))).toBeTruthy()
                expect(catchSpy.called).toBeFalsy()
            })
        })
    })
    describe("constructors", () => {
        const sinks = [
            ["of",Sink.of(Sum.from(0))],
            ["fromType",Sink.fromType(Sum)],
            ["sumSink",Sink.sumSink()],
            ["multSink",Sink.multSink()],
            ["arraySink",Sink.arraySink()],
            ["objectSink",Sink.objectSink(),{ get:() => 42 }],
        ]
        sinks.forEach( ([ cons,sink,fwd]) => {
            it(`should create a sink using "${cons}"`, () => {
                expect(sink).toTypeMatch("Sink");
                const res = sink.run(w => w.forward(fwd || 42))
                const value = res.unwrap();
                if( is(Array,value) ){
                    expect(value).toStrictEqual([42])
                } else {
                    expect(value).toBe(42)
                }
            })
        })

        it("should throw when attempting to create a sink without a Monoid",() => {
            function wrappedFrom(){
                Sink.from(42)
            }
            function wrappedFromMonoid(){
                Sink.fromMonoid(42)
            }
            expect(wrappedFrom).toThrowError("Invariant violation - Received value is not a Monoid")
            expect(wrappedFromMonoid).toThrowError("Invariant violation - Received value is not a Monoid")
        })

        it("should create a sink with something that meets the Monoid interface",() => {
            const sink = Sink.fromMonoid({ concat: x => x + 20, empty: () => 0 });
            const fn = s => s.tell(22)
            const result = Sink.runSink(fn,sink)
            expect(result.unwrap()).toBe(42)
        })

        it("should force a sink",() => {
            expect(Sink.force(42)).toTypeMatch("Sink")
        })
    })
})