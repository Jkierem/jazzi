import { assoc } from "../_internals/mod.ts";
import Union from "./union.ts";
import Show, { Show as TShow } from "./show.ts";
import Enum, { Enum as TEnum, EnumRep } from "./enum.ts";
import Eq, { Eq as TEq, EqRep } from "./eq.ts";
import Ord, { Ord as TOrd } from "./ord.ts";
import { Boxed, Matcher } from "../_internals/types.ts";

export interface EnumValue<Cases extends string> 
extends TEq, TOrd, TEnum, TShow, Boxed<undefined,EnumTypeRep<Cases>,Cases>, Matcher<Cases> {
    succ(): EnumValue<Cases> | undefined;
    pred(): EnumValue<Cases> | undefined;
    getVariant(): Cases;
    getTag(): Cases;
}

export type EnumTypeRep<Cases extends string> = 
    & Record<Cases,EnumValue<Cases>>
    & EqRep 
    & EnumRep 
    & {
        equals(ea: EnumValue<Cases>, eb: EnumValue<Cases>): boolean;
        pred(v: EnumValue<Cases>): EnumValue<Cases> | undefined;
        succ(v: EnumValue<Cases>): EnumValue<Cases> | undefined;
        range(start: EnumValue<Cases>, end: EnumValue<Cases>): EnumValue<Cases>[];
        fromEnum(en: EnumValue<Cases>): number;
        toEnum(i: number): EnumValue<Cases> | undefined;
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
                    cases[key].prototype.getTag = () => key
                    cases[key].prototype.getVariant = () => key
                })
            }
        ]
    ).constructors({}) as EnumTypeRep<typeof rawCases[number]>
}

export default EnumType