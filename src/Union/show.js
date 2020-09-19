import { getType, getVariant, getInnerValue, setTypeclass } from "../_internals"

const Show = ({ overrides }) => setTypeclass("Show",(cases) => {
    Object.keys(cases).forEach(trivial => {
        function trivialShow(){
            return `[${getType(this)} => ${getVariant(this)} ${getInnerValue(this)}]`;
        }
        const show = overrides?.show?.[trivial] || trivialShow
        cases[trivial].prototype.show = show
        cases[trivial].prototype.toString = show
    })
})

setTypeclass("Show",Show)

export default Show