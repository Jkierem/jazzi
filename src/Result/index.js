import { equals as rEquals } from 'ramda'
import { Applicative, Bifunctor, Effect, Eq, Filterable, Foldable, Functor, FunctorError, Monad, Show, Swap, Union } from '../Union';
import { match } from '../_tools'

const Defs = {
    right: "Ok",
    left: "Err",
    first: "Ok",
    second: "Err",
    trivials: ["Ok"],
    identities: ["Err"],
    empties: ["Err"],
    errors: ["Err"],
    pure: "Ok",
    overrides: {
        fold: {
            Ok(f,g){ return g(this.get()) },
            Err(f,g){ return f(this.get()) }
        },
        equals: {
            Err(other){
                return other?.match?.({
                    Err: x => rEquals(this.get(),x),
                    _: () => false
                })
            }
        },
        filter: {
            Ok(pred) {
                return pred(this.get()) ? this : this.swap();
            }
        }
    }
}

const Result = Union("Result",{
    Ok : x => x,
    Err: x => x
},[
    Bifunctor(Defs),
    Effect(Defs),
    Eq(Defs),
    Foldable(Defs),
    Functor(Defs),
    FunctorError(Defs),
    Monad(Defs),
    Applicative(Defs),
    Show(Defs),
    Swap(Defs),
    Filterable(Defs)
]).constructors({
    from(val){
        return val instanceof Error ? this.Err(val) : this.Ok(val)
    },
    fromError(val){
        return val instanceof Error ? this.Err(val) : this.Ok(val)
    },
    fromFalsy(val){ 
        return val ? this.Ok(val) : this.Err(val)
    },
    fromPredicate(pred,val){
        return pred(val) ? this.Ok(val) : this.Err(val)
    },
    fromMaybe(m,onNothing){ 
        return m?.match?.({ 
            Just: this.Ok, 
            None: () => this.Err(onNothing)
        }) 
    },
    attempt(f) {
        try {
            return this.Ok(f())
        } catch(e) {
            return this.Err(e)
        }
    },
    match,
    equals: rEquals
})

export default Result