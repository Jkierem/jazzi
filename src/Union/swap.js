import { setTypeclass } from "../_internals"

const Swap = ({ left, right, overrides }) => setTypeclass("Swap",(cases) => {
    function triviallswap(){
        return new cases[right](this.get())
    }
    function trivialrswap(){
        return new cases[left](this.get())
    }
    const lswap = overrides?.swap?.[left]  || triviallswap
    const rswap = overrides?.swap?.[right] || trivialrswap
    cases[left].prototype.swap = lswap
    cases[right].prototype.swap = rswap
})

setTypeclass("Swap",Swap)

export default Swap