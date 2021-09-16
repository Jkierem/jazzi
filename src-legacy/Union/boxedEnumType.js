import assoc from "ramda/src/assoc";
import Union from "./union";
import Show from "./show";
import Enum from "./enum";
import Eq from "./eq";
import Ord from "./ord";
import Functor from "./functor";
import Tap from "./tap"
import BoxedEnum from "./boxedEnum"

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
            Tap({ trivials: rawCases }),
            Show({ trivials: rawCases }),
            BoxedEnum()
        ]
    ).constructors({})
}

export default BoxedEnumType