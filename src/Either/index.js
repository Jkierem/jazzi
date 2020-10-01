import { isNil } from 'ramda'
import { Applicative, Functor, FunctorError, Monad, Show, Swap, Union } from '../Union'

const EitherType = () => (cases,globals) => {
    cases.Right.prototype.ifRight = function(fn){ return this.map(fn) }
    cases.Right.prototype.ifLeft = function(fn){ return this }
    cases.Left.prototype.ifLeft = function(fn){ return this.mapError(fn) }
    cases.Left.prototype.ifRight = function(fn){ return this }

    cases.Right.prototype.mapLeft = function(fn){ return this }
    cases.Left.prototype.mapLeft = function(fn){ return this.mapError(fn) }

    cases.Right.prototype.mapRight = function(fn){ return this.map(fn) }
    cases.Left.prototype.mapRight = function(fn){ return this }

    globals.lefts = (ls) => ls.filter(l => l.isLeft())
    globals.rights = (rs) => rs.filter(r => r.isRight())
    globals.partition = (lrs) => [lrs.filter(l => l.isLeft()), lrs.filter(r => r.isRight())]
}

const Defs = {
    trivials: ["Right"],
    identities: ["Left"],
    errors: ["Left"],
    pure: "Right",   
    left: "Left",
    right: "Right",
    overrides: {
        fold: {
            Left: function(fnLeft,fnRight){ return fnLeft(this.get())},
            Right: function(fnLeft,fnRight){ return fnRight(this.get())}
        }
    }
}

function defaultConstructor(l,r){ return isNil(r) ? this.Left(l) : this.Right(r) }

const Either = Union("Either",
{
    Left: x => x,
    Right: x => x
},
[
    Functor(Defs),
    FunctorError(Defs),
    Applicative(Defs),
    Monad(Defs),
    Swap(Defs),
    Show(Defs),
    EitherType()
]).constructors({
    of: defaultConstructor,
    from: defaultConstructor,
    fromNullish: defaultConstructor,
    fromFalsy(l,r){ return r ? this.Right(r) : this.Left(l) },
    fromPredicate(pred,x){ return pred(x) ? this.Right(x) : this.Left(x) },
    fromMaybe(m){ return m.match({ Just: this.Right, None: this.Left }) },
    fromResult(m){ return m.match({ Ok: this.Right, Err: this.Left }) },
    defaultTo(left){ return (right) => right ? this.Right(right): this.Left(left) },
})

export default Either;