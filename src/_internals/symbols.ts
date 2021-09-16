export const InnerValue = Symbol("@@value");
export const Type = Symbol("@@type");
export const TypeName = Symbol("@@typename");
export const Variant = Symbol("@@variant");
export const Typeclass = Symbol("@@typeclass");
export const Typeclasses = Symbol("@@typeclasses");

type WithSymbol<T extends symbol,U> = { [P in T]: U }

export type WithInnerValue = WithSymbol<typeof InnerValue, any>
export type WithType = WithSymbol<typeof Type, () => any>
export type WithTypeName = WithSymbol<typeof TypeName, string>
export type WithVariant = WithSymbol<typeof Variant, string>
export type WithTypeclasses = WithSymbol<typeof Typeclasses, () => string[]>

const getSymbol = <Sym extends symbol>(sym: Sym) => <T>(withSym: Partial<WithSymbol<Sym,T>>): T => withSym[sym]!

export const getInnerValue = getSymbol(InnerValue)
export const getType = getSymbol(Type)
export const getTypeName = getSymbol(TypeName)
export const getVariant = getSymbol(Variant)
export const getTypeclass = getSymbol(Typeclass)
export const getTypeclasses = getSymbol(Typeclasses)

const setSymbol = <Sym extends symbol>(sym: Sym) => <T>(value: T, withSym: Partial<WithSymbol<Sym,T>>): WithSymbol<Sym,T> => {
    (withSym[sym] as T) = value
    return withSym as WithSymbol<Sym,T>
} 

export const setInnerValue = setSymbol(InnerValue)
export const setType = setSymbol(Type)
export const setTypeName = setSymbol(TypeName)
export const setVariant = setSymbol(Variant)
export const setTypeclass = setSymbol(Typeclass)
export const setTypeclasses = setSymbol(Typeclasses)