import { extractWith, getInnerValue } from "../_internals";
import { Union, Monad, Applicative, Functor, Show, Effect } from "../Union";
import { compose } from "ramda";

const IODefs = {
    trivials: ["IO"],
    identities: [],
    pure: "IO",
    lazy: true,
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
        },
        run: {
            IO(){ return this.get()() }
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
    Effect(IODefs)
]).constructors({
    of: defaultIO,
    from: defaultIO,
})

export default IO