import { is } from 'ramda'
import Sum from '../Sum';
import Mult from '../Mult';
import Merge from '../Merge';
import { Monad, Monoid, Show, Union } from '../Union'
import { getGlobal, getInnerValue, setInnerValue } from '../_internals';

const WriterMonad = () => (cases,globals) => {
    cases.Writer.prototype.tell = function(m){
        getInnerValue(this)[1].push(m);
        return this
    }
    cases.Writer.prototype.forward = function(m){
        const [inner, vals] = getInnerValue(this);
        if( is(Array,inner) ){
            vals.push([m])
        } else {
            vals.push(inner.pure(m))
        }
        return this
    }
    cases.Writer.prototype.flush = function(){
        return new cases.Writer(getInnerValue(this)[0])
    }
    cases.Writer.prototype.get = function(){
        const [inner, vals] = getInnerValue(this);
        return vals.reduce((acc,next) => acc.concat(next) , inner)
    }
    globals.runWriter = (fn,_writer) => {
        const [inner,cons] = getInnerValue(_writer)
        const writer = new cases.Writer()
        setInnerValue(writer,[inner,[...cons]])
        const mem = getGlobal().tell
        const mem2 = getGlobal().forward
        getGlobal().tell = (fn) => writer.tell(fn);
        getGlobal().forward = (fn) => writer.forward(fn);
        fn(writer)
        getGlobal().tell = mem
        getGlobal().forward = mem2
        return writer
    }
    globals.runBoundWriter = (fn,_writer) => {
        const [inner,cons] = getInnerValue(_writer)
        const writer = new cases.Writer()
        setInnerValue(writer,[inner,[...cons]])
        fn.call(writer)
        return writer
    }
    globals.runSeq = (fns,writer) => {
        return fns.reduce((writer,next) => {
            return globals.runWriter(next,writer)
        }, writer)
    }
    globals.runBoundSeq = (fns,writer) => {
        return fns.reduce((writer,next) => {
            return globals.runBoundWriter(next,writer)
        }, writer)
    }
}

const Defs = {
    trivials: ["Writer"],
    identities: [],
    pure: "Writer",
    zero: "Writer"
}

const Writer = Union("WriterMonad",{
    Writer: (x) => ([x,[]]),
},[
    Monad(Defs),
    Monoid(Defs),
    WriterMonad(),
    Show(Defs)
]).constructors({
    from(x){
        return this.Writer(x)
    },
    sumSink(){
        return this.Writer(Sum.empty());
    },
    multSink(){
        return this.Writer(Mult.empty());
    },
    arraySink(){
        return this.Writer([])
    },
    objectSink(){
        return this.Writer(Merge.empty())
    }
})

export default Writer