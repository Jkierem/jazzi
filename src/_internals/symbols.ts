type Key = string | number | symbol

export const Value    = Symbol("@@value");
export const Type     = Symbol("@@type");
export const Variant  = Symbol("@@variant");
export const ValueMap = Symbol("@@valuemap");
export const Env      = Symbol("@@env");
export const ErrorMap = Symbol("@@errormap");
export const Recovery = Symbol("@@recovery");

export type WithSymbol<T extends symbol,U> = { [P in T]: U }

export type WithValue<T> = WithSymbol<typeof Value, T>
export type WithType<TName extends Key> = WithSymbol<typeof Type, TName>
export type WithVariant<VName extends Key> = WithSymbol<typeof Variant, VName>
export type WithEnv<T> = WithSymbol<typeof Env, T>
export type WithValueMap<T> = WithSymbol<typeof ValueMap, T>
export type WithErrorMap<T> = WithSymbol<typeof ErrorMap, T>
export type WithRecovery<T> = WithSymbol<typeof Recovery, T>

export const getSymbol = <Sym extends symbol>(sym: Sym) => <T>(withSym: T): T extends WithSymbol<Sym, infer U> ? U : undefined => (withSym as any)?.[sym]!

export const getValue = getSymbol(Value)
export const getType = getSymbol(Type)
export const getVariant = getSymbol(Variant)
export const getEnvironment = getSymbol(Env)
export const getValueMap = getSymbol(ValueMap)
export const getErrorMap = getSymbol(ErrorMap)
export const getRecovery = getSymbol(Recovery)

export const setSymbol = <Sym extends symbol>(sym: Sym) => <T>(value: T) => <U>( withSym: U): U & WithSymbol<Sym,T> => {
    (withSym as any)[sym] = value
    return withSym as U & WithSymbol<Sym,T>
} 

export const setValue = setSymbol(Value)
export const setType = setSymbol(Type)
export const setVariant = setSymbol(Variant)
export const setEnvironment = setSymbol(Env)
export const setValueMap = setSymbol(ValueMap)
export const setErrorMap = setSymbol(ErrorMap)
export const setRecovery = setSymbol(Recovery)