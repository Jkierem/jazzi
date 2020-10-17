import { assoc } from "ramda";
import Union from "./union";
import Show from "./show";
import Enum from "./enum";
import Eq from "./eq";
import Ord from "./ord";

const EnumType = (name,rawCases) => {
    return Union(
        name,
        rawCases.reduce((acc,next) => assoc(next,() => {},acc),{}),
        [
            Eq({ empties: rawCases }),
            Ord({ order: rawCases }),
            Enum({ order: rawCases }),
            Show({ overrides: {
                show: rawCases.reduce((acc,next) => {
                    return assoc(next,() => `[${name} => ${next}]`,acc)
                },{})
            } }),
            (cases,globals) => {
                rawCases.forEach((key) => {
                    globals[key] = new cases[key]();
                })
            }
        ]
    ).constructors({})
}

export default EnumType