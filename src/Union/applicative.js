import { currySetTypeclass as setTypeclass } from "../_internals"

const mark = setTypeclass("Applicative")

const Applicative = ({ trivials, identities, overrides }) => mark((cases) => {
    trivials.forEach(trivial => {
        function trivialApply(other){
            return other?.match?.({
                [trivial]: () => new cases[trivial]( this.get()(other.get()) ) ,
                _: () => other
            })
        }
        const apply = overrides?.apply?.[trivial] || trivialApply
        cases[trivial].prototype.apply = apply
    })
    identities.forEach(empt => {
        function identityApply(){ return this }
        const apply = overrides?.apply?.[empt] || identityApply
        cases[empt].prototype.apply = apply
    })
})

export default mark(Applicative);