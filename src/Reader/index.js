import { Functor, Monad, Show, Union } from '../Union'
import { getGlobal } from '../_internals'

const ReaderMonad = () => (cases,global) => {
    cases.Reader.prototype.ask = function(fn){
        return this.chain(fn)
    }
    cases.Reader.prototype.local = function(fn) {
        return this.fmap(fn)
    }
    global.runReader = function(fn,reader){
        const mem = getGlobal().ask
        getGlobal().ask = (fn) => reader.ask(fn);
        const value = fn(reader)
        getGlobal().ask = mem
        return value
    }
    global.runBoundReader = function(fn,reader){
        return fn.call(reader)
    }
}

const Defs = {
    trivials: ["Reader"], 
    identities:[],
    pure: "Reader",
}

const Reader = Union("ReaderMonad",{
    Reader: (x) => x
},[
    Functor(Defs),
    Monad(Defs),
    ReaderMonad(),
    Show(Defs)
]).constructors({
    from(x){ return this.Reader(x) }
})

export default Reader