import { extractWith, getInnerValue } from "../_internals";
import { Union, Monad, Applicative, Functor, Show } from "../Union";
import { compose } from "ramda";

const IOType = () => (cases) => {
    cases.IO.prototype.unsafeRun = function(...args){
        return this.get()(...args)
    }
}

const IODefs = {
    trivials: ["IO"],
    identities: [],
    pure: "IO",
    overrides: {
        fmap:{
            IO(fn){
                return IO.pure(compose(fn,getInnerValue(this)))
            }
        },
        chain: {
            IO(fn){
                return IO.pure((...args) => fn(this.unsafeRun(...args)).unsafeRun())
            }
        },
        apply: {
            IO(ioFn){
                return IO.pure((...args) => ioFn.get()(this.get()(...args)))
            }
        },
        show: {
            IO(){
                return `[IO => () => _]`
            }
        }
    }
}

function defaultIO(x){ return this.IO(x) }

const IO = Union("IO",{
    IO: fn => (...args) => extractWith(args)(fn),
},[
    Functor(IODefs),
    Applicative(IODefs),
    Monad(IODefs),
    Show(IODefs),
    IOType()
]).constructors({
    of: defaultIO,
    from: defaultIO,
})

export default IO