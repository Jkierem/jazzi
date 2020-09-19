import { currySetTypeclass as setTypeclass } from "../_internals"

const mark = setTypeclass("Effect")

const Effect = ({ trivials, identities, overrides }) => mark((cases) => {
    trivials.forEach(trivial => {
        function trivialEffect(fn){
            fn(this.get())
            return this
        }
        const effect = overrides?.effect?.[trivial] || trivialEffect
        cases[trivial].prototype.effect = effect
        cases[trivial].prototype.peak = effect
    })

    identities.forEach(empt => {
        function idEffect(){
            return this
        }
        const effect = overrides?.effect?.[empt] || idEffect
        cases[empt].prototype.effect = effect
        cases[empt].prototype.peak = effect
    })
})

export default mark(Effect)