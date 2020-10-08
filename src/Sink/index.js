import Sum from '../Sum';
import Mult from '../Mult';
import Merge from '../Merge';
import { Monad, Monoid, Show, Union } from '../Union'
import { getInnerValue, setInnerValue, getType } from '../_internals';
import { is } from 'ramda';
import { hasInstance } from '../_tools';

const isArray = is(Array)
const isFunction = is(Function)
const isMonoid = x => hasInstance(Monoid,x) || isArray(x) || (isFunction(x?.concat) && isFunction(x?.empty))

const SinkType = () => (cases,globals) => {
    cases.Sink.prototype.tell = function(m){
        getInnerValue(this)[1].push(m);
        return this
    }
    cases.Sink.prototype.flush = function(){
        return new cases.Sink(getInnerValue(this)[0])
    }
    cases.Sink.prototype.forward = function(...args){
        const innerValue = getInnerValue(this)[0]
        const innerType = isArray(innerValue) ? Array : getType(innerValue);
        if( innerType?.of ){
            return this.tell(innerType.of(...args))
        }
        return this;
    }
    cases.Sink.prototype.get = function(){
        const [inner, vals] = getInnerValue(this);
        return vals.reduce((acc,next) => acc.concat(next) , inner)
    }
    const innerRun = (fn,_sink) => {
        const [inner,cons] = getInnerValue(_sink)
        const sink = new cases.Sink()
        setInnerValue([inner,[...cons]],sink)
        fn(sink)
        return sink
    }
    function run(fn){
        return innerRun(fn,this)
    }
    cases.Sink.prototype.run = run
    cases.Sink.prototype.unsafeRun = run
    globals.runSink = (fn,sink) => {
        return innerRun(fn,sink)
    }
    globals.runSeq = (fns,sink) => {
        return fns.reduce((sink,next) => {
            return innerRun(next,sink)
        }, sink)
    }
}

const Defs = {
    trivials: ["Sink"],
    identities: [],
    pure: "Sink",
    zero: "Sink",
}

const safeConstruct = (x,cons) => {
    if( !isMonoid(x) ){
        throw new Error("Invariant violation - Received value is not a Monoid")
    }
    return cons(x)
}

const Sink = Union("Sink",{
    Sink: (x) => ([x,[]]),
},[
    Monad(Defs),
    Monoid(Defs),
    Show(Defs),
    SinkType()
]).constructors({
    of(x){
        return safeConstruct(x,this.Sink)
    },
    from(x){
        return safeConstruct(x,this.Sink)
    },
    fromMonoid(x){
        return safeConstruct(x,this.Sink)
    },
    fromType(x){
        return this.Sink(x.empty())
    },
    force(x){
        return this.Sink(x);
    },
    sumSink(){
        return this.Sink(Sum.empty());
    },
    multSink(){
        return this.Sink(Mult.empty());
    },
    arraySink(){
        return this.Sink([])
    },
    objectSink(){
        return this.Sink(Merge.empty())
    }
})

export default Sink