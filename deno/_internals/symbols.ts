type Key = string | number | symbol

export const InnerValue = Symbol("@@value");
export const TypeRep = Symbol("@@type");
export const TypeName = Symbol("@@typename");
export const Variant = Symbol("@@variant");
export const Typeclass = Symbol("@@typeclass");
export const Typeclasses = Symbol("@@typeclasses");

type WithSymbol<T extends symbol,U> = { [P in T]: U }

export type WithInnerValue<T> = WithSymbol<typeof InnerValue, T>
export type WithTypeRep<Rep> = WithSymbol<typeof TypeRep, Rep>
export type WithTypeName<TName extends Key> = WithSymbol<typeof TypeName, TName>
export type WithVariant<VName extends Key> = WithSymbol<typeof Variant, VName>
export type WithTypeclasses<TCS extends () => readonly string[]> = WithSymbol<typeof Typeclasses, () => TCS>
export type WithTypeclass<TCName extends Key> = WithSymbol<typeof Typeclass, TCName>

const getSymbol = <Sym extends symbol>(sym: Sym) => <T>(withSym: T): T extends WithSymbol<Sym, infer U> ? U : undefined => (withSym as any)[sym]!

export const getInnerValue = getSymbol(InnerValue)
export const getTypeRep = getSymbol(TypeRep)
export const getTypeName = getSymbol(TypeName)
export const getVariant = getSymbol(Variant)
export const getTypeclass = getSymbol(Typeclass)
export const getTypeclasses = getSymbol(Typeclasses)

const setSymbol = <Sym extends symbol>(sym: Sym) => <T>(value: T) => <U>( withSym: U): U & WithSymbol<Sym,T> => {
    (withSym as any)[sym] = value
    return withSym as U & WithSymbol<Sym,T>
} 

export const setInnerValue = setSymbol(InnerValue)
export const setTypeRep = (t: any) => (val: any) => {
    Object.defineProperty(val,TypeRep,{
        get: () => t()
    })
};
export const setTypeName = setSymbol(TypeName)
export const setVariant = setSymbol(Variant)
export const setTypeclass = setSymbol(Typeclass)
export const setTypeclasses = setSymbol(Typeclasses)

export const setRepHasInstance = (rep: any) => {
    Object.defineProperty(rep, Symbol.hasInstance, {
        value: (instance: WithTypeRep<any>) => {
            return getTypeRep(instance) === rep
        }
    })
}

export const setCaseHasInstance = (Case: any) => {
    Object.defineProperty(Case, Symbol.hasInstance, {
        value: (instance: WithVariant<string>) => {
            return getVariant(instance) === getVariant(Case) 
                && getTypeRep(instance) === getTypeRep(Case)
        }
    })
}