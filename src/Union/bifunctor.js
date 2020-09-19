import { currySetTypeclass as setTypeclass } from "../_internals";

const mark = setTypeclass("Bifunctor")

const Bifunctor = ({ first, second, overrides }) => mark((cases) => {
    function trivialFirst(f,g){
        return new cases[first](f(this.get()))
    }
    function trivialSecond(f,g){
        return new cases[second](g(this.get()))
    }
    const firstMap  = overrides?.bimap?.[first]  || trivialFirst;
    const secondMap = overrides?.bimap?.[second] || trivialSecond;
    cases[first].prototype.bimap = firstMap;
    cases[second].prototype.bimap = secondMap;
})

export default mark(Bifunctor)