import { assoc, identity } from "../_internals";
import Union from "./union";
import Show from "./show";
import Enum, { EnumRep } from "./enum";
import Eq, { EqRep } from "./eq";
import Ord from "./ord";
import Functor from "./functor";
import Tap from "./tap"
import BoxedEnum, { BoxedEnumRep, BoxedEnum as TBoxedEnum } from "./boxedEnum"

type BoxedEnumTypeRep<Cases extends string> = 
    & BoxedEnumRep 
    & EqRep
    & EnumRep
    & Record<Cases, <A>(a: A) => TBoxedEnum<A>>

/**
 * Creates an enum type that can contain a value.
 * Implements Eq, Ord, Enum, Functor, Tap, BoxedEnum and Show
 * @param {*} name 
 * @param {*} rawCases 
 * @returns 
 */
const BoxedEnumType = <K extends string>(name: string, rawCases: readonly K[]) => {
    return Union(
        name,
        rawCases.reduce((acc,next) => assoc(next, identity, acc),{} as any),
        [
            Eq({ trivials: rawCases as unknown as string[] }),
            Ord({ order: rawCases as unknown as string[] }),
            Enum({ order: rawCases as unknown as string[] }),
            Functor({ trivials: rawCases as unknown as string[] }),
            Tap({ trivials: rawCases as unknown as string[] }),
            Show({}),
            BoxedEnum()
        ]
    ).constructors({}) as BoxedEnumTypeRep<K>
}

export default BoxedEnumType