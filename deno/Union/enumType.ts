import { assoc } from "../_internals/mod.ts";
import Union from "./union.ts";
import Show, { Show as TShow } from "./show.ts";
import Enum, { Enum as TEnum, EnumRep } from "./enum.ts";
import Eq, { Eq as TEq, EqRep } from "./eq.ts";
import Ord, { Ord as TOrd } from "./ord.ts";

interface EnumTypeValue 
extends TEq, TOrd, TEnum, TShow {
    match(patterns: any): any
}

type EnumTypeRep<Cases extends string> = 
    & Record<Cases,EnumTypeValue>
    & EqRep 
    & EnumRep 
    & {
        equals(ea: EnumTypeValue, eb: EnumTypeValue): boolean;
        pred(v: EnumTypeValue): EnumTypeValue | undefined;
        succ(v: EnumTypeValue): EnumTypeValue | undefined;
        range(start: EnumTypeValue, end: EnumTypeValue): EnumTypeValue[];
        fromEnum(en: EnumTypeValue): number;
        toEnum(i: number): EnumTypeValue | undefined;
    }
/**
 * Creates an enum type which is an Union that implements Eq, Ord, Enum, and Show. 
 * Cases are treated as singletons so they are values in the type.
 * @param name Enum name
 * @param cases Cases that inhabit the Enum. 
 */
const EnumType = <K extends string>(name: string, rawCases: readonly K[]) => {
    return Union(
        name,
        rawCases.reduce((acc,next) => assoc(next, () => {}, acc), {} as any),
        [
            Eq({ empties: rawCases as unknown as string[] }),
            Ord({ order: rawCases as unknown as string[] }),
            Enum({ order: rawCases as unknown as string[] }),
            Show({ overrides: {
                show: rawCases.reduce((acc,next) => {
                    return assoc(next,() => `[${name} => ${next}]`,acc as any)
                },{})
            } }),
            (cases,globals) => {
                rawCases.forEach((key) => {
                    globals[key] = new cases[key]();
                })
            }
        ]
    ).constructors({}) as EnumTypeRep<typeof rawCases[number]>
}

export default EnumType