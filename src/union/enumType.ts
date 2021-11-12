import { assoc } from "../_internals";
import Union from "./union";
import Show, { Show as TShow } from "./show";
import Enum, { Enum as TEnum, EnumRep } from "./enum";
import Eq, { Eq as TEq, EqRep } from "./eq";
import Ord, { Ord as TOrd } from "./ord";
import { Boxed, Matcher } from "../_internals/types";

export interface EnumTypeValue<Cases extends string> 
extends TEq, TOrd, TEnum, TShow, Boxed<undefined,EnumTypeRep<Cases>,Cases>, Matcher<Cases> {
    succ(): EnumTypeValue<Cases>;
    pred(): EnumTypeValue<Cases>;
    getVariant(): Cases;
    getTag(): Cases;
}

export type EnumTypeRep<Cases extends string> = 
    & Record<Cases,EnumTypeValue<Cases>>
    & EqRep 
    & EnumRep 
    & {
        equals(ea: EnumTypeValue<Cases>, eb: EnumTypeValue<Cases>): boolean;
        pred(v: EnumTypeValue<Cases>): EnumTypeValue<Cases> | undefined;
        succ(v: EnumTypeValue<Cases>): EnumTypeValue<Cases> | undefined;
        range(start: EnumTypeValue<Cases>, end: EnumTypeValue<Cases>): EnumTypeValue<Cases>[];
        fromEnum(en: EnumTypeValue<Cases>): number;
        toEnum(i: number): EnumTypeValue<Cases> | undefined;
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