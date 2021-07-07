import assoc from "https://deno.land/x/ramda@v0.27.2/source/assoc.js";
import Union from "./union.js";
import Show from "./show.js";
import Enum from "./enum.js";
import Eq from "./eq.js";
import Ord from "./ord.js";
import Functor from "./functor.js";
import Effect from "./effect.js";
import BoxedEnum from "./boxedEnum.js";

/**
 * Creates an enum type that can contain a value. Also a functor.
 * @param {*} name 
 * @param {*} rawCases 
 * @returns 
 */
const BoxedEnumType = (name,rawCases) => {
    return Union(
        name,
        rawCases.reduce((acc,next) => assoc(next,x => x,acc),{}),
        [
            Eq({ trivials: rawCases }),
            Ord({ order: rawCases }),
            Enum({ order: rawCases }),
            Functor({ trivials: rawCases }),
            Effect({ trivials: rawCases }),
            Show({ trivials: rawCases }),
            BoxedEnum()
        ]
    ).constructors({})
}

export default BoxedEnumType