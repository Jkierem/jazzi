import { assoc, identity } from "../_internals/mod.ts";

import Union from "./union.ts";

import Show from "./show.ts";

import Enum, { EnumRep } from "./enum.ts";

import Eq, { EqRep } from "./eq.ts";

import Ord from "./ord.ts";

import Functor from "./functor.ts";

import Tap from "./tap.ts";

import BoxedEnum, { BoxedEnumRep, BoxedEnum as TBoxedEnum } from "./boxedEnum.ts";


export type BoxedEnumTypeRep<Cases extends string> = 
    & BoxedEnumRep<Cases>
    & EqRep
    & EnumRep
    & Record<Cases, <A>(a: A) => TBoxedEnum<A, BoxedEnumTypeRep<Cases>, Cases>>

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