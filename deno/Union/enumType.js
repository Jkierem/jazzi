import { assoc } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import Union from "./union.js";
import Show from "./show.js";
import Enum from "./enum.js";
import Eq from "./eq.js";
import Ord from "./ord.js";

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