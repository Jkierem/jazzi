import { Applicative, Functor, Monad, Show, Union } from '../Union'
import { extractWith, getType } from '../_internals';

const ReaderMonad = () => (cases,global) => {
    cases.Reader.prototype.local = function(fn) {
        return getType(this).pure((...env) => this.run(fn(...env)));
    }
    global.runReader = function(reader,...env){
        return reader.run(...env)
    }
    global.ask = function(){
        return new cases.Reader(x => x);
    }
}

const Defs = {
    trivials: ["Reader"], 
    identities:[],
    pure: "Reader",
    lazy: true,
    overrides: {
        fmap: {
            Reader(fn){ return Reader.Reader((...env) => fn(this.get()(...env)))}
        },
        chain: {
            Reader(fn){ return Reader.Reader((...env) => fn(this.run(...env)).run(...env))}
        },
        apply: {
            Reader(readerFn){ return Reader.Reader((...env) => readerFn.get()(this.run(...env)))}
        },
        show: {
            Reader(){ return "[Reader => E => _]" }
        },
        run: {
            Reader(...env) {
                return this.get()(...env)
            }
        }
    }
}

const Reader = Union("Reader",{
    Reader: fn => (...env) => extractWith(env)(fn)
},[
    Functor(Defs),
    Applicative(Defs),
    Monad(Defs),
    Show(Defs),
    ReaderMonad()
]).constructors({
    of(x){ return this.Reader(x) },
    from(x){ return this.Reader(x) }
})

export default Reader