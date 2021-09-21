import type { Key } from "../_internals/types"
import { InnerValue, setInnerValue, setTypeclasses, setTypeName, setTypeRep, setVariant, Typeclass, Typeclasses, TypeName, TypeRep, Variant } from "../_internals/symbols"
import type {
    WithInnerValue,
    WithTypeName,
    WithVariant,
    WithTypeRep,
    WithTypeclass,
    WithTypeclasses
} from "../_internals/symbols"

type AnyFn = (...args: any[]) => any

type FunctionContainer = Record<string, AnyFn>

type TypeclassIDs = readonly string[]

type UnionMember<
    TName extends Key,
    VName extends Key,
    InnerValue,
    Cases extends FunctionContainer,
    TCS extends TypeclassIDs
> = WithTypeName<TName> 
    & WithVariant<VName> 
    & WithInnerValue<InnerValue>
    & WithTypeRep<TypeRep<TName, Cases, TCS>>
    & WithTypeclasses<TCS>

type Typeclass<T extends string> = WithTypeclass<T>

type TypeRep<TName extends Key, T extends FunctionContainer, TCS extends TypeclassIDs> = {
    [K in keyof T]: new (...args: Parameters<T[K]>) => UnionMember<TName,K,ReturnType<T[K]>, T, TCS>
} & {
    implements: <TC extends string>(tc: Typeclass<TC>) => TypeRep<TName, T, [...TCS, TC]>
}

type UnionDefinition<Cases extends FunctionContainer, Name extends string> = {
    name: Name,
    cases: Cases,
}

export const Union = <Cases extends FunctionContainer, Name extends string>(def: UnionDefinition<Cases, Name>) => {
    const { cases, name } = def;
    const typeRep = Object.keys(cases).reduce((acc, key: keyof Cases) => {
        const inner: any = cases[key]
        (acc as any)[key] = class {
            constructor(...args: Parameters<typeof inner>){
                setTypeName(name, this)
                setVariant(key, this)
                setInnerValue(inner(...args), this)
                setTypeRep(() => typeRep, this)
                setTypeclasses(() => [], this)
            }
        } as new (...args: Parameters<Cases[keyof Cases]>) => UnionMember<
            typeof name,
            typeof key,
            ReturnType<typeof inner>,
            Cases,
            []
        >
        return acc;
    }, {} as TypeRep<typeof name, Cases, []>)

    return typeRep
}

const Box = Union({
    name: "Box",
    cases: {
        V1: (x: number) => x,
        V2: (_: string) => ""
    }
}).implements({ [Typeclass]: "Functor" })

const a = new Box.V1(42)
const b = new Box.V2("")