import { getVariant, setTypeclass } from "../_internals"

const Monoid = ({ zero, trivials, identities, overrides }) => setTypeclass("Monoid",(cases,globals) => {
    trivials.forEach(trivial => {
        function trivMappend(m){ return this.concat(m) }
        const mappend = overrides?.mappend?.[trivial] || trivMappend
        cases[trivial].prototype.mappend = mappend
        cases[trivial].prototype.append = mappend
    })
    identities.forEach(empt => {
        function idMappend(m){ return m }
        const mappend = overrides?.mappend?.[empt] || idMappend
        cases[empt].prototype.mappend = mappend
        cases[empt].prototype.append = mappend
    })
    Object.keys(cases).forEach(key => {
        function trivialEmpty(){
            return new cases[zero]()
        }
        const empty = overrides?.empty?.[key] || trivialEmpty;
        cases[key].prototype.empty = empty

        function trivialIsEmpty(){
            return getVariant(this) === zero
        }
        const isEmpty = overrides?.isEmpty?.[key] || trivialIsEmpty
        cases[key].prototype.isEmpty = isEmpty
    })
    globals.empty = function(){ return new cases[zero]() }
})

setTypeclass("Monoid",Monoid)

export default Monoid