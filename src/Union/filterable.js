import { currySetTypeclass } from "../_internals";

const mark = currySetTypeclass("Filterable")

const Filterable = ({ trivials, identities, overrides }) => mark((cases) => {
    trivials.forEach(trivial => {
        function trivialFilter(fn){
            return new cases[trivial](this.get().filter(fn))
        }
        const filter = overrides?.filter?.[trivial] || trivialFilter;
        cases[trivial].prototype.filter = filter
    });
    identities.forEach(empt => {
        function idFilter(){
            return this
        }
        const filter = overrides?.filter?.[empt] || idFilter;
        cases[empt].prototype.filter = filter
    });
})

export default mark(Filterable)