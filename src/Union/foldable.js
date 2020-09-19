import { currySetTypeclass } from "../_internals"

const mark = currySetTypeclass("Foldable")

const Foldable = ({ overrides }) => mark((cases) => {
    Object.keys(cases).forEach((key) => {
        cases[key].prototype.fold = overrides?.fold?.[key]
    })
})

export default mark(Foldable)