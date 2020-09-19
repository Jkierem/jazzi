import { setTypeclass } from "../_internals"

const Monad = ({ trivials, identities, pure, overrides }) => setTypeclass("Monad",(cases,globals) => {
    trivials.forEach(trivial => {
        function trivialChain(fn){
            return fn(this.get())
        }
        const chain = overrides?.chain?.[trivial] || trivialChain
        cases[trivial].prototype.chain   = chain
        cases[trivial].prototype.bind    = chain
        cases[trivial].prototype.flatMap = chain
    })
    identities.forEach(empt => {
        function idChain(){
            return this
        }
        const chain = overrides?.chain?.[empt] || idChain
        cases[empt].prototype.chain   = chain
        cases[empt].prototype.bind    = chain
        cases[empt].prototype.flatMap = chain
    })
    Object.keys(cases).forEach(key => {
        cases[key].prototype.pure = (...args) => new cases[pure](...args)
    })
    globals.pure = (...args) => new cases[pure](...args)
})

setTypeclass("Monad",Monad)

export default Monad;